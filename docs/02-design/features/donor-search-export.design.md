---
template: design
version: 1.2
description: 후원자 검색·선택 내보내기 Design — 필터 UI, 선택 상태 자료구조, 단순 export 함수
feature: donor-search-export
date: 2026-05-16
author: zealnutkim
project: Ohjunseok 선거사무소
version: 0.1
---

# 후원자 검색·선택 내보내기 (donor-search-export) Design Document

> **Summary**: 입금일/유형/텍스트 3중 필터 + 행 단위 선택 + 선택 항목 CSV·XLSX export. 모두 클라이언트사이드, 기존 회계 export와 분리.
>
> **Project**: Ohjunseok 선거사무소 사이트
> **Version**: 0.1
> **Author**: zealnutkim
> **Date**: 2026-05-16
> **Status**: Draft
> **Planning Doc**: [donor-search-export.plan.md](../../01-plan/features/donor-search-export.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- **단일 화면, 점진적 좁히기**: 필터(거시) → 검색(중간) → 선택(미시) 흐름으로 인지 부담 최소화
- **클라이언트 only**: 이미 `allData` 전체를 로드하므로 서버 변경 0
- **기존 회계 export 비격리**: 회계 양식 코드(`donation-export.ts`)에는 손대지 않음
- **상태 단순성**: 4개 추가 상태(`dateFrom`, `dateTo`, `anonFilter`, `selectedIds`)만으로 모든 기능 표현

### 1.2 Design Principles

- 필터·검색·선택은 직교(orthogonal) — 서로 영향 주되 독립적으로 토글 가능
- 선택 상태는 `id` 기준으로만 보관 → 필터/페이지 이동 무관하게 안정적
- "선택 항목 export"는 회계 양식과 다른 단순 표 — 별도 유틸 파일로 분리
- 추가 의존성 0 (이미 설치된 `xlsx@^0.18.5` 재사용)

---

## 2. Architecture

### 2.1 Component Diagram (단일 페이지 내부)

```
┌─────────────────────────────────────────────────────────────┐
│ AdminDonations (page.tsx)                                   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Header        │  │ Filter Bar   │  │ Selection Bar    │  │
│  │ (제목/합계/  │  │ (날짜·유형· │  │ (선택N건·합계·  │  │
│  │  회계 다운로드)│ │  텍스트)    │  │  CSV·XLSX·해제)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Donation Table (체크박스 컬럼 + 페이지네이션)         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  상태:                                                       │
│  ├─ allData: Donation[]              (서버 fetch)           │
│  ├─ searchQuery: string              (기존)                 │
│  ├─ dateFrom, dateTo: string         (신규)                 │
│  ├─ anonFilter: "all"|"named"|"anon" (신규)                 │
│  ├─ selectedIds: Set<string>         (신규)                 │
│  └─ page: number                     (기존)                 │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
allData (서버 fetch, 1회 + CRUD 후 재fetch)
   │
   ▼
applyFilters(allData, {dateFrom, dateTo, anonFilter, searchQuery})
   │
   ▼ filtered: Donation[]
   ├─ count = filtered.length
   ├─ totalAmount = sum(filtered.amount)
   ├─ items = filtered.slice(page slice)         → 테이블 표시
   └─ filteredIds = new Set(filtered.map(d=>d.id)) → 헤더 체크박스 상태 계산

selectedIds (Set<string>, 독립 상태)
   │
   ▼ selectedRows = allData.filter(d => selectedIds.has(d.id))
   ├─ selectedCount = selectedRows.length
   ├─ selectedAmount = sum(selectedRows.amount)
   └─ export 시 selectedRows 전달
```

### 2.3 Dependencies

| 컴포넌트 | 의존 | 용도 |
|---------|------|-----|
| `page.tsx` | `donation-export.ts` (기존) | 회계 양식 3종 (변경 없음) |
| `page.tsx` | `donation-simple-export.ts` (신규) | 선택 항목 CSV/XLSX |
| `donation-simple-export.ts` | `xlsx` (이미 설치) | XLSX workbook 생성 |
| `donation-simple-export.ts` | `donation-export.ts` | `Donation` 타입, `isAnonymousDonation` 재사용 |

---

## 3. Data Model

### 3.1 신규 타입 정의

```typescript
// src/app/admin/donations/page.tsx 내부

type AnonFilter = "all" | "named" | "anon";

interface FilterState {
  dateFrom: string;     // "YYYY-MM-DD" or ""
  dateTo: string;       // "YYYY-MM-DD" or ""
  anonFilter: AnonFilter;
  searchQuery: string;
}
```

### 3.2 필터 합성 함수

```typescript
function applyFilters(
  data: Donation[],
  { dateFrom, dateTo, anonFilter, searchQuery }: FilterState
): Donation[] {
  const q = searchQuery.trim().toLowerCase();
  return data.filter((d) => {
    // 1) 날짜 범위 (inclusive)
    if (dateFrom && d.deposit_date < dateFrom) return false;
    if (dateTo && d.deposit_date > dateTo) return false;

    // 2) 기명/익명
    if (anonFilter !== "all") {
      const isAnon = isAnonymousDonation(d);
      if (anonFilter === "anon" && !isAnon) return false;
      if (anonFilter === "named" && isAnon) return false;
    }

    // 3) 텍스트 검색 (기존 로직)
    if (q) {
      const hay = [
        d.donor_name, d.phone, d.email ?? "",
        d.address ?? "", d.detail_address ?? "",
      ].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}
```

> **포인트**: `deposit_date`는 DB에서 "YYYY-MM-DD" 또는 ISO 형식. 문자열 비교가 사전순=시간순이라 정상 동작. ISO timestamp이면 `.slice(0,10)` 정규화 필요 → 데이터 확인 후 결정 (기본은 슬라이스 안전버전).

### 3.3 선택 상태

```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

function toggleOne(id: string) {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
}

function toggleAllFiltered(filtered: Donation[], shouldSelect: boolean) {
  setSelectedIds((prev) => {
    const next = new Set(prev);
    for (const d of filtered) {
      shouldSelect ? next.add(d.id) : next.delete(d.id);
    }
    return next;
  });
}

function clearSelection() {
  setSelectedIds(new Set());
}
```

### 3.4 헤더 체크박스 상태 (tri-state)

```typescript
// filtered 기준으로 "전체/일부/없음" 판정
const filteredSelectedCount = filtered.reduce(
  (n, d) => n + (selectedIds.has(d.id) ? 1 : 0), 0
);

const headerCheckState: "all" | "some" | "none" =
  filteredSelectedCount === 0 ? "none"
  : filteredSelectedCount === filtered.length ? "all"
  : "some";
// 렌더 시: <input type="checkbox" checked={headerCheckState==="all"} ref={el => el && (el.indeterminate = headerCheckState==="some")} />
```

---

## 4. API Specification

서버 API 변경 없음. 기존 `GET /api/admin/data?table=donations&action=all` 그대로 사용.

---

## 5. UI/UX Design

### 5.1 Screen Layout (Desktop)

```
┌────────────────────────────────────────────────────────────────┐
│ 후원자 목록 (N건)              [회계 3종] [일괄] [CSV] [+등록] │
│ 전체 합계: ₩X,XXX,XXX                                          │
├────────────────────────────────────────────────────────────────┤
│ ┌─ Filter Bar ───────────────────────────────────────────────┐ │
│ │ 입금일 [_2026-05-01_]~[_2026-05-16_]  [전체|기명|익명]     │ │
│ │ [🔍 이름·전화·이메일·주소 검색............................] │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ Selection Bar (선택≥1건일 때만 노출) ──────────────────────┐ │
│ │ ✓ 선택 5건 · ₩550,000   [CSV 저장] [XLSX 저장] [해제]      │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─ Table ────────────────────────────────────────────────────┐ │
│ │ [☐] 이름  주민번호  전화  이메일  주소  금액  입금일  ...   │ │
│ │ [☑] 홍길동 ...                                              │ │
│ │ [☐] ...                                                     │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                              [이전] 1/3 [다음]  │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 Mobile Layout

```
┌──────────────────────┐
│ 후원자 목록           │
│ [회계 다운로드 ▾]    │
│                      │
│ ┌─ 필터 ───────────┐│
│ │ 시작일           ││
│ │ [_2026-05-01_]   ││
│ │ 종료일           ││
│ │ [_2026-05-16_]   ││
│ │ [전체|기명|익명] ││
│ │ [🔍 검색........]││
│ └──────────────────┘│
│                      │
│ 선택 5건 ₩550,000   │
│ [CSV] [XLSX] [해제] │
│                      │
│ ─────────────────── │
│ ☑ 홍길동             │
│   ₩100,000          │
│   2026-05-14        │
│ ─────────────────── │
└──────────────────────┘
```

> 모바일에서는 필터를 세로 스택, 테이블은 가로 스크롤(`overflow-x-auto`) 유지 (현재 구조 그대로).

### 5.3 User Flow

```
1. 페이지 진입
   └─ 전체 N건 표시, 선택 0건

2. 필터 적용 (예: 5/1~5/14, 기명만)
   ├─ 결과 = 12건
   ├─ 합계 = ₩1,200,000
   └─ 선택 상태 유지 (이전에 선택했던 항목이 필터로 사라져도 selectedIds에는 남음)

3. 헤더 ☐ 클릭 → 필터된 12건 모두 선택
   └─ Selection Bar: "선택 12건 · ₩1,200,000"

4. 개별 행 ☐ 토글로 미세 조정

5. [CSV 저장] 또는 [XLSX 저장] 클릭
   └─ selectedIds 기반 allData 필터 → 파일 다운로드
```

### 5.4 Component List

| 컴포넌트/요소 | 위치 | 책임 |
|--------------|------|-----|
| `FilterBar` (인라인 JSX) | `page.tsx` | 날짜 2개 input + 3-way 토글 + 기존 텍스트 검색 통합 |
| `SelectionBar` (인라인 JSX) | `page.tsx` | 선택 카운트/합계 + CSV/XLSX 버튼 + 해제 |
| `<input type="checkbox">` (헤더) | `page.tsx` table thead | tri-state (all/some/none) |
| `<input type="checkbox">` (행) | `page.tsx` table tbody | 개별 토글 |
| `toSelectedCsv(rows)` | `donation-simple-export.ts` | 단순 CSV 생성 |
| `toSelectedXlsx(rows)` | `donation-simple-export.ts` | 단순 XLSX workbook 생성 |

### 5.5 색상·아이콘

- 선택된 행: `bg-rose-50` (호버는 기존 `hover:bg-gray-50` 위에 우선) — Tailwind 조건부 클래스
- 체크박스: 표준 HTML `<input type="checkbox" className="rounded text-rose-600 ...">`
- 아이콘: `Calendar` (날짜 라벨), `FileDown` 또는 `Download` (export), `XCircle` (해제)
- Selection Bar 배경: `bg-rose-50` + 좌측 4px rose 보더

---

## 6. Error Handling

| 상황 | 처리 |
|-----|-----|
| 선택 0건에서 export 버튼 클릭 | 버튼 자체를 `disabled` — 클릭 불가 |
| 날짜 범위가 역전(`dateFrom > dateTo`) | 필터 결과 0건으로 자연스럽게 표시. 별도 경고 X (UX 단순화) |
| CSV/XLSX 생성 중 오류 | `try/catch` + `alert("파일 생성 중 오류가 발생했습니다.")` |
| 필터 결과 0건 | 테이블 본문에 "조건에 맞는 후원자가 없습니다." 메시지 (기존 "검색 결과가 없습니다." 로직 확장) |

---

## 7. Security Considerations

- [x] 클라이언트 메모리 데이터만 사용 — 추가 API 노출 없음
- [x] export 파일에 주민번호 포함 — 기존 CSV와 동일 정책. 별도 마스킹은 본 PR 범위 아님 (운영 정책상 회계 보고용)
- [x] XSS 방지: CSV 셀에 수식 prefix(`=`, `+`, `-`, `@`, `\t`) 발견 시 앞에 탭 추가 (`sanitizeCell` 재사용)
- [x] 파일명에 사용자 입력 미포함 — 고정 prefix + 날짜만 사용

---

## 8. Test Plan

### 8.1 Test Scope

자동 테스트 도입 안 함(프로젝트 관행). 수동 QA 체크리스트로 대체.

### 8.2 수동 QA 케이스

- [ ] **필터 단독**
  - 시작일만 입력 → 시작일 이후 모두 노출
  - 종료일만 입력 → 종료일 이전 모두 노출
  - 시작/종료 둘 다 입력 → inclusive 범위
- [ ] **유형 필터**
  - "기명" → `isAnonymousDonation === false`만
  - "익명" → `isAnonymousDonation === true`만
  - "전체" → 모두
- [ ] **필터 조합**
  - 날짜 + 기명 + 텍스트 "홍" → AND 결과 확인
- [ ] **선택 상태**
  - 행 선택 → Selection Bar 표시, 카운트·합계 일치
  - 헤더 체크박스 → 필터된 전체 토글 (페이지 단위 아님)
  - 페이지 이동 → 다음 페이지의 선택된 행도 ☑ 유지
  - 필터 변경 → 화면에서 사라진 항목도 selectedIds 유지 (Selection Bar 카운트에 반영)
- [ ] **Export**
  - CSV: 한글 깨짐 없음(BOM), 선택 항목만 포함, 행 수·합계 일치
  - XLSX: 시트명 "후원자_선택", 헤더 + 데이터 정합
- [ ] **빈 상태**
  - 필터 0건: "조건에 맞는 후원자가 없습니다." 표시
  - 선택 0건: Selection Bar 자체 미노출
- [ ] **모바일**
  - 필터 세로 스택, 체크박스 터치 타깃 44px 이상

---

## 9. Clean Architecture

본 프로젝트는 Dynamic 레벨이며 admin 페이지는 단일 파일 기반 관리자 화면. 별도 features/ 디렉터리 분리 없음.

### 9.1 This Feature's File Layout

| 컴포넌트 | 위치 | 변경 |
|---------|-----|-----|
| AdminDonations | `src/app/admin/donations/page.tsx` | **수정**: 상태 4개 추가, 필터/선택 UI 추가, export 핸들러 추가 |
| Donation 타입 | `src/app/admin/donations/lib/donation-export.ts` | 변경 없음 |
| isAnonymousDonation | `src/app/admin/donations/lib/donation-export.ts` | 변경 없음, import 재사용 |
| 회계 export 3종 | `src/app/admin/donations/lib/donation-export.ts` | 변경 없음 |
| **신규** 단순 export | `src/app/admin/donations/lib/donation-simple-export.ts` | **신규 파일** |

---

## 10. Coding Convention Reference

### 10.1 This Feature's Conventions

| 항목 | 적용 |
|-----|-----|
| 상태 명명 | camelCase: `dateFrom`, `dateTo`, `anonFilter`, `selectedIds` |
| 타입 명명 | PascalCase: `AnonFilter`, `FilterState` (FilterState는 옵션 — 인라인 분해도 OK) |
| 함수 명명 | camelCase: `applyFilters`, `toggleOne`, `toggleAllFiltered`, `clearSelection`, `toSelectedCsv`, `toSelectedXlsx` |
| 파일명 | kebab-case: `donation-simple-export.ts` |
| Import 순서 | React → 외부 lib → 내부 lib → 타입 (기존 page.tsx 관행 따름) |

---

## 11. Implementation Guide

### 11.1 신규 파일

```typescript
// src/app/admin/donations/lib/donation-simple-export.ts
import * as XLSX from "xlsx";
import { isAnonymousDonation, type Donation } from "./donation-export";

const HEADERS = [
  "이름", "기명여부", "주민등록번호", "전화번호", "이메일",
  "우편번호", "기본주소", "상세주소", "금액", "입금일", "접수일",
] as const;

function rowOf(d: Donation): (string | number)[] {
  return [
    d.donor_name,
    isAnonymousDonation(d) ? "익명" : "기명",
    d.resident_id,
    d.phone,
    d.email ?? "",
    d.postal_code ?? "",
    d.address ?? "",
    d.detail_address ?? "",
    d.amount,
    d.deposit_date.slice(0, 10),
    d.created_at.slice(0, 10),
  ];
}

function sanitizeCell(v: string | number): string {
  const s = String(v);
  return /^[=+\-@\t]/.test(s) ? `\t${s}` : s;
}

export function toSelectedCsv(rows: Donation[]): string {
  const lines = rows.map((d) =>
    rowOf(d).map((c) => {
      const s = sanitizeCell(c);
      // 콤마/쌍따옴표 포함 시 quote
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(",")
  );
  return "﻿" + [HEADERS.join(","), ...lines].join("\n");
}

export function toSelectedXlsx(rows: Donation[]): ArrayBuffer {
  const aoa: (string | number)[][] = [HEADERS as readonly string[], ...rows.map(rowOf)];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "후원자_선택");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return buf as ArrayBuffer;
}

export function buildSelectedFileName(ext: "csv" | "xlsx"): string {
  const ymd = new Date().toISOString().slice(0, 10);
  return `후원자_선택_${ymd}.${ext}`;
}
```

### 11.2 page.tsx 변경 요약

```typescript
// 1) import 추가
import { toSelectedCsv, toSelectedXlsx, buildSelectedFileName } from "./lib/donation-simple-export";
import { Calendar, FileDown, XCircle } from "lucide-react"; // 필요 시

// 2) 상태 추가
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");
const [anonFilter, setAnonFilter] = useState<"all"|"named"|"anon">("all");
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

// 3) filtered 계산 시 applyFilters 사용 (기존 useMemo 교체)
const filtered = useMemo(
  () => applyFilters(allData, { dateFrom, dateTo, anonFilter, searchQuery }),
  [allData, dateFrom, dateTo, anonFilter, searchQuery]
);

// 4) 페이지 리셋: 필터 변경 시
useEffect(() => { setPage(1); }, [searchQuery, dateFrom, dateTo, anonFilter]);

// 5) 선택 파생 값
const selectedRows = useMemo(
  () => allData.filter((d) => selectedIds.has(d.id)),
  [allData, selectedIds]
);
const selectedAmount = selectedRows.reduce((s, d) => s + d.amount, 0);

// 6) Filter Bar / Selection Bar / 체크박스 컬럼 JSX 추가
// 7) Export 핸들러 (선택 항목)
async function handleExportSelectedCsv() { downloadBlob(toSelectedCsv(selectedRows), buildSelectedFileName("csv"), "text/csv;charset=utf-8;"); }
async function handleExportSelectedXlsx() { downloadBlob(toSelectedXlsx(selectedRows), buildSelectedFileName("xlsx"), XLSX_MIME); }
```

### 11.3 Implementation Order

1. [ ] `donation-simple-export.ts` 신규 작성 (+ 빌드 통과 확인)
2. [ ] `page.tsx`에 필터 상태 4개 + `applyFilters` 추가
3. [ ] Filter Bar UI 추가 (날짜 input × 2, 3-way 토글)
4. [ ] 테이블에 체크박스 컬럼 추가 (헤더 tri-state, 행 토글)
5. [ ] Selection Bar UI 추가 (조건부 렌더)
6. [ ] Export 핸들러 2종 + 다운로드 동작 검증
7. [ ] 빈 상태 메시지 분기 갱신 (필터 결과 0건 vs 후원 정보 0건)
8. [ ] `npx tsc --noEmit`, `npm run build`
9. [ ] 수동 QA 체크리스트(§8.2) 실행

### 11.4 변경/추가 라인 추정

| 파일 | 추가 | 수정 |
|-----|-----|-----|
| `lib/donation-simple-export.ts` | ~50 | — |
| `page.tsx` | ~100 (UI + 핸들러) | ~10 (filtered/items 분기) |

---

## Version History

| Version | Date | 변경 | 작성자 |
|---------|------|-----|------|
| 0.1 | 2026-05-16 | Initial draft — 필터/선택/export 설계 확정 | zealnutkim |
