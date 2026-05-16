---
template: report
version: 1.0
description: 후원자 검색·선택 내보내기 (완료) — 날짜/유형 필터 + 행 선택 export
feature: donor-search-export
date: 2026-05-16
author: zealnutkim
status: Completed
matchRate: 100
iterationCount: 0
---

# 후원자 검색·선택 내보내기 (donor-search-export) Completion Report

> **Project**: Ohjunseok 선거사무소 사이트
> **Duration**: 2026-05-16 ~ 2026-05-16 (당일 완료)
> **Owner**: zealnutkim
> **Status**: Production Ready ✅

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 기존 후원자 목록은 "전체 데이터"만 다운로드 가능해 특정 기간(예: 5월 2주차)·특정 유형(기명만)·특정 인물 묶음 추출이 불가능했고, 매번 전체 파일을 받아 외부 도구에서 재가공해야 했다. |
| **Solution** | `/admin/donations`에 입금일 범위 + 기명/익명 3-way 토글 + 행 단위 체크박스를 추가하고, 선택 항목만 CSV/XLSX로 저장하는 액션을 신설했다. 모든 필터·선택은 클라이언트사이드에서 합성되며, 기존 회계 양식 export 4종은 정책상 전체 데이터 그대로 유지했다. |
| **Function & UX Effect** | 관리자는 ① 날짜·유형으로 1차 좁히고 ② 검색어로 2차 좁힌 뒤 ③ 체크박스로 최종 선별해 한 번에 파일을 받는다. Selection Bar에 선택 N건·합계가 실시간 표기되어 "지금 무엇을 받을지" 즉시 확인된다. 회계 다운로드와 책임이 분리되어 정책 혼동이 없다. |
| **Core Value** | **부분 보고의 정확성·속도**. 회계 마감, 분기 정산, 특정 행사 후원자 추출 같은 실무 시나리오를 한 화면에서 끝낸다. 외부 가공 단계 제거로 실수 위험이 줄고, 단순 export 모듈은 회계 양식 코드와 격리되어 향후 유지보수 영향이 최소화된다. |

### 1.3 Value Delivered

**Design 명세 완료도: 10/10 FR + 8/8 UI + 4/4 Error + 6/6 Out-of-scope = 100%**
**구현 시간**: 당일 완료
**반복 횟수**: 0회 (Match Rate 100%, iterate 불필요)
**보너스 UX 6건**: 필터 초기화 버튼 / 카운트 분기 표기 / 합계 라벨 분기 / 헤더 disabled 가드 / `hasActiveFilter` flag / 풍부한 aria-label
**번들 영향**: `/admin/donations` 9.26 kB (xlsx는 기존 의존성 재사용, 신규 패키지 0)

---

## PDCA Cycle Summary

### Plan
- **문서**: `docs/01-plan/features/donor-search-export.plan.md`
- **목표**: 후원자 목록에 날짜/유형 필터 + 행 단위 선택 + 선택 항목 export 추가
- **주요 결정**:
  - 클라이언트사이드 only (이미 `allData` 전체 로드 구조 활용, 서버 변경 0)
  - 회계 양식 export(3종)는 정책상 전체 데이터 — 본 기능과 분리
  - 추가 의존성 0 (기존 `xlsx@^0.18.5` 재사용)
- **In-scope**: 입금일 범위, 기명/익명 3-way, 행 체크박스, Selection Bar, 선택 CSV/XLSX
- **Out-of-scope**: URL 쿼리스트링 동기화, 서버사이드 필터, 일괄 삭제/수정, 회계 양식의 부분 export

### Design
- **문서**: `docs/02-design/features/donor-search-export.design.md`
- **주요 명세**:
  - 상태 4개: `dateFrom`, `dateTo`, `anonFilter: "all"|"named"|"anon"`, `selectedIds: Set<string>`
  - 필터 합성: `applyFilters()` 단일 함수가 날짜+유형+텍스트 AND
  - 헤더 체크박스: tri-state (`all`/`some`/`none`), **필터된 전체** 단위 (페이지 단위 아님)
  - 선택 export: 별도 파일 `donation-simple-export.ts`로 분리 (회계 양식 코드 무영향)
  - 함수 시그니처: `toSelectedCsv(rows)`, `toSelectedXlsx(rows)`, `buildSelectedFileName(ext)`

