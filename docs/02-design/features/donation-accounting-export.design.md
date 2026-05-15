---
template: design
version: 1.2
description: donation-accounting-export Design 문서 — 회계프로그램 3종 양식 일괄 다운로드 설계
feature: donation-accounting-export
date: 2026-05-15
author: zealnutkim
project: Ohjunseok 선거사무소
version: 0.1
---

# donation-accounting-export Design Document

> **Summary**: 회계프로그램이 요구하는 **3종 엑셀 양식**(수입지출처, 수입내역(기명), 익명수입자)을 `public/templates/` 원본 파일을 fetch해 템플릿으로 그대로 활용하고, 데이터 행만 채워 다운로드한다.
>
> **Project**: Ohjunseok 선거사무소 사이트
> **Version**: 0.1
> **Author**: zealnutkim
> **Date**: 2026-05-15
> **Status**: Draft
> **Planning Doc**: [donation-accounting-export.plan.md](../../01-plan/features/donation-accounting-export.plan.md)

### Plan 결정사항 (확정 반영)

| Plan 의문점 | 확정 |
|------------|------|
| 1. 양식 처리 방식 | **(B) 양식 .xlsx fetch → 템플릿 사용** |
| 2. 익명 기부자 처리 | **별도 양식(`익명수입자일괄등록_양식.xlsx`) 사용** — 회계 담당자가 양식 폴더에 추가함 |
| 3. 양식 파일 위치 이동 | **승인 — `public/templates/`로 이동 완료** |

---

## 1. Overview

### 1.1 Design Goals

- **양식 일치 100%**: 회계프로그램이 요구하는 헤더·시트명·시트 개수·유의사항 행·`DB` 시트를 한 글자도 변경하지 않는다 (양식 파일을 직접 읽어 데이터만 채움으로써 보장).
- **3종 출력 분리**: 데이터 1개 소스(`donations` 테이블)에서 3개 출력(수입지출처 / 수입내역 기명 / 익명수입자)을 생성.
- **중복 자동 제거**: 수입지출처는 동일인 1행만 등록되도록 자동 dedupe.
- **재사용성**: `xlsx` 라이브러리 한 곳에서 양식 로드/데이터 삽입/다운로드 로직을 모아 향후 다른 양식 추가가 쉬움.

### 1.2 Design Principles

- **Convention over configuration**: 양식 파일이 곧 스펙. 코드에는 데이터 매핑 규칙만 둠.
- **Single source of truth**: 헤더 문자열을 코드에 박지 않고 양식의 헤더 행 위치(시트별 데이터 시작 행)만 상수로 관리.
- **Fail-safe**: 양식 fetch 실패·헤더 불일치·데이터 0건 시 명확한 에러 메시지.
- **순수 함수 분리**: 데이터 변환은 순수 함수, fetch/다운로드 트리거는 React 컴포넌트 측에서만.

---

## 2. Architecture

### 2.1 Component Diagram

```
┌────────────────────────────────────┐
│  /admin/donations (page.tsx)       │
│  ─ 다운로드 버튼 3종 + 통합 버튼      │
└──────────────┬─────────────────────┘
               │ (1) adminGet("table=donations&action=all")
               ▼
┌────────────────────────────────────┐
│  Donation[]  (Domain)              │
└──────────────┬─────────────────────┘
               │ (2) transform
               ▼
┌────────────────────────────────────┐
│  lib/donation-export.ts            │
│    ├── dedupeDonors()              │
│    ├── ridToBirth()                │
│    ├── formatDateDot()             │
│    ├── loadTemplate(url)           │
│    ├── toExpenseSourceXlsx()       │
│    ├── toNamedIncomeXlsx()         │
│    └── toAnonIncomeXlsx()          │
└──────────────┬─────────────────────┘
               │ (3) fetch(/templates/*.xlsx)
               ▼
┌────────────────────────────────────┐
│  public/templates/                 │
│   ├── 수입지출처_일괄등록_양식.xlsx   │
│   ├── 수입내역_일괄등록_양식.xlsx     │
│   └── 익명수입자일괄등록_양식.xlsx    │
└──────────────┬─────────────────────┘
               │ (4) XLSX.write → Blob → download
               ▼
            사용자 PC
```

