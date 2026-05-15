---
template: plan
version: 1.2
description: 회계프로그램 일괄등록 양식(수입지출처/수입내역) 엑셀 생성 기능 Plan
feature: donation-accounting-export
date: 2026-05-15
author: zealnutkim
project: Ohjunseok 선거사무소
version: 0.1
---

# 회계프로그램 일괄등록 엑셀 생성 (donation-accounting-export) Planning Document

> **Summary**: 기부자 DB에서 회계프로그램이 요구하는 `수입지출처_일괄등록`·`수입내역_일괄등록` 두 가지 엑셀 양식을 한 번에 다운로드하도록 만든다.
>
> **Project**: Ohjunseok 선거사무소 사이트
> **Version**: 0.1
> **Author**: zealnutkim (kcsvictory@gmail.com)
> **Date**: 2026-05-15
> **Status**: Draft

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem (문제)** | 기부자 명단/금액을 회계프로그램에 입력할 때 두 가지 정해진 양식(`수입지출처_일괄등록`, `수입내역_일괄등록`)을 수작업으로 옮겨 적어야 해, 작업 시간이 길고 오타·누락이 발생한다. |
| **Solution (해결책)** | `/admin/donations` 페이지에서 두 가지 양식을 회계프로그램 요구사항(헤더, 유의사항 행, 시트명, DB 시트, 컬럼 순서)에 100% 일치하도록 생성하여 일괄 다운로드한다. 기명/익명 분리, 양식 그대로의 시트 구조 유지를 보장한다. |
| **Function/UX Effect** | 관리자가 버튼 2개("수입지출처 XLS", "수입내역 XLS") 또는 한 번의 "회계용 XLS 일괄 다운로드"로 .xlsx 파일을 받아 회계프로그램에 그대로 import 가능. 수작업 입력 시간 90% 이상 감소. |
| **Core Value (핵심가치)** | **법정 회계 보고의 정확성과 속도**. 선거 회계는 실수 시 법적 리스크가 크므로, 양식 1:1 매칭과 자동화로 "정확하게, 빠르게"를 동시에 달성한다. |

---

## 1. Overview

### 1.1 Purpose

기부자 데이터(`donations` 테이블)를 선거 회계프로그램이 요구하는 두 가지 엑셀 양식에 맞춰 자동 생성해 회계 보고의 정확성과 속도를 확보한다.

### 1.2 Background

- 선거 회계는 법정 양식이 매우 엄격하다(필수 항목 `*` 표시, 유의사항 행 유지, 시트명 변경 금지, `DB` 시트 유지 등).
- 현재 `src/app/admin/donations/page.tsx`에는 `toNamedXlsx`(기명), `toAnonXlsx`(익명) 두 함수가 이미 있어 **수입내역**은 생성 중이나:
  - 양식 파일의 R1~R4 유의사항 행이 누락되어 있음
  - 시트명이 `수입 내역 일괄등록`이 아니라 일치하지만, `DB` 시트가 누락됨
  - `수입지출처_일괄등록` 엑셀은 아예 생성되지 않음 (회계프로그램은 두 파일 모두 요구함)
- 양식 원본 파일: `src/app/admin/donations/수입지출처_일괄등록_양식.xlsx`, `수입내역_일괄등록_양식.xlsx`

### 1.3 Related Documents

- 양식 원본: `src/app/admin/donations/수입지출처_일괄등록_양식.xlsx`
- 양식 원본: `src/app/admin/donations/수입내역_일괄등록_양식.xlsx`
- 현재 구현: `src/app/admin/donations/page.tsx` (toNamedXlsx, toAnonXlsx)
- 데이터 스키마: `donations` 테이블 (donor_name, resident_id, phone, address, detail_address, postal_code, is_anonymous, email, amount, deposit_date)

---

## 2. Scope

### 2.1 In Scope

