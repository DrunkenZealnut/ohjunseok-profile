---
template: analysis
version: 1.2
description: 후원자 검색·선택 내보내기 Gap 분석 (설계 ↔ 구현)
feature: donor-search-export
date: 2026-05-16
author: gap-detector
matchRate: 100
---

# donor-search-export Gap Analysis

> **Match Rate**: **100%** (10/10 FR + 4/4 UI + 4/4 Error + 6/6 Out-of-scope + 보너스 UX 6건)
> **Status**: ✅ Production Ready
> **Analysis Date**: 2026-05-16
> **Planning Doc**: [donor-search-export.plan.md](../01-plan/features/donor-search-export.plan.md)
> **Design Doc**: [donor-search-export.design.md](../02-design/features/donor-search-export.design.md)

검토 대상:
- `src/app/admin/donations/page.tsx` (수정, 1063 lines)
- `src/app/admin/donations/lib/donation-simple-export.ts` (신규, 65 lines)

참조 (미수정 확인):
- `src/app/admin/donations/lib/donation-export.ts` (회계 양식, 변경 없음)

---

## 1. Executive Summary

| 항목 | 결과 |
|------|------|
| **총평** | Design 의도를 100% 충족. 4개 상태(`dateFrom`/`dateTo`/`anonFilter`/`selectedIds`)와 단순 export 모듈 분리 모두 설계대로 구현됨. |
| **추가 가치** | Design에 명시되지 않은 UX 보강 6건(필터 초기화 버튼, 카운트 분기 표기, 합계 라벨 분기, 헤더 체크박스 disabled 가드, hasActiveFilter flag, 풍부한 aria-label)이 추가됨 — 의도와 부합하므로 가산 평가. |
| **Out-of-scope 준수** | `donation-export.ts` 무수정 ✅, 회계 양식 핸들러 4종 정책 유지 ✅. |
| **권고** | 즉시 수정 필요 항목 없음. Design § 6의 "disabled" 표현은 구현(`selectedCount > 0`로 Selection Bar 자체 미렌더)이 더 강한 보장이므로 Design 문서 보완 권장(선택). |

---

## 2. Per-FR Verification

| FR-ID | Design 명세 | Implementation 위치 | Status | Note |
|-------|-------------|---------------------|:------:|------|
| **FR-01** | 입금일 시작/종료 inclusive, 한쪽만 입력 동작 | `page.tsx:162-164` `ymd < dateFrom` / `ymd > dateTo` (string 비교, `slice(0,10)` 정규화) | ✅ | 빈 문자열 falsy 단락평가로 단방향 입력 자연 지원 |
| **FR-02** | 3-way (all/named/anon), `isAnonymousDonation()` | `page.tsx:165-169`, import from `./lib/donation-export` | ✅ | sentinel 판별 로직 재사용 |
| **FR-03** | 날짜+유형+텍스트 AND | `page.tsx:159-184` 순차 early-return = 논리 AND | ✅ | 검색 텍스트 정규화(`trim().toLowerCase()`) 일치 |
| **FR-04** | 행 체크박스, `selectedIds: Set<string>` | `page.tsx:104` 상태 선언, `727-734` 행 체크박스, `231-238` `toggleOne` | ✅ | Set 사본 갱신 — Design § 3.3 의사코드와 동일 |
| **FR-05** | 헤더 체크박스가 **필터된 전체** 단위 (페이지 단위 아님) | `page.tsx:240-250` `toggleAllFiltered` → `for (const d of filtered)` 순회 | ✅ | `items`(현재 페이지)가 아니라 `filtered` 사용 확인 |
| **FR-06** | "선택 N건 · 합계 X원" + 해제 버튼, ≥1건일 때 노출 | `page.tsx:654-690` `{selectedCount > 0 && (...)}` 조건부 렌더 | ✅ | 카운트·합계·해제 모두 존재 |
| **FR-07** | 선택 CSV — 선택된 행만 | `page.tsx:382-394` → `toSelectedCsv(selectedRows)` | ✅ | `selectedRows`는 `allData.filter(d => selectedIds.has(d.id))` — 필터 무관 전체 선택 ID 기준 |
| **FR-08** | 선택 XLSX — 시트명 "후원자_선택" | `donation-simple-export.ts:56` `book_append_sheet(wb, ws, "후원자_선택")` | ✅ | 헤더 11열 Design § 11.1과 완전 일치 |
| **FR-09** | 필터 변경 시 선택 ID 보존 | `page.tsx:198-200` 필터 변경 `useEffect`는 `setPage(1)`만 호출 | ✅ | `selectedRows`가 `allData` 기준이라 필터와 독립 |
| **FR-10** | tri-state 헤더 체크박스 (all/some/none, indeterminate) | `page.tsx:216-229` `headerCheckState` 계산 + `useEffect`로 `headerCheckboxRef.current.indeterminate = "some"` | ✅ | `filtered.length === 0`도 "none"으로 안전 처리 |