### 2.2 Data Flow

```
[Admin Click]
    │
    ▼
fetchAll() ── adminGet("table=donations&action=all") ──> Donation[]
    │
    ├── 분기 1: 수입지출처 ─ dedupeDonors(named) ─> rows ─┐
    ├── 분기 2: 수입내역 기명 ─ named.map(toIncomeRow) ───┤
    └── 분기 3: 익명수입자 ─ anon.map(toAnonRow) ─────────┤
                                                          │
    ┌─────────────────────────────────────────────────────┘
    ▼
fetch('/templates/{name}.xlsx') ─> ArrayBuffer ─> XLSX.read()
    │
    ▼
XLSX.utils.sheet_add_aoa(ws, rows, { origin: { r: dataStartRow, c: 0 } })
    │
    ▼
XLSX.write(wb, { type:'array' }) ─> Blob ─> URL.createObjectURL ─> <a download>
```

### 2.3 Dependencies

| 컴포넌트 | 의존 | 목적 |
|---------|------|------|
| `page.tsx` | `lib/donation-export.ts`, `@/lib/admin-fetch` | UI에서 다운로드 트리거 |
| `lib/donation-export.ts` | `xlsx` | 양식 읽기/쓰기 |
| `lib/donation-export.ts` | `fetch` (브라우저 내장) | 양식 fetch |
| 양식 fetch | `/templates/*.xlsx` (public/) | Next.js가 자동 서빙 |

---

## 3. Data Model

### 3.1 Entity Definition (재사용)

```typescript
// 기존 page.tsx의 인터페이스 그대로 사용
interface Donation {
  id: string;
  donor_name: string;
  resident_id: string;       // "900101-1234567" 형식 (하이픈 포함 가능)
  phone: string;
  address: string;
  detail_address: string | null;
  postal_code: string | null;
  is_anonymous: boolean;
  email: string | null;
  amount: number;
  deposit_date: string;       // ISO 날짜 "YYYY-MM-DD"
  created_at: string;
}

// 수입지출처 양식 1행 (9열)
type ExpenseSourceRow = [
  구분: string,              // "개인"
  성명: string,              // donor_name
  생년월일: string,           // ridToBirth(resident_id), 없으면 ""
  직업: string,              // "" (현재 DB 미보유)
  우편번호: string,
  주소: string,
  상세주소: string,
  전화번호: string,           // 하이픈 제거된 숫자
  비고: string,              // email or ""
];

// 수입내역(기명) 양식 1행 (16열)
type NamedIncomeRow = [
  계정: "수입",
  과목: "기명후원금",
  수입일자: string,           // "YYYY.MM.DD"
  내역: "후원",
  수입제공자: string,         // donor_name
  생년월일사업자번호: string,
  우편번호: string,
  주소: string,
  상세주소: string,
  직업: "",
  전화번호: string,
  금액: number,
  증빙서첨부: "Y",
  영수증번호: "",
  수입지출처구분: "개인",
  비고: string,              // email or ""
];

// 익명수입자 양식 1행 (16열) - "수입 내역 일괄등록" 시트
type AnonIncomeRow = [
  계정: "수입",
  과목: "익명후원금",
  수입일자: string,           // "YYYY.MM.DD"
  내역: "후원",
  수입제공자: "익명",
  생년월일사업자번호: "",
  우편번호: "",
  주소: "",
  상세주소: "",
  직업: "",
  전화번호: "",
  금액: number,
  증빙서첨부: "N",
  영수증번호: "익명",
  수입지출처구분: "개인",
  비고: "",
];

// 익명수입자 양식 Sheet2 행 (2열) - 실명 백업
type AnonBackupRow = [
  수입일자: string,           // "YYYY.MM.DD"
  실제수입제공자: string,      // donor_name (실명 보존)
];
```