- [ ] **수입지출처 일괄등록 엑셀** 생성 함수 신규 작성 (`toExpenseSourceXlsx`)
  - 시트명: `수입지출처 일괄등록`
  - 헤더(9열): `구분*`, `성명(명칭)*`, `생년월일/사업자번호`, `직업(업종)`, `우편번호`, `주소`, `상세주소`, `전화번호`, `비고`
  - 기명 기부자만 포함 (익명은 제외 — 양식상 성명 필수)
  - 중복 제거: 동일 인물(이름+주민번호 또는 이름+전화번호 기준)이 여러 번 기부했어도 1행만 등록
- [ ] **수입내역 일괄등록 엑셀** 생성 함수 개선 (`toIncomeListXlsx`로 통합 리팩토링)
  - 시트명: `수입 내역 일괄등록` + `DB` 시트 동시 포함 (양식 그대로)
  - R1~R4: 양식의 유의사항 4행을 그대로 포함
  - R5: 헤더 16열 (현재 코드의 `XLS_HEADERS`와 일치 검증)
  - R6 이상: 기명+익명 데이터 분리 또는 통합 옵션
- [ ] 다운로드 UI 정비: 기존 "기명 XLS", "익명 XLS" 두 버튼을 **"수입지출처 XLS"**, **"수입내역 XLS"** 두 버튼으로 교체 (또는 "회계용 일괄 다운로드" 한 버튼으로 통합 — UX 결정 필요)
- [ ] CSV 다운로드는 유지 (백업/검수용)
- [ ] 양식 파일을 fetch로 로드해 템플릿으로 쓰는 방식 vs 코드로 헤더 재구성 방식 — Design 단계에서 결정

### 2.2 Out of Scope

- 회계프로그램과의 직접 API 연동 (수동 import 유지)
- 지출 내역(`expenses`) 일괄등록 양식 — 본 기능은 **수입**에 한정
- 기부자 추가/수정/삭제 폼 UX 변경
- 영수증 PDF 자동 생성
- 양식 외 분석용 추가 컬럼

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | 요구사항 | 우선순위 | 상태 |
|----|---------|---------|------|
| FR-01 | `수입지출처 일괄등록` 양식과 100% 일치하는 .xlsx 다운로드 (시트명, 헤더, 컬럼 순서) | High | Pending |
| FR-02 | `수입내역 일괄등록` 양식과 100% 일치하는 .xlsx 다운로드 (R1~R4 유의사항, R5 헤더, `DB` 시트 포함) | High | Pending |
| FR-03 | 기명/익명 자동 분류: 수입지출처는 기명만, 수입내역은 둘 다 (기명=실명+생년월일, 익명=`익명` 표기) | High | Pending |
| FR-04 | 수입지출처 등록 시 동일 기부자 중복 제거 (이름+주민번호 우선, 폴백: 이름+전화) | High | Pending |
| FR-05 | 주민번호 → 생년월일 8자리 변환 (`ridToBirth` 재사용) | High | Pending |
| FR-06 | 입금일 → `YYYY.MM.DD` 포맷 (`formatDateDot` 재사용) | High | Pending |
| FR-07 | 다운로드 버튼 클릭 시 두 엑셀이 각각 또는 `.zip`으로 한꺼번에 받아짐 | Medium | Pending |
| FR-08 | 데이터가 0건이면 버튼 비활성화 + 안내 | Medium | Pending |
| FR-09 | 파일명 규칙: `수입지출처_YYYY-MM-DD.xlsx`, `수입내역_YYYY-MM-DD.xlsx` | Medium | Pending |
| FR-10 | 양식 검증: 다운로드 직전 헤더와 시트 구조를 양식 원본과 비교하는 단위 함수 (개발 도움용) | Low | Pending |

### 3.2 Non-Functional Requirements