**FR Match: 10/10 (100%)**

---

## 3. UI/UX Gap (Design § 5)

| Design 요건 | Implementation | Status |
|-------------|----------------|:------:|
| Filter bar 4 컨트롤 (date×2, 3-way 토글, 텍스트 검색) | `page.tsx:574-651` 한 flex 행 배치 | ✅ |
| 3-way 토글 디자인 (active = rose, inactive = gray) | `page.tsx:606-609` 조건부 클래스 | ✅ |
| Selection Bar 조건부 렌더 | `page.tsx:654` `{selectedCount > 0 && (...)}` | ✅ |
| Selected row 배경 `bg-rose-50` | `page.tsx:725` `isSelected ? "bg-rose-50 hover:bg-rose-100" : "hover:bg-gray-50"` | ✅ |
| Empty state 분기 | `page.tsx:804-812` `hasActiveFilter ? ... : ...` | ✅ |
| Selection Bar 좌측 4px rose 보더 | `page.tsx:655` `border-l-4 border-rose-500 bg-rose-50` | ✅ |
| 아이콘 `FileDown`/`XCircle` 사용 | import + 669/677/685에서 사용 | ✅ |
| 체크박스 `aria-label` | 헤더 "필터된 전체 선택", 행 `${d.donor_name} 선택` | ✅ Design 기대치 초과 |

**UI/UX Match: 8/8 (100%)**

### Design에 없는 추가 UX (보너스, 의도와 부합)

| 항목 | 위치 | 가치 |
|------|------|------|
| "필터 초기화" 버튼 (활성 필터 ≥1개일 때 노출) | `page.tsx:641-649` | User Flow 4단계 "미세 조정" 효율 향상 |
| 헤더 카운트 "({count}건{필터 시 / 전체 N건})" | `page.tsx:500-504` | 사용자가 필터 영향을 즉시 인지 |
| 합계 라벨 분기 "필터 결과 합계" vs "전체 합계" | `page.tsx:506` | 위와 같은 맥락 |
| 헤더 체크박스 `disabled={filtered.length === 0}` | `page.tsx:702` | tri-state 안전 가드 (FR-10 보강) |
| `hasActiveFilter` flag (4조건 OR) | `page.tsx:489-493` | 빈 상태 메시지 분기에 재사용 |
| 풍부한 `aria-label` | 모든 체크박스 | 접근성 향상 |

---

## 4. Error Handling Gap (Design § 6)

| Design § 6 | Implementation | Status |
|------------|----------------|:------:|
| 선택 0건에서 export 버튼 → `disabled` | Selection Bar는 `selectedCount > 0`일 때만 렌더 (page.tsx:654). 핸들러에도 `if (selectedRows.length === 0) return` 방어 (line 383, 397). | ✅ **Design보다 강한 보장** |
| 날짜 역전(`dateFrom > dateTo`) → 자연스러운 0건 | `page.tsx:163-164`에서 자연 처리 | ✅ |
| CSV/XLSX 생성 오류 → `try/catch` + alert | `page.tsx:384-394` (CSV), `398-408` (XLSX) | ✅ |
| 필터 결과 0건 → "조건에 맞는 후원자가 없습니다." | `page.tsx:807-808` | ✅ |

**Error Handling Match: 4/4 (100%)**

---

## 5. Out-of-Scope Respect (Plan § 2.2)

| 정책 | 검증 위치 | Status |
|------|----------|:------:|
| 회계 양식 export 3종은 항상 전체 데이터 | `handleDownloadExpenseSource`/`NamedIncome`/`AnonIncome` 모두 `await fetchAll()` 후 `toXxxXlsx(all)` 호출 — 선택 상태 무시 | ✅ |
| 일괄 다운로드 버튼 변경 없음 | `handleDownloadAll` 동일 패턴 유지 | ✅ |
| 기존 CSV 버튼 동작 영향 없음 | `fetchAll()` → `toCSV(all)` 그대로 | ✅ |
| `donation-export.ts` 무변경 | import만, 본 작업에서 파일 수정 없음 | ✅ |
| URL 쿼리스트링 동기화 미구현 (out-of-scope) | URL/history API 사용 없음 | ✅ |
| 일괄 삭제/수정 미구현 | export 한정 유지 | ✅ |

**Out-of-Scope Match: 6/6 (100%)**

---