### 3.2 양식별 데이터 시작 행 (양식 분석 결과)

| 양식 파일 | 시트명 | 헤더 행 | 데이터 시작 행 | 컬럼 수 |
|-----------|--------|---------|---------------|---------|
| 수입지출처_일괄등록_양식.xlsx | `수입지출처 일괄등록` | R1 | **R2** | 9 |
| 수입내역_일괄등록_양식.xlsx | `수입 내역 일괄등록` | R5 (R1-R4는 유의사항) | **R6** | 16 |
| 수입내역_일괄등록_양식.xlsx | `DB` | (DB용, 건드리지 않음) | — | — |
| 익명수입자일괄등록_양식.xlsx | `수입 내역 일괄등록` | R1 | **R2** | 16 |
| 익명수입자일괄등록_양식.xlsx | `Sheet2` | R1 (`*수입일자`, `*수입제공자`) | **R2** | 2 |
| 익명수입자일괄등록_양식.xlsx | `Sheet3` | (빈 시트) | — | — |

> ⚠️ 데이터 시작 행은 양식 변경에 매우 민감. 양식 변경 시 `TEMPLATE_META` 상수만 수정.

### 3.3 정규화 규칙

| 필드 | 규칙 |
|------|------|
| `donor_name` | 양 끝 공백 trim |
| `resident_id` → 생년월일 | `ridToBirth()` 재사용. 길이 < 8이면 `""` |
| `phone` | 모든 비숫자 제거 (`replace(/\D/g, "")`) |
| `deposit_date` → 수입일자 | `formatDateDot()` 재사용 ("YYYY.MM.DD") |
| `postal_code` | `null` → `""` |
| `address` / `detail_address` | `null` → `""` |
| `amount` | 숫자 그대로 (양식 유의사항: "10000 O, 만원 X") |
| `email` | `null` → `""` (비고에 사용) |

### 3.4 중복 제거 키 (수입지출처)

```typescript
function dedupeKey(d: Donation): string {
  const rid = (d.resident_id || "").replace(/\D/g, "");
  if (rid.length >= 13) return `RID:${rid}`;
  const phone = d.phone.replace(/\D/g, "");
  if (phone.length >= 9) return `PHONE:${phone}`;
  // 최후 폴백: 이름 + 주소 (개인정보 불완전)
  return `NAME:${d.donor_name}|ADDR:${d.address}`;
}
```

> 동일 키 발견 시 **가장 최근 입금일 행**의 메타데이터(주소, 전화)를 채택.

---

## 4. API Specification

신규 API 추가 없음. 기존 `adminGet("table=donations&action=all")` 사용 (전체 조회).

> ⚠️ 페이지네이션 없이 전체를 받아오므로, 향후 1만 건 이상으로 늘면 별도 청크 다운로드 API 도입 검토. 현재 선거 사이클상 1,000건 미만 예상.

---

## 5. UI/UX Design

### 5.1 헤더 영역 버튼 변경

**기존** (page.tsx 332-369):
```
[기명 XLS] [익명 XLS] [CSV] [+ 새 후원자 등록]
```

**변경 후**:
```
[수입지출처 XLS] [수입내역(기명) XLS] [익명수입자 XLS] [📦 일괄 다운로드] [CSV] [+ 새 후원자 등록]
```

- **수입지출처 XLS**: 회계프로그램 등록용. 기명 기부자만, 중복 제거.
- **수입내역(기명) XLS**: 기명 기부자의 입금 내역.
- **익명수입자 XLS**: 익명 기부자 입금 내역 + `Sheet2`에 실명 백업.
- **📦 일괄 다운로드**: 위 3개를 순서대로 모두 다운로드 (선택 사항, Phase 2).
- **CSV**: 백업/검수용으로 유지.

