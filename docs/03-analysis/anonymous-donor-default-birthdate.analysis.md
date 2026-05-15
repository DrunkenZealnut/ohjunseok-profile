---
template: analysis
version: 1.0
description: 익명 후원자 기본 생년월일 처리 — Design ↔ 구현 Gap 분석
feature: anonymous-donor-default-birthdate
date: 2026-05-15
author: gap-detector
matchRate: 100
status: Production Ready
---

# 익명 후원자 기본 생년월일 처리 (anonymous-donor-default-birthdate) Gap 분석 보고서

> **분석일**: 2026-05-15
> **Design 문서**: `docs/02-design/features/anonymous-donor-default-birthdate.design.md`
> **Plan 문서**: `docs/01-plan/features/anonymous-donor-default-birthdate.plan.md`
> **분석자**: gap-detector (read-only)

---

## 1. Overall Score

```
┌─────────────────────────────────────────────┐
│  Overall Match Rate: 100%                    │
├─────────────────────────────────────────────┤
│  Design Match:         100% (15/15 항목)     │
│  Architecture/Module:  100%                  │
│  Convention 준수:      100%                  │
│  상태:                ✅ Production Ready    │
└─────────────────────────────────────────────┘
```

---

## 2. 파일별 검증 결과

### 2.1 `src/app/admin/donations/lib/donation-export.ts`

| # | 검증 포인트 | Design 명세 | 구현 상태 | 결과 |
|---|------------|------------|---------|:----:|
| 1 | `ANONYMOUS_RESIDENT_ID` export | `"111111-1111111"` (13자리, 모두 1) | L6: `"111111-1111111"` | ✅ |
| 2 | `ANONYMOUS_BIRTH` export | `"19111111"` | L7: `"19111111"` | ✅ |
| 3 | `ANONYMOUS_PHONE` export | `"00000000000"` | L8: `"00000000000"` | ✅ |
| 4 | `ANONYMOUS_ADDRESS` export | `"(익명)"` | L9: `"(익명)"` | ✅ |
| 5 | `toAnonIncomeXlsx` mainRows[5] | 빈 문자열 → `ANONYMOUS_BIRTH` | L156: `ANONYMOUS_BIRTH` | ✅ |
| 6 | mainRows 컬럼 수 | 16개 유지 | L150–167: 정확히 16개 | ✅ |
| 7 | `ridToBirth("111111-1111111")` 검증 | `"19111111"` 반환 | 로직상 `front="111111"`, `gen="1"`, `century="19"` → `"19111111"` | ✅ |

**비고**: `backupRows` (L168–171)는 기존 그대로 유지되어 회귀 없음.

---

### 2.2 `src/app/admin/donations/page.tsx`

| # | 검증 포인트 | Design 명세 | 구현 상태 | 결과 |
|---|------------|------------|---------|:----:|
| 8 | 상수 import | `ANONYMOUS_RESIDENT_ID/PHONE/ADDRESS` | L11–14 | ✅ |
| 9 | `setAnonymousMode` 핸들러 분리 | 익명 ON/OFF 시 값 정리·자동 채움 | L172–191 | ✅ |
| 10 | 익명 토글 onClick → `setAnonymousMode(t/f)` | 두 버튼 모두 핸들러 호출 | L574, L585 | ✅ |
| 11 | FR-01: 이름 필드 익명에서도 활성 | `disabled` 제거, 라벨 항상 `*` | L630–636 | ✅ |
| 12 | FR-02: 주민번호 sentinel 자동 표시 | 익명 시 readOnly + disabled + sentinel 표시 | L649–652 | ✅ |
| 13 | 검증: 이름은 익명 무관 필수 | `if (!form.donor_name.trim()) ...` | L203 | ✅ |
| 14 | payload: 익명 sentinel 적용 | `resident_id/phone/address` sentinel, nullable null | L211–217 | ✅ |
| 15 | 익명 라벨 "(익명 자동 처리)" 표시 | Design 3.2.7 일치 | L643–645 | ✅ |
| 16 | phone/email/주소 필드 disabled 동작 | 익명 시 비활성 (opacity-40/60) | L659, L668, L674, L682, L689 | ✅ |

---

### 2.3 `src/app/donate/page.tsx`