| 카테고리 | 기준 | 측정 방법 |
|----------|------|----------|
| Performance | 1,000건 데이터 기준 다운로드 생성 < 3초 (브라우저 기준) | 수동 측정 |
| Accuracy | 회계프로그램 import 성공률 100% (테스트 환경에서 1회 검증) | 회계프로그램에 직접 import |
| Compatibility | 한글 컬럼명/시트명 깨짐 없음, Excel·LibreOffice·번호프로그램에서 동일 표시 | 3개 프로그램에서 확인 |
| Security | 주민번호 등 민감정보는 다운로드 시 관리자 인증 통과한 경우에만 노출 (기존 `adminGet` 흐름 유지) | 코드 리뷰 |
| UX | 다운로드 진행 중 버튼 비활성화 + 로딩 표시 | 수동 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `수입지출처_일괄등록_양식.xlsx` 원본과 자동 생성 파일을 비교했을 때 헤더·시트명·컬럼 순서 100% 일치
- [ ] `수입내역_일괄등록_양식.xlsx`도 동일 기준 100% 일치 (R1~R4 유의사항 포함, `DB` 시트 포함)
- [ ] 회계프로그램(또는 동일 사양 점검 도구)에서 import 1회 성공 확인
- [ ] `/admin/donations` 페이지에서 두 양식 다운로드 동작 (실제 DB 기준)
- [ ] 중복 기부자 제거 검증 (동일인 2건 이상 기부 시 수입지출처에는 1행)
- [ ] lint/typecheck 통과
- [ ] page.tsx 변경분에 대한 자가 코드 리뷰 1회

### 4.2 Quality Criteria

- [ ] 기존 `donations/page.tsx`의 다른 기능(등록/수정/삭제/페이지네이션) 영향 없음
- [ ] `toNamedXlsx`/`toAnonXlsx` 함수는 새 통합 함수로 대체 또는 명확히 deprecate
- [ ] 파일명 한글 인코딩 정상

---

## 5. Risks and Mitigation

| 리스크 | 영향 | 발생가능성 | 대응 |
|--------|------|----------|------|
| 양식이 회계프로그램 버전 업데이트로 변경됨 | High | Medium | 양식 원본 .xlsx를 그대로 fetch해 템플릿으로 사용하는 방식 채택 시 자동 적응 가능. 헤더 변경 시 알림용 검증 함수(FR-10) 마련 |
| 한글 시트명/컬럼명 인코딩 이슈로 회계프로그램이 인식 실패 | High | Low | 양식 원본 그대로의 문자열 사용. UTF-8 BOM은 .xlsx에 무관. `_x000D_` 같은 양식 내 특수 문자 보존 |
| 주민번호 13자리가 아닌 비정상 데이터로 생년월일 변환 실패 | Medium | Medium | `ridToBirth`에 길이 체크 이미 있음. 변환 실패 시 빈 문자열로 안전 처리 + 다운로드 후 alert로 누락 건수 안내 |
| 익명 기부자 처리: 수입지출처 양식에는 `성명*`이 필수라 익명을 어떻게 처리할지 | High | High | **방침 결정 필요**: (a) 수입지출처에는 익명 제외, (b) `익명1, 익명2…`로 채워서 포함. → 현재 plan은 (a) 채택. Design에서 회계 담당자와 재확인. |
| 동일인 식별 키 충돌 (주민번호 미입력 + 동명이인) | Medium | Low | 이름+주민번호 우선, 없으면 이름+전화 폴백, 둘 다 없으면 별도 행으로 처리 |
| 양식 R1~R4 유의사항을 코드에 하드코딩 시 양식 변경에 취약 | Medium | Medium | 양식 .xlsx 자체를 fetch → openpyxl 대체로 클라이언트는 `xlsx` 라이브러리 사용해 시트 복제 후 데이터 행만 append하는 방식을 Design에서 검토 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | 특징 | 적합 분야 | 선택 |
|-------|------|----------|:----:|
| **Starter** | 단순 구조 | 정적 사이트 | ☐ |
| **Dynamic** | 기능 단위 모듈, BaaS 연동 | 백엔드 있는 웹앱 | ☑ |
| **Enterprise** | 엄격한 계층 분리, DI | 대규모 시스템 | ☐ |

→ 본 기능은 **Dynamic** 레벨 기존 `admin` 모듈에 추가되는 작은 기능. 신규 디렉토리 불필요.

### 6.2 Key Architectural Decisions