### 5.2 사용자 흐름

```
1. 관리자가 /admin/donations 진입
2. 좌측 상단: 총 건수, 합계 확인
3. 우측 상단의 [수입지출처 XLS] 클릭
   → "다운로드 중..." 표시 → 파일 받음
4. [수입내역(기명) XLS] 클릭 → 파일 받음
5. [익명수입자 XLS] 클릭 → 파일 받음
6. 회계프로그램에서 각 파일 import
```

### 5.3 컴포넌트 분담

| 컴포넌트/모듈 | 위치 | 책임 |
|--------------|------|------|
| `AdminDonations` (page.tsx) | `src/app/admin/donations/page.tsx` | UI, 버튼 클릭 핸들러, 로딩 상태 |
| `donation-export` | `src/app/admin/donations/lib/donation-export.ts` | 양식 fetch, 데이터 변환, .xlsx 생성 |
| `DownloadButton` | (인라인, 별도 분리 안 함) | 버튼 + 로딩 표시 (Tailwind) |

### 5.4 로딩/에러 UX

- 다운로드 시작 시 해당 버튼 `disabled` + 텍스트 "..." (기존 로직 재사용).
- 양식 fetch 실패 → `alert("양식 파일을 불러올 수 없습니다. 새로고침 후 다시 시도해주세요.")`.
- 데이터 0건 → 버튼 disabled (`count === 0`).
- 익명 0건 등 부분 0건 → 버튼은 활성화하되 파일 생성 시 `alert("내보낼 데이터가 없습니다.")` 후 중단.

---

## 6. Error Handling

### 6.1 에러 코드/케이스

| 케이스 | 사용자 메시지 | 처리 |
|--------|--------------|------|
| 양식 fetch 404 | "양식 파일을 찾을 수 없습니다. 관리자에게 문의하세요." | `console.error` + alert |
| 양식 파싱 실패 (`XLSX.read` 예외) | "양식 파일이 손상되었습니다." | alert + 로그 |
| 데이터 fetch 실패 (`adminGet`) | "후원자 목록을 불러오지 못했습니다." | 기존 흐름 동일 |
| 데이터 0건 | "내보낼 데이터가 없습니다." | alert, 파일 미생성 |
| 익명 양식의 Sheet2가 양식에서 사라짐 | "양식 구조가 변경되었습니다. 관리자에게 문의하세요." | 시트 존재 체크 후 alert |

### 6.2 헤더 검증 (FR-10)

다운로드 전, 양식의 헤더 셀 값을 코드 상수와 비교하는 dev-only 검증 함수:

```typescript
function verifyTemplate(wb: XLSX.WorkBook, meta: TemplateMeta): void {
  if (process.env.NODE_ENV === "production") return;
  const ws = wb.Sheets[meta.sheetName];
  if (!ws) throw new Error(`Sheet "${meta.sheetName}" missing`);
  // 헤더 셀 비교 (R{headerRow}의 모든 컬럼)
  for (let c = 0; c < meta.expectedHeaders.length; c++) {
    const cell = XLSX.utils.encode_cell({ r: meta.headerRow - 1, c });
    const actual = ws[cell]?.v;
    const expected = meta.expectedHeaders[c];
    if (actual !== expected) {
      console.warn(`[template] header mismatch @${cell}: expected="${expected}" actual="${actual}"`);
    }
  }
}
```

운영 환경에서는 워닝만 남기고 진행. 양식 변경 감지용.

---

## 7. Security Considerations