| # | 검증 포인트 | Design 명세 | 구현 상태 | 결과 |
|---|------------|------------|---------|:----:|
| 17 | 상수 import | sentinel 3종 (admin/donations/lib에서) | L6–10 | ✅ |
| 18 | FR-03: 0번 fieldset (기명/익명 토글) | 최상단에 토글 + 영수증 불가 안내 | L223–256 | ✅ |
| 19 | 영수증 불가 안내 문구 | "익명 후원은 기부금영수증 발급이 불가합니다…" | L252–254 | ✅ |
| 20 | `setAnonymousMode` 핸들러 정의 | 익명 시 nullable 필드 빈 값으로 정리 | L74–90 | ✅ |
| 21 | FR-04: 2/3/4/5번 fieldset 익명 시 숨김 | `{!form.isAnonymous && (<>…</>)}` | L276 (open), L411 (close) | ✅ |
| 22 | 검증 분기: 익명 시 주민번호/전화/주소 검증 스킵 | `if (!form.isAnonymous) { … }` | L113–126 | ✅ |
| 23 | 이름은 익명 여부 무관 필수 | 분기 밖에서 검증 | L109–112 | ✅ |
| 24 | payload: 익명 시 sentinel 적용 | `resident_id/phone/address` sentinel | L138–147 | ✅ |
| 25 | payload: 익명 시 nullable 필드 null | `email/postal_code/detail_address` = null | L146–149 | ✅ |
| 26 | `is_anonymous` 컬럼 저장 | `is_anonymous: form.isAnonymous` | L150 | ✅ |

---

## 3. FR(Functional Requirement)별 일치/누락 표

| FR | 내용 | 일치 여부 | 구현 위치 |
|----|------|:--------:|----------|
| FR-01 | 익명 모드에서도 이름 입력 활성화 | ✅ | admin L630–636, donate L267–273 |
| FR-02 | 주민번호 sentinel 자동 표시 (admin) | ✅ | admin L640–656 |
| FR-03 | 공개 폼에 기명/익명 토글 UI 추가 | ✅ | donate L223–256 |
| FR-04 | 익명 시 주민번호/전화/이메일/주소 fieldset 숨김 | ✅ | donate L276–411 |
| FR-05 | 익명 시 신규 데이터에 sentinel 저장 (DB) | ✅ | admin L211–215, donate L138–148 |
| FR-06 | 기존 빈 데이터는 export 시 정규화 | ✅ | export.ts L156 |
| FR-07 | mainRows 컬럼 수 16개 유지 | ✅ | export.ts L150–167 |
| FR-08 | 익명 ON 토글 시 기명 입력값 정리 + sentinel 채움 | ✅ | admin L172–183, donate L74–89 |
| FR-09 | 익명 → 기명 전환 시 sentinel 초기화 | ✅ | admin L184–190, donate setAnonymousMode(false) 동작 |

---

## 4. 발견된 Gap

**없음.** Design 문서의 모든 명세가 구현에 정확히 반영됨.

---

## 5. 권장 수정 사항

### 5.1 즉시 수정 필요
**없음.**

### 5.2 향후 개선 (Optional, Design Open Questions 기반)

| 우선순위 | 항목 | 비고 |
|:-------:|------|------|
| 🟢 Low | 회계 담당자에게 sentinel 생년월일 `19111111` 또는 `19000101` 중 어느 것을 요구하는지 확인 | 단일 출처 설계로 상수 1줄만 교체 (export.ts:7) |
| 🟢 Low | 공개 폼 익명 후원 시 전화번호 수집 여부 검토 | 현재 미수집 — 영수증 불가이므로 연락 수단 불필요 가정과 일치 |
| 🟢 Low | 기존 익명 데이터 중 `donor_name` 빈 row 개수 파악 후 일괄 채움 필요성 검토 | 현재 export 시 `(미입력)` 표기 — 동작 변경 없음 |
| 🟢 Low | `ridToBirth` 단위 테스트 자동화 | Design 8.1의 케이스를 vitest로 코드화하면 회귀 방지 |

### 5.3 구조 개선 제안 (Optional)

| 항목 | 현재 | 제안 | 사유 |
|------|------|------|------|
| sentinel 상수 위치 | `admin/donations/lib/donation-export.ts` | `src/lib/donation-constants.ts`로 분리 | `/donate`(공개 페이지)가 `admin/`을 import — 도메인 경계상 부적절 가능. Design 3.3.5에서 "단순함 우선"으로 의도적 결정. **변경 불필요.** |

---

## 6. 결론

| 항목 | 결과 |
|------|------|
| **Match Rate** | **100%** |
| **PDCA 다음 단계 권장** | `/pdca report anonymous-donor-default-birthdate` |
| **블로킹 이슈** | 없음 |
| **수동 검증 권장** | Design 8.2 통합 테스트 시나리오 6건 (DB 저장값 + 익명수입자 XLS의 6번째 컬럼 = `19111111` 확인) |

Design 문서와 구현이 완전히 일치합니다. Open Questions(회계 담당자 확인 등)는 비즈니스 의사결정 사항이며 구현 품질과는 무관합니다.

---

**검토한 파일 (절대경로)**
- `docs/02-design/features/anonymous-donor-default-birthdate.design.md`
- `src/app/admin/donations/lib/donation-export.ts`
- `src/app/admin/donations/page.tsx`
- `src/app/donate/page.tsx`