| 결정 | 옵션 | 선택 | 근거 |
|------|------|------|------|
| 엑셀 생성 위치 | 클라이언트(xlsx) / 서버(SheetJS Node) | 클라이언트(`xlsx`) | 이미 `xlsx` 라이브러리 도입 + 관리자만 사용 + 추가 API 불필요 |
| 양식 처리 방식 | (A) 코드에 헤더 하드코딩 (B) 양식 .xlsx fetch 후 템플릿으로 사용 | **Design 단계에서 결정** | (B)가 변경에 강하나 fetch 1회 필요. (A)는 단순. |
| 파일 다운로드 | 개별 다운로드 / .zip 묶음 | 개별 우선, zip은 Phase 2 | 단순함 우선 |
| 다운로드 트리거 | 버튼 / 메뉴 | 기존처럼 헤더 영역 버튼 | UI 일관성 |
| 중복 제거 키 | resident_id / phone / 복합 | 복합 (resident_id → phone → name+address 폴백) | 데이터 누락 케이스 대응 |
| 양식 원본 위치 | src 내부 / public / API | 현재 `src/app/admin/donations/` 두 양식 파일은 `public/`으로 이동 후 fetch | (B) 채택 시 fetch 가능하도록 |

### 6.3 Folder Structure

```
src/app/admin/donations/
  ├── page.tsx                                 # UI + 다운로드 트리거 (수정)
  ├── lib/                                     # (신규) 다운로드 로직 분리 고려
  │   ├── toExpenseSourceXlsx.ts               # (신규) 수입지출처
  │   └── toIncomeListXlsx.ts                  # (신규) 수입내역 (양식 충실)
  └── 수입지출처_일괄등록_양식.xlsx              # → public/templates/로 이동 검토
  └── 수입내역_일괄등록_양식.xlsx                # → public/templates/로 이동 검토

public/templates/
  ├── 수입지출처_일괄등록_양식.xlsx              # (이동 후) fetch 가능
  └── 수입내역_일괄등록_양식.xlsx                # (이동 후) fetch 가능
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` / `AGENTS.md` / `.impeccable.md` 존재 — 디자인 톤·UX 원칙 명시
- [x] TypeScript 사용 (`tsconfig.json`)
- [x] `xlsx` 라이브러리 도입 (`page.tsx`에서 `import * as XLSX from "xlsx"`)
- [x] `adminGet` 유틸리티 (`@/lib/admin-fetch`) — 관리자 인증 fetch
- [x] Tailwind + lucide-react 아이콘 컨벤션

### 7.2 Conventions to Define/Verify

| 카테고리 | 현재 상태 | 정의할 사항 | 우선순위 |
|----------|----------|-----------|:-------:|
| 파일명 (한글 포함) | 일부 한글 파일 사용 중 | 양식 파일은 한글 그대로 유지 | High |
| 다운로드 함수 분리 | 현재 page.tsx에 인라인 | `lib/donation-export.ts` 등 별도 모듈로 분리 검토 | Medium |
| 양식 원본 위치 | src 내부 | `public/templates/`로 이동 (fetch 가능하도록) | High |

### 7.3 Environment Variables Needed

본 기능은 신규 환경변수 불필요. 기존 admin 인증 토큰만 사용.

### 7.4 Pipeline Integration

본 기능은 9-phase 파이프라인의 Phase 6 (UI 통합) 후속 마이크로 기능에 해당. 별도 phase 진입 불필요.

---

## 8. Next Steps

1. [ ] `/pdca design donation-accounting-export` 실행하여 Design 문서 작성
   - 양식 처리 방식 (A) vs (B) 최종 결정
   - 익명 기부자의 수입지출처 처리 방침 회계 담당자와 확정
   - 함수 시그니처 및 파일 분리 구조 확정
2. [ ] Design 승인 후 `/pdca do donation-accounting-export`로 구현 진입
3. [ ] 회계프로그램 import 테스트(1건) 후 `/pdca analyze`로 Gap 검증

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-15 | 초안 작성 — 양식 분석, 기존 코드 점검, 4가지 핵심 결정 사항 도출 | zealnutkim |
