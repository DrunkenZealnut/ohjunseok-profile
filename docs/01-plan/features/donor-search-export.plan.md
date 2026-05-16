---
template: plan
version: 1.2
description: 후원자 목록 고급 검색(날짜, 기명/익명) + 행 선택 후 선택 항목만 파일 저장 Plan
feature: donor-search-export
date: 2026-05-16
author: zealnutkim
project: Ohjunseok 선거사무소
version: 0.1
---

# 후원자 검색·선택 내보내기 (donor-search-export) Planning Document

> **Summary**: `/admin/donations` 후원자 목록에 날짜·기명/익명 필터를 추가하고, 행 단위 체크박스로 선택한 항목만 CSV/XLSX로 내려받는 기능을 구현한다.
>
> **Project**: Ohjunseok 선거사무소 사이트
> **Version**: 0.1
> **Author**: zealnutkim (kcsvictory@gmail.com)
> **Date**: 2026-05-16
> **Status**: Draft

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem (문제)** | 현재 다운로드는 "전체 데이터"만 가능해 특정 기간(예: 5월 2주차)·특정 유형(기명만)·특정 인물 묶음 등으로 부분 추출이 불가능하다. 회계 보고·내부 정산·후원자 감사 인사 발송 등에서 매번 전체 파일을 받아 외부 도구에서 다시 필터링해야 한다. |
| **Solution (해결책)** | 목록 상단에 입금일 범위 + 기명/익명 토글 필터를 추가하고, 각 행 좌측에 선택 체크박스(전체선택 포함)를 두어 "선택 항목만 CSV/XLSX 저장" 액션을 제공한다. 필터·텍스트검색·수동선택은 모두 클라이언트사이드로 합성된다. |
| **Function/UX Effect** | 관리자는 ① 날짜·유형으로 1차 좁히고 ② 검색어로 2차 좁힌 뒤 ③ 체크박스로 최종 선별해 한 번의 클릭으로 파일을 받는다. 선택 건수/합계가 실시간 표기되어 "지금 무엇을 받을지" 즉시 확인된다. |
| **Core Value (핵심가치)** | **부분 보고의 정확성·속도**. 회계 마감, 분기 정산, 특정 행사 후원자 추출 같은 실무 시나리오를 한 화면에서 끝낸다. 외부 가공 단계를 제거해 실수를 줄인다. |

---

## 1. Overview

### 1.1 Purpose

후원자 목록(`/admin/donations`)에서 ① 입금일 기간, ② 기명/익명 유형, ③ 텍스트 검색(기존), ④ 행 단위 선택을 조합해 원하는 데이터만 파일로 저장할 수 있게 한다.

### 1.2 Background

- 직전 커밋(`1915bf8`)에서 텍스트 검색·전체합계 표시·클라이언트사이드 페이지네이션이 추가되어, 전체 데이터를 한 번에 메모리에 로드하는 구조가 확립됨.
- 그러나 다운로드 버튼들(`수입지출처 XLS`, `수입내역(기명) XLS`, `익명수입자 XLS`, `일괄 다운로드`, `CSV`)은 모두 `fetchAll()`로 새 API 콜을 해 **항상 전체 데이터**를 받아 처리함.
- 실무에서 자주 발생하는 요구:
  - "5월 1일~5월 14일 기간 기명 후원자만 뽑아달라" (특정 기간 정산)
  - "특정 행사 참석자 5명만 골라 감사 메시지 발송 리스트 추출"
  - "익명만 따로 점검"
- 따라서 **필터 + 수동 선택 + 선택 항목 export** 흐름이 필요.

### 1.3 Related Documents

- 직전 커밋: `1915bf8 feat(donations): 전체/검색결과 합계 표시 + 후원자 검색 기능`
- 현재 구현 파일: `src/app/admin/donations/page.tsx`
- 회계 양식 export 유틸: `src/app/admin/donations/lib/donation-export.ts`
- 데이터 스키마: `donations` 테이블 (`donor_name`, `resident_id`, `phone`, `address`, `detail_address`, `postal_code`, `is_anonymous`, `email`, `amount`, `deposit_date`, `created_at`)
- 익명 판별 sentinel: `isAnonymousDonation()` in `donation-export.ts` (앞 6자리 = 111111)

---

## 2. Scope

### 2.1 In Scope

- [ ] **입금일 범위 필터** (시작일/종료일 `<input type="date">` 2개, 빈 값 허용)
- [ ] **기명/익명 필터** (전체 / 기명 / 익명, 3-way 토글)
- [ ] **행 단위 선택 체크박스**
  - 행 좌측에 체크박스 컬럼 추가
  - 헤더에 "현재 보이는 결과 전체 선택" 체크박스 (필터된 전체 기준, 페이지 단위 아님)
  - 선택 상태는 `id` 기준으로 보관하여 페이지를 넘겨도 유지