## 6. Module / File Layout Compliance (Design § 9.1)

| Design 요건 | Implementation | Status |
|-------------|----------------|:------:|
| `lib/donation-simple-export.ts` 신규 파일 분리 | 65 lines, 단일 책임 (단순 CSV/XLSX) | ✅ |
| `Donation` 타입 / `isAnonymousDonation` 재사용 | `import { isAnonymousDonation, type Donation } from "./donation-export"` | ✅ |
| 추가 의존성 0 (`xlsx@^0.18.5` 재사용) | `import * as XLSX from "xlsx"` — 신규 패키지 없음 | ✅ |
| 함수 시그니처 `toSelectedCsv` / `toSelectedXlsx` / `buildSelectedFileName` | 정확히 일치 | ✅ |
| 파일명 규약 `후원자_선택_YYYY-MM-DD.{ext}` | `buildSelectedFileName` 일치 | ✅ |
| XSS sanitize (CSV 셀 수식 prefix) | `sanitizeCell` + `csvEscape` | ✅ |
| BOM 추가 (한글 깨짐 방지) | `"﻿" + ...` | ✅ |

---

## 7. Convention Compliance

| 항목 | 규약 | 실제 | Status |
|------|------|------|:------:|
| 상태 명명 | camelCase | `dateFrom`/`dateTo`/`anonFilter`/`selectedIds` | ✅ |
| 타입 명명 | PascalCase | `AnonFilter` | ✅ |
| 함수 명명 | camelCase | 일관 적용 | ✅ |
| 파일명 | kebab-case | `donation-simple-export.ts` | ✅ |
| Import 순서 | React → 외부 → 내부 | 준수 | ✅ |
| TypeScript strict | type-safe | `Set<string>`, `as const`, union literals | ✅ |
| Tailwind 토큰 (rose) | rose-* | rose-50/300/500/600/700 일관 | ✅ |

---

## 8. Overall Score

```
┌─────────────────────────────────────────────┐
│  Overall Match Rate: 100%                    │
├─────────────────────────────────────────────┤
│  Functional Requirements (10):      100%     │
│  UI/UX (§ 5):                       100%     │
│  Error Handling (§ 6):              100%     │
│  Out-of-Scope Respect:              100%     │
│  Module/File Layout (§ 9):          100%     │
│  Convention (§ 10):                 100%     │
├─────────────────────────────────────────────┤
│  보너스 UX 개선 (Design 미명시):     6건     │
│  Status: ✅ Production Ready                │
└─────────────────────────────────────────────┘
```

---

## 9. Recommendations

### 9.1 즉시 조치 (Immediate)

**없음.** 모든 FR/UI/Error 요건이 충족되었으며 Out-of-scope 정책도 준수됨.

### 9.2 선택적 개선 (Optional, Design 문서 동기화)

| 우선순위 | 항목 | 근거 |
|----------|------|------|
| 🟢 Low | Design § 6의 "버튼 disabled" 문구를 "Selection Bar 자체를 `selectedCount > 0` 가드로 미렌더"로 갱신 | 구현은 더 강한 보장. 향후 리뷰어 혼동 방지 |
| 🟢 Low | Design § 5에 "필터 초기화 버튼" 명시 | 실제 구현 반영 |
| 🟢 Low | Design § 5의 헤더 카운트 표기 "({count}건 / 전체 N건)" 명시 | 실제 구현 반영 |
| 🟢 Low | Design § 5의 합계 라벨 분기 명시 | 실제 구현 반영 |

위 항목은 모두 "구현이 Design을 앞서간" 케이스로, 코드 수정이 아닌 Design 문서 보강 항목입니다.

### 9.3 다음 단계

- [ ] `/pdca report donor-search-export` 실행 (Match Rate ≥ 90% 충족)
- [ ] 수동 QA 체크리스트(Design § 8.2) 실행 검증 후 archive

---

## 10. 검증 메타

- **검토 파일**: `src/app/admin/donations/page.tsx`, `src/app/admin/donations/lib/donation-simple-export.ts`
- **참조 파일**: `src/app/admin/donations/lib/donation-export.ts` (미변경 확인)
- **Design 문서**: `docs/02-design/features/donor-search-export.design.md` (v0.1, 2026-05-16)
- **Plan 문서**: `docs/01-plan/features/donor-search-export.plan.md` (v0.1, 2026-05-16)
- **분석 일시**: 2026-05-16
- **분석자**: bkit:gap-detector

---

## Version History

| Version | Date | 변경 | 작성자 |
|---------|------|-----|------|
| 1.0 | 2026-05-16 | 최초 분석 — Match Rate 100% | gap-detector |