### Do
- **변경 파일**: 2개
  1. **`src/app/admin/donations/lib/donation-simple-export.ts`** (신규, 64줄)
     - `toSelectedCsv` — BOM + sanitize + CSV escape, 헤더 11열
     - `toSelectedXlsx` — 시트명 "후원자_선택", aoa_to_sheet
     - `buildSelectedFileName` — `후원자_선택_YYYY-MM-DD.{ext}`
  2. **`src/app/admin/donations/page.tsx`** (+200줄, -22줄, 총 1063줄)
     - 신규 상태 4개 + `headerCheckboxRef`
     - `useMemo`로 `filtered` / `totalAmount` / `selectedRows` / `selectedAmount` / `filteredSelectedCount` 파생
     - `toggleOne` / `toggleAllFiltered` / `clearSelection` / `resetFilters` 핸들러
     - Filter Bar (rounded-xl 카드, 4컨트롤 + 필터 초기화)
     - Selection Bar (조건부, rose 좌측 보더, 카운트·합계·CSV·XLSX·해제)
     - 테이블 체크박스 컬럼 (헤더 tri-state, 행 토글, 선택 행 `bg-rose-50`)
     - 빈 상태 메시지 분기 (`hasActiveFilter` 기반)

- **검증**:
  - `npx tsc --noEmit` 통과
  - `npm run build` 성공 (정적 페이지 prerender 정상)

### Check (Gap Analysis)
- **문서**: `docs/03-analysis/donor-search-export.analysis.md`
- **분석자**: bkit:gap-detector
- **결과**:
  - **Match Rate: 100%**
  - FR 10개 모두 충족 (FR-01~FR-10)
  - UI/UX 8/8 (필터 4컨트롤, 토글 색상, 조건부 렌더, 선택 행 배경, 빈 상태 분기, 좌측 보더, 아이콘, aria-label)
  - Error Handling 4/4 (export 가드 — 구현은 Selection Bar 자체 미렌더로 Design의 disabled보다 강한 보장)
  - Out-of-scope 준수 6/6 (회계 양식 4종 정책 유지, `donation-export.ts` 무변경 확인)
- **즉시 조치 항목**: 없음
- **선택 권고**: Design 문서 4건 보강(구현이 Design을 앞서간 케이스를 문서에 반영)

### Act (Iteration)
- **반복 횟수**: 0회
- **사유**: Match Rate 100% — pdca-iterator 호출 불필요

---

## 변경 사항 상세

### 신규 파일

**`src/app/admin/donations/lib/donation-simple-export.ts`** (64 lines)

| 함수 | 시그니처 | 책임 |
|------|---------|------|
| `toSelectedCsv` | `(rows: Donation[]) => string` | BOM + 11컬럼 헤더 + sanitize + CSV escape |
| `toSelectedXlsx` | `(rows: Donation[]) => ArrayBuffer` | 시트 "후원자_선택" 단일 시트 workbook |
| `buildSelectedFileName` | `(ext: "csv" \| "xlsx") => string` | `후원자_선택_YYYY-MM-DD.{ext}` |
| `rowOf` (내부) | `(d: Donation) => (string\|number)[]` | 11컬럼 변환 (기명여부 포함) |
| `sanitizeCell` (내부) | `(v) => string` | 수식 prefix 방어 (=, +, -, @, \t → 앞에 \t) |
| `csvEscape` (내부) | `(v) => string` | 콤마/쌍따옴표/개행 quote 처리 |

### 수정 파일

**`src/app/admin/donations/page.tsx`**

| 영역 | 변경 |
|-----|-----|
| import (L3-23) | `useMemo`, `useRef`, `FileDown`, `XCircle`, 단순 export 3종 |
| 타입 (L24) | `type AnonFilter = "all" \| "named" \| "anon"` |
| 상태 (L96-110) | `dateFrom`, `dateTo`, `anonFilter`, `selectedIds`, `headerCheckboxRef` |
| `load` (L138-156) | 변경 없음 (기존 `action=all` 그대로) |
| `filtered` (L159-184) | `applyFilters` 인라인 — 날짜+유형+텍스트 AND |
| 파생 (L187-229) | `count`, `totalAmount`, `selectedRows`, `selectedAmount`, `filteredSelectedCount`, `headerCheckState`, indeterminate useEffect |
| 핸들러 (L231-266) | `toggleOne`, `toggleAllFiltered`, `clearSelection`, `resetFilters` |
| 헤더 합계 (L498-512) | `hasActiveFilter` 기반 분기 표기 |
| 회계 export (L419-487) | **변경 없음** (정책 유지) |
| 선택 export 핸들러 (L382-408) | `handleExportSelectedCsv`, `handleExportSelectedXlsx` |
| Filter Bar (L574-651) | 신규 — 날짜 input ×2, 3-way 토글, 텍스트 검색, 필터 초기화 |
| Selection Bar (L654-690) | 신규 — 조건부 렌더, 좌측 rose 보더 |
| 테이블 헤더 (L696-712) | 체크박스 컬럼 추가 (tri-state) |
| 테이블 행 (L716-784) | 체크박스 컬럼 + 선택 행 배경 (map → 콜백 블록 전환) |
| 빈 상태 (L799-810) | `hasActiveFilter` 분기 메시지 |
| 페이지네이션 (L815-832) | `safePage` 사용 (필터 결과 변화 대응) |