- [ ] **선택 현황 바**
  - 선택된 건수 / 선택된 금액 합계 실시간 표시
  - "선택 해제" 버튼
- [ ] **선택 항목 내보내기 액션**
  - "선택 항목 CSV 저장" 버튼 (기존 CSV 포맷 재사용, 선택된 행만)
  - "선택 항목 XLSX 저장" 버튼 (단순 표 형식 — 회계 양식이 아닌 일반 표)
  - 선택 0건일 때는 비활성
- [ ] 기존 회계 양식 3종 + 일괄 다운로드 버튼은 **변경 없음** (항상 전체 데이터, 별도 분리)
- [ ] 검색·필터·선택 상태는 모두 클라이언트사이드(이미 `allData` 전체 로드 구조 활용)

### 2.2 Out of Scope

- URL 쿼리스트링 동기화 (필터 상태를 URL에 보관) — 추후 별도 PR
- 서버사이드 필터링/검색 (데이터 규모가 작아 클라이언트만으로 충분)
- 선택 항목을 회계 양식(XLSX 3종)으로 export — 회계는 항상 전체 데이터 사용 정책 유지
- 일괄 삭제·수정 — 본 기능은 "내보내기"에 한정

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | 요구사항 | 우선순위 | 상태 |
|----|---------|---------|------|
| FR-01 | 입금일 시작/종료일 필터: `deposit_date` 기준 inclusive 범위. 한쪽만 입력해도 동작 | High | Pending |
| FR-02 | 기명/익명 3-way 필터: `isAnonymousDonation(d)` 기준 (전체/기명/익명) | High | Pending |
| FR-03 | 텍스트 검색(기존) + 날짜 + 유형 필터는 AND 결합 | High | Pending |
| FR-04 | 각 행에 체크박스. 선택 상태는 `id` 기준 `Set<string>`로 보관 | High | Pending |
| FR-05 | 헤더 체크박스: 현재 필터된 전체(`filtered`) 모두 선택/해제 (페이지 단위가 아님) | High | Pending |
| FR-06 | 선택 현황 바: "선택 N건 · 합계 X원" + "선택 해제" 버튼 (선택 ≥ 1건일 때 노출) | High | Pending |
| FR-07 | "선택 항목 CSV 저장" — 기존 `toCSV()` 재사용, 선택된 행만 | High | Pending |
| FR-08 | "선택 항목 XLSX 저장" — 단순 표 형식(헤더 + 데이터), 회계 양식 아님 | Medium | Pending |
| FR-09 | 필터/검색이 바뀌어도 이미 선택된 `id`는 보존 (단, 필터로 사라진 행은 화면에 안 보일 뿐 선택 상태 유지) | Medium | Pending |
| FR-10 | 페이지 이동, 필터 변경 시 선택 상태가 시각적으로 일관(체크박스 표시 정확) | High | Pending |

### 3.2 Non-Functional Requirements

| 카테고리 | 기준 | 측정 방법 |
|---------|------|----------|
| 성능 | 1,000건 데이터에서 필터·검색·선택 토글 100ms 이하 | 수동 측정 (React DevTools Profiler) |
| 접근성 | 체크박스에 `aria-label`, 키보드(스페이스바) 동작 | 수동 검증 |
| UX 일관성 | 기존 검색창·테이블 스타일과 일치 (rose 톤, rounded-lg) | 시각 검토 |
| 데이터 안전 | 선택 항목 export는 클라이언트 메모리 데이터만 사용(서버 호출 X) | 코드 리뷰 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 필터 3종(날짜 범위, 기명/익명, 텍스트) 동시 적용 시 결과 정확
- [ ] 선택 체크박스가 페이지 이동·필터 변경 시에도 일관되게 동작
- [ ] 선택 N건 · 합계 표시 실시간 갱신
- [ ] CSV / XLSX 내보내기 파일이 선택된 행만 포함
- [ ] 기존 회계 양식 다운로드(전체 데이터) 동작 영향 없음
- [ ] `npx tsc --noEmit` 통과

### 4.2 Quality Criteria

- [ ] 빌드 성공 (`npm run build`)
- [ ] 모바일·데스크톱 양쪽에서 필터 UI 사용 가능 (반응형)
- [ ] 빈 상태(선택 0건, 필터 결과 0건) 안내 문구 명확

---

## 5. Risks and Mitigation