- [x] 관리자 전용 페이지(`/admin/donations`)에서만 호출 — 기존 미들웨어 인증 통과 후 접근.
- [x] `adminGet`이 토큰 검증 — 별도 작업 불필요.
- [x] 주민번호는 다운로드 파일에 **생년월일 8자리만** 기록 (양식 요구사항). 전체 13자리는 .xlsx에 들어가지 않음.
- [x] CSV는 13자리 포함 — 기존 동작 유지 (검수용, 관리자 책임 범위).
- [ ] `public/templates/` 폴더 노출: 양식 파일은 공개되어도 무방한 빈 양식이므로 리스크 없음.
- [ ] 다운로드 파일에는 익명 기부자의 실명이 `Sheet2`에 포함됨 → **회계 담당자만 열람** 책임 명시 (UI에 안내 문구 추가).
- [ ] XSS: 양식 → 셀 값 그대로 삽입하지만 `xlsx` 라이브러리가 escape 처리. 위험 없음.

---

## 8. Test Plan

### 8.1 테스트 범위

| 유형 | 대상 | 도구 |
|------|------|------|
| 수동 테스트 | 3가지 다운로드 버튼 작동, 파일 열어서 확인 | Excel/Numbers/LibreOffice |
| 양식 일치 검증 | 양식 원본 vs 생성 파일 헤더·시트명·시트 개수 | `verifyTemplate` 함수 |
| 회계프로그램 import | 실제 import 1회 | 회계프로그램 |
| 단위 검증 (수동) | `dedupeDonors`, `ridToBirth`, `formatDateDot` | 콘솔 |

### 8.2 핵심 테스트 케이스

- [ ] **Happy path**: 기명 5건 + 익명 3건 → 3개 파일 다운로드 성공, 각 파일이 양식과 동일 구조.
- [ ] **수입지출처 중복 제거**: 동일 인물 3회 기부 → 1행만 등록됨.
- [ ] **주민번호 결측**: `resident_id` 빈 문자열 → 생년월일 칸 빈 채로 출력, 에러 없음.
- [ ] **전화번호 하이픈**: "010-1234-5678" → "01012345678"로 출력.
- [ ] **0건**: 익명 데이터 0건 → 익명 버튼 클릭 시 alert.
- [ ] **양식 변경 감지**: 양식 파일 헤더 한 글자 수정 후 dev 환경에서 워닝 출력 확인.
- [ ] **Sheet2 백업 검증**: 익명 5건 → `익명수입자일괄등록_양식` 의 Sheet2에 5행의 실명 백업.

---

## 9. Clean Architecture

### 9.1 레이어 배치

| 레이어 | 책임 | 위치 |
|--------|------|------|
| **Presentation** | UI, 버튼, 로딩 상태 | `src/app/admin/donations/page.tsx` |
| **Application** | 변환·dedupe·파일 생성 오케스트레이션 | `src/app/admin/donations/lib/donation-export.ts` |
| **Domain** | `Donation` 타입, 정규화 규칙 | 동일 파일 내 타입 (기존 페이지에 이미 존재) |
| **Infrastructure** | `xlsx` 라이브러리, `fetch`, `adminGet` | 직접 호출 (래퍼 불필요한 작은 기능) |

> Dynamic 레벨이지만 본 기능은 단일 페이지의 부수 기능이라 `features/` 분리 대신 `admin/donations/lib/`에 배치.

### 9.2 의존 규칙

- `page.tsx` → `lib/donation-export.ts` (단방향)
- `lib/donation-export.ts` → React 의존 없음 (순수 함수). 테스트 용이.

---

## 10. Coding Convention Reference

### 10.1 본 기능 컨벤션

| 항목 | 적용 |
|------|------|
| 파일 명명 | `donation-export.ts` (kebab-case utility) |
| 함수 명명 | `toExpenseSourceXlsx`, `toNamedIncomeXlsx`, `toAnonIncomeXlsx` (camelCase, `to{Output}` 패턴) |
| 양식 메타 상수 | `TEMPLATE_META.expenseSource`, `.namedIncome`, `.anonIncome` (UPPER_SNAKE 아닌 PascalCase 객체) |
| 비동기 | `async/await` (기존 핸들러 패턴 일치) |
| 에러 처리 | `try/catch + alert` (기존 핸들러 패턴 유지) |