---

## 검증

### 자동 검증

| 항목 | 결과 |
|------|------|
| TypeScript (`tsc --noEmit`) | ✅ 0 error |
| 빌드 (`npm run build`) | ✅ 성공 |
| 번들 크기 (`/admin/donations`) | 9.26 kB (이전 대비 미세 증가) |
| 신규 패키지 | 0 (xlsx 재사용) |

### 수동 QA 체크리스트 (Design § 8.2)

운영 환경에서 다음을 확인:

- [ ] 입금일 시작/종료 단방향 입력 동작
- [ ] 시작·종료 둘 다 입력 → inclusive 범위
- [ ] 기명/익명 토글 정확성 (sentinel `111111-1111111` 익명 처리 포함)
- [ ] 날짜+유형+텍스트 AND 조합 결과 정확
- [ ] 헤더 체크박스 tri-state (all/some/none) 시각적 일관
- [ ] 헤더 ☐ 클릭 → 필터된 전체 토글 (페이지 단위 아님)
- [ ] 페이지 이동 시 선택 상태 유지 (다른 페이지의 ☑도 유지)
- [ ] 필터 변경 시 화면에서 사라진 항목도 selectedIds 유지 (Selection Bar 카운트 반영)
- [ ] CSV 다운로드: 한글 깨짐 없음(BOM), 선택 항목만 포함, 행 수·합계 일치
- [ ] XLSX 다운로드: 시트명 "후원자_선택", 헤더 + 데이터 정합
- [ ] 회계 양식 3종 + 일괄 + 전체 CSV 다운로드: 선택과 무관하게 전체 데이터 (정책 유지)
- [ ] 빈 상태 메시지 분기 (필터 0건 vs 데이터 0건)
- [ ] 모바일 반응형 (필터 세로 스택, 체크박스 터치 타깃)

---

## 회고 (Lessons Learned)

### 잘된 점

1. **기존 구조 재활용**: 직전 PR(`1915bf8`)에서 클라이언트사이드 데이터 로드로 전환한 덕분에, 본 기능은 상태 4개·파생값 5개·UI 3블록 추가로 끝났다. 구조적 빚 정리가 후속 기능 속도를 직접 끌어올린 사례.
2. **책임 분리**: 회계 양식 export와 단순 export를 파일 단위로 격리(`donation-export.ts` vs `donation-simple-export.ts`)해, 향후 회계 양식 변경이 단순 export에 영향을 주지 않는다.
3. **추가 의존성 0**: 이미 설치된 `xlsx`를 재사용해 번들 영향 최소화.
4. **Design을 앞서간 보너스 UX 6건**: 구현 과정에서 자연스럽게 발견된 개선(필터 초기화, 카운트 분기 등)을 함께 반영해 완성도 상승.

### 개선할 점

1. **Design 문서 동기화 부채**: 구현이 Design을 앞서간 4건(disabled→미렌더, 필터 초기화 버튼, 카운트 표기, 합계 라벨 분기)을 Design 문서에 반영하지 않음. 향후 PR에서 보강 필요.
2. **자동 테스트 부재**: 프로젝트 관행상 수동 QA로 대체했지만, `applyFilters`처럼 순수 함수는 유닛 테스트 가치가 큼. 다음 기능에서 도입 검토.
3. **선택 상태 영속화 없음**: 페이지 새로고침 시 선택 초기화. 회계 작업 중 새로고침 사고가 빈번하면 sessionStorage 보존 검토 가능.

### 패턴화 가능 (향후 다른 페이지에 적용)

- 4 상태 패턴(`dateFrom`/`dateTo`/`textQuery`/`enumFilter`)과 `applyFilters` 합성 함수는 다른 admin 목록(`opinions`, `cheers`, `observers` 등)에도 동일하게 이식 가능
- tri-state 헤더 체크박스 + `selectedIds: Set<string>` + 필터-독립 export 패턴은 재사용성 높음

---

## 관련 문서

- Plan: `docs/01-plan/features/donor-search-export.plan.md`
- Design: `docs/02-design/features/donor-search-export.design.md`
- Analysis: `docs/03-analysis/donor-search-export.analysis.md`
- 직전 작업: `1915bf8 feat(donations): 전체/검색결과 합계 표시 + 후원자 검색 기능`

---

## Version History

| Version | Date | 변경 | 작성자 |
|---------|------|-----|------|
| 1.0 | 2026-05-16 | 완료 보고서 — Match Rate 100%, 당일 완료, 보너스 UX 6건 | zealnutkim |