| 위험 | 영향 | 가능성 | 완화 방안 |
|-----|-----|-------|----------|
| 필터 UI가 늘어나 헤더 영역이 복잡해짐 | Medium | High | 필터 영역을 별도 패널/접기 가능한 섹션으로 분리 검토 (Design 단계) |
| 선택 상태 ↔ 필터 변경 간 상호작용이 사용자에게 헷갈림 | Medium | Medium | 선택 현황 바에 "필터 밖 N건 포함" 같은 보조 안내 표기 |
| XLSX 라이브러리 추가로 번들 사이즈 증가 | Low | Low | 회계 export에서 이미 `xlsx-populate`(또는 동등) 사용 중인지 확인 후 동일 라이브러리 재사용 |
| 대량 데이터(1만건 가정)에서 클라이언트 필터 느려짐 | Low | Low | 본 프로젝트 데이터 규모(수백건)에서는 무시 가능. `useMemo` 활용 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | 특징 | 권장 대상 | 선택 |
|-------|-----|----------|:----:|
| **Starter** | 단순 구조 | 정적 사이트 | ☐ |
| **Dynamic** | 기능 모듈 + 백엔드(Supabase) | 본 프로젝트 ✅ | ☑ |
| **Enterprise** | 엄격한 레이어 분리 | 고트래픽 시스템 | ☐ |

### 6.2 Key Architectural Decisions

| 결정 | 옵션 | 선택 | 근거 |
|-----|------|-----|------|
| Framework | Next.js (App Router) | **Next.js** | 기존 프로젝트 표준 |
| State | useState + useMemo | **useState/useMemo** | 단일 페이지 로컬 상태로 충분 |
| 데이터 로드 | 서버 페이지네이션 / 전체 로드 | **전체 로드** | 직전 커밋에서 이미 채택, 데이터 규모상 적합 |
| XLSX 생성 | 기존 `donation-export.ts` 의존성 재사용 | **재사용** | 신규 라이브러리 도입 회피 |
| 필터 UI 배치 | 헤더 내 / 별도 패널 | **헤더 직하 1줄** | Design 단계에서 모바일 레이아웃 확정 |
| 선택 자료구조 | `Set<string>` / `Record<string, boolean>` | **`Set<string>`** | 토글 단순, 크기 추적 쉬움 |

### 6.3 Folder Structure (변경 사항)

```
src/app/admin/donations/
├── page.tsx                       # 필터 UI + 선택 체크박스 추가
└── lib/
    ├── donation-export.ts         # (기존, 회계 양식)
    └── donation-simple-export.ts  # 신규 — 단순 CSV/XLSX (선택 항목용)
```

> `donation-simple-export.ts`로 분리하는 이유: 회계 양식과 일반 표 양식의 책임을 명확히 나누고, 회계 양식 변경 시 단순 export가 영향받지 않게 함. (Design에서 확정)

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` 존재
- [x] `AGENTS.md` 존재 (Next.js 주의사항)
- [x] `.impeccable.md` 디자인 가이드 존재 (모바일 우선, rose 톤, Lucide 아이콘)
- [x] TypeScript strict 모드
- [x] Tailwind 기반 스타일링

### 7.2 Conventions to Define/Verify

| 카테고리 | 현 상태 | 본 작업 추가 사항 | 우선순위 |
|---------|--------|----------------|:--------:|
| **Naming** | camelCase (state), PascalCase (component) | `selectedIds`, `dateFrom`, `dateTo`, `anonFilter` | Low |
| **컬러 토큰** | rose-600 (primary), gray-* | 변경 없음 | - |
| **아이콘** | lucide-react | `Calendar`, `CheckSquare`, `Square`, `Filter` 추가 사용 가능 | Low |

### 7.3 Environment Variables Needed

| 변수 | 용도 | 추가 필요 |
|-----|------|:-------:|
| 없음 | 본 기능은 환경변수 추가 없음 | ☐ |

### 7.4 Pipeline Integration

본 기능은 기존 페이지 개선이므로 9-Phase Pipeline 별도 진입 불필요. Phase 4(API) 변경 없음, Phase 6(UI Integration) 범위.

---

## 8. Next Steps

1. [ ] Design 문서 작성 (`/pdca design donor-search-export`)
   - 필터 UI 레이아웃(데스크톱·모바일) 와이어프레임
   - 선택 상태 자료구조와 React 상태 흐름 다이어그램
   - 단순 XLSX 생성 함수 시그니처
2. [ ] 사용자 확인: 회계 양식 export는 "선택 무시 전체"로 유지하는 정책에 동의?
3. [ ] 구현 (`/pdca do donor-search-export`)
4. [ ] Gap 분석 (`/pdca analyze donor-search-export`)
5. [ ] 완료 보고서 (`/pdca report donor-search-export`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|--------|--------|
| 0.1 | 2026-05-16 | Initial draft — 날짜·기명/익명 필터 + 행 선택 + 선택 항목 export 기획 | zealnutkim |