### 10.2 신규 import

- `import * as XLSX from "xlsx"` (이미 사용 중)
- `import { ... } from "./lib/donation-export"` (신규 모듈)

---

## 11. Implementation Guide

### 11.1 파일 구조 (최종)

```
src/app/admin/donations/
  ├── page.tsx                      # UI (수정 — 다운로드 핸들러만 교체)
  └── lib/
      ├── donation-export.ts        # (신규) 메인 export 함수들
      └── template-meta.ts          # (신규) 양식 메타 상수

public/templates/
  ├── 수입지출처_일괄등록_양식.xlsx     # (이동 완료)
  ├── 수입내역_일괄등록_양식.xlsx       # (이동 완료)
  └── 익명수입자일괄등록_양식.xlsx      # (이동 완료)
```

### 11.2 양식 메타 상수 (template-meta.ts)

```typescript
export const TEMPLATE_META = {
  expenseSource: {
    url: "/templates/수입지출처_일괄등록_양식.xlsx",
    sheetName: "수입지출처 일괄등록",
    headerRow: 1,
    dataStartRow: 2,
    columnCount: 9,
    fileNamePrefix: "수입지출처",
  },
  namedIncome: {
    url: "/templates/수입내역_일괄등록_양식.xlsx",
    sheetName: "수입 내역 일괄등록",
    headerRow: 5,
    dataStartRow: 6,
    columnCount: 16,
    fileNamePrefix: "수입내역_기명",
  },
  anonIncome: {
    url: "/templates/익명수입자일괄등록_양식.xlsx",
    sheetName: "수입 내역 일괄등록",
    headerRow: 1,
    dataStartRow: 2,
    columnCount: 16,
    backupSheetName: "Sheet2",
    backupHeaderRow: 1,
    backupDataStartRow: 2,
    fileNamePrefix: "익명수입자",
  },
} as const;
```

### 11.3 핵심 함수 시그니처

```typescript
// donation-export.ts
import * as XLSX from "xlsx";
import { TEMPLATE_META } from "./template-meta";
import type { Donation } from "../page"; // 기존 타입 재사용 또는 types로 추출

// 양식 fetch + 파싱
async function loadTemplate(url: string): Promise<XLSX.WorkBook> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Template fetch failed: ${url}`);
  const buf = await res.arrayBuffer();
  return XLSX.read(buf, { type: "array" });
}

// 시트 특정 행부터 데이터 삽입 (기존 셀 보존)
function appendRowsAt(
  ws: XLSX.WorkSheet,
  rows: (string | number)[][],
  startRow: number  // 1-based
): void {
  XLSX.utils.sheet_add_aoa(ws, rows, {
    origin: { r: startRow - 1, c: 0 },
  });
}

// 중복 제거 (수입지출처용)
function dedupeDonors(donors: Donation[]): Donation[] { /* ... */ }

// 정규화 헬퍼
function ridToBirth(rid: string): string { /* 기존 page.tsx에서 이동 */ }
function formatDateDot(date: string): string { /* 기존 page.tsx에서 이동 */ }
function digits(s: string): string { return (s || "").replace(/\D/g, ""); }

// === 3가지 export 함수 ===

export async function toExpenseSourceXlsx(donors: Donation[]): Promise<ArrayBuffer> {
  const meta = TEMPLATE_META.expenseSource;
  const named = donors.filter((d) => !d.is_anonymous);
  const unique = dedupeDonors(named);
  const rows = unique.map((d): (string | number)[] => [
    "개인",
    d.donor_name.trim(),
    ridToBirth(d.resident_id),
    "", // 직업
    d.postal_code ?? "",
    d.address ?? "",
    d.detail_address ?? "",
    digits(d.phone),
    d.email ?? "",
  ]);
  const wb = await loadTemplate(meta.url);
  appendRowsAt(wb.Sheets[meta.sheetName], rows, meta.dataStartRow);
  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}

export async function toNamedIncomeXlsx(donors: Donation[]): Promise<ArrayBuffer> {
  const meta = TEMPLATE_META.namedIncome;
  const named = donors.filter((d) => !d.is_anonymous);
  const rows = named.map((d): (string | number)[] => [
    "수입", "기명후원금", formatDateDot(d.deposit_date), "후원",
    d.donor_name, ridToBirth(d.resident_id),
    d.postal_code ?? "", d.address ?? "", d.detail_address ?? "",
    "", d.phone, d.amount, "Y", "", "개인", d.email ?? "",
  ]);
  const wb = await loadTemplate(meta.url);
  appendRowsAt(wb.Sheets[meta.sheetName], rows, meta.dataStartRow);
  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}

export async function toAnonIncomeXlsx(donors: Donation[]): Promise<ArrayBuffer> {
  const meta = TEMPLATE_META.anonIncome;
  const anon = donors.filter((d) => d.is_anonymous);
  // 시트1: 익명 데이터
  const mainRows = anon.map((d): (string | number)[] => [
    "수입", "익명후원금", formatDateDot(d.deposit_date), "후원",
    "익명", "", "", "", "", "", "", d.amount, "N", "익명", "개인", "",
  ]);
  // 시트2: 실명 백업 (수입일자, 실제 수입제공자)
  const backupRows = anon.map((d): string[] => [
    formatDateDot(d.deposit_date),
    d.donor_name?.trim() || "(미입력)",
  ]);
  const wb = await loadTemplate(meta.url);
  appendRowsAt(wb.Sheets[meta.sheetName], mainRows, meta.dataStartRow);
  if (meta.backupSheetName && wb.Sheets[meta.backupSheetName]) {
    appendRowsAt(wb.Sheets[meta.backupSheetName], backupRows, meta.backupDataStartRow);
  }
  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}
```

### 11.4 구현 순서

1. [ ] `public/templates/` 양식 파일 fetch 정상 확인 (브라우저에서 직접 URL 입력 테스트)
2. [ ] `src/app/admin/donations/lib/template-meta.ts` 작성
3. [ ] `src/app/admin/donations/lib/donation-export.ts` 작성 (위 함수들 + dedupe)
4. [ ] `page.tsx`에서 기존 `toNamedXlsx`/`toAnonXlsx`/`XLS_HEADERS` 제거하고 새 함수 import
5. [ ] 핸들러 3개로 교체: `handleDownloadExpenseSource`, `handleDownloadNamedIncome`, `handleDownloadAnonIncome`
6. [ ] 헤더 영역 버튼 3개로 교체
7. [ ] 로컬에서 mock 데이터 또는 실제 DB로 3개 파일 다운로드 → Excel/LibreOffice로 열어서 양식과 동일한지 시각 확인
8. [ ] (선택) "📦 일괄 다운로드" 버튼 추가 — 3개 함수 직렬 호출
9. [ ] `verifyTemplate` 호출 추가 (dev 환경 워닝)
10. [ ] 회계 담당자에게 파일 1세트 전달, 회계프로그램 import 성공 확인

### 11.5 변경 영향 파일 목록

| 파일 | 변경 종류 |
|------|----------|
| `src/app/admin/donations/page.tsx` | 수정 (헬퍼 함수 4개 제거 → import로 교체, 핸들러·버튼 교체) |
| `src/app/admin/donations/lib/template-meta.ts` | 신규 |
| `src/app/admin/donations/lib/donation-export.ts` | 신규 |
| `public/templates/*.xlsx` × 3 | 이동 완료 (커밋 필요) |

---

## Version History

| Version | Date | 변경 내용 | Author |
|---------|------|----------|--------|
| 0.1 | 2026-05-15 | 초안. Plan 결정사항 3건(B/별도 양식/이동 승인) 확정 후 함수 시그니처·양식 메타·UI 변경안 설계 | zealnutkim |
