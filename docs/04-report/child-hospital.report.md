# 완료 보고서: 달빛어린이병원 캠페인 페이지 (child-hospital)

> **Summary**: 동대문구청에 전달한 3,025명 주민 서명 캠페인을 단일 페이지로 종합 정리. 99% Match Rate 달성.
>
> **Author**: DrunkenZealnut
> **Created**: 2026-05-14
> **Completed**: 2026-05-14
> **Status**: Approved

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **Feature** | child-hospital |
| **시작일** | 2026-05-14 |
| **완료일** | 2026-05-14 |
| **실제 소요** | 1일 |
| **상태** | ✅ 완료 |

## 2. 실행 결과 요약

| 지표 | 값 |
|------|-----|
| **Design Match Rate** | 99% |
| **신규 파일** | 11개 |
| **수정 파일** | 2개 |
| **자산(사진)** | 2장 |
| **Gap 건수** | 3건 (모두 의도적/선택) |
| **TypeScript 검사** | ✅ 통과 |
| **ESLint** | ✅ 통과 |

## 3. Executive Summary

### 3.1 프로젝트 정보

| 관점 | 내용 |
|------|------|
| **Problem** | 동대문구는 야간·휴일 소아 진료를 책임지는 달빛어린이병원이 0개. 3~40대 어린 자녀 가정이 매일 응급실 뺑뺑이를 겪지만, 후보의 대응을 보여주는 사이트 콘텐츠가 없었음. |
| **Solution** | 진보당 2월 추진본부 설립 → 4월 21일 주민 3,025명 서명 동대문구청 전달 전 과정을 타임라인·사진·기사 인용으로 담은 단일 페이지(`/child-hospital`) 구현 |
| **Function & UX Effect** | 유권자가 한 페이지 내 1분 안에 "제도란? → 동대문 현황(0개) → 활동 기록(3,025명) → 다음 약속"을 파악. 서명 전달 사진과 거리 캠페인 사진이 결정적 증거로 작용. 99% 디자인 일치율로 기술 신뢰성 확보. |
| **Core Value** | "어린 자녀를 둔 같은 이웃이, 같은 문제를 풀기 위해 이미 행동했다" — 공감대 + 실행력을 사진·숫자·기사라는 팩트로 증명. 감정이 아닌 데이터와 증거로 신뢰 구축. |

---

## 4. PDCA 사이클 요약

### 4.1 Plan (계획)
- **문서**: `docs/01-plan/features/child-hospital.plan.md`
- **핵심**: 현황 데이터 3개(3,025 / 0 / 121) + 타임라인 + 후보 메시지를 하나의 페이지로 종합
- **의존성**: 사진 2장 + 기사 출처 1개
- **핵심 결정**:
  - D1: URL `/child-hospital` (영문 케밥 컨벤션)
  - D2: 독립 페이지
  - D3: 거리 사진 180° 회전 처리
  - D4: 기사 직접 인용 대신 후보 메시지 재작성
  - D5: 다음 단계 공약 (후보 검토 대기)
  - D6: footer + 메인 페이지 카드 진입 동선

### 4.2 Design (설계)
- **문서**: `docs/02-design/features/child-hospital.design.md`
- **구조**: 8개 컴포넌트 + 데이터 모듈 + 네비게이션 통합
- **컴포넌트**:
  1. ChildHospitalHero — 스카이블루 그라데이션 + 결정적 헤드라인
  2. DeliveryPhoto — 1280×853 서명 전달 사진 (priority)
  3. KeyNumbers — 3,025 / 0 / 121 카드 3개
  4. WhatIsDalbit — 달빛어린이병원 제도 설명
  5. CampaignTimeline — 타임라인 4단계
  6. CandidateMessage — 후보 톤 메시지 + 거리 사진
  7. NextSteps — 구의원 당선 시 3가지 공약
  8. ShareCta — 의견 보내기 / 응원하기 CTA
- **데이터**: KeyNumber / PhotoAsset / NextStepItem 타입 + 5가지 상수 정의
- **네비게이션**: footer 메뉴 추가 + HomeActionCards 신규 컴포넌트

### 4.3 Do (실행)
- **산출물**:
  - 페이지 1개: `src/app/child-hospital/page.tsx`
  - 컴포넌트 8개: `src/components/child-hospital/*.tsx`
  - 데이터 1개: `src/data/child-hospital.ts`
  - 카드 1개: `src/components/home-action-cards.tsx`
  - 자산: `public/child-hospital/signature-delivery.jpg`, `street-campaign.jpg`
  - 수정: `src/components/footer.tsx`, `src/app/page.tsx`

**실행 중 발견**:
- 두 원본 사진 파일의 의미가 EXIF rotation 때문에 시각적으로 뒤바뀌어 있음을 발견
- 파일명 swap 후 거리 사진만 180° 회전하여 양쪽 모두 정상 방향 확인

### 4.4 Check (검증)
- **분석 문서**: `docs/03-analysis/child-hospital.analysis.md`
- **Match Rate**: 99% (기준 90% 통과)
- **카테고리별 점수**: 모든 항목 100% 또는 의도적 보정
- **Gap 3건** (모두 합리적):
  - G1: `CAMPAIGN_PHOTO` 메타 변경 (실제 자산 메타 반영, 명세에 "후보 확정 시 수정" 주석 있음)
  - G2: `CandidateMessage` 임시 표기 생략 (후보 톤으로 다듬어 게시)
  - G3: OG 1200×630 변형본 미생성 (명세 R4에서 "선택"으로 명시)

---

## 5. 핵심 결정사항 회고

| # | 결정 | 내용 | 결과 |
|---|------|------|------|
| D1 | URL 경로 | `/child-hospital` | ✅ 기존 영문 케밥 컨벤션 일치 |
| D2 | 페이지 구조 | 독립 페이지 (footer + 메인 카드) | ✅ 진입 동선 확보 + 사이트 내 발견성 향상 |
| D3 | 사진 처리 | 거리 사진만 180° 회전 → EXIF 회전 적용 | ✅ 의미 매핑 복구 + 정상 방향 확인 |
| D4 | 콘텐츠 톤 | 기사 직접 인용 대신 후보 메시지 재작성 | ✅ 후보 본인의 목소리로 공감대 형성 |
| D5 | "다음 단계" | Design 단계 임시 카피 → 후보 최종 검토 단계 | ⏳ 후속 작업 (최종 확인 대기) |
| D6 | 진입 동선 | footer 메뉴 + 메인 페이지 활동 카드 | ✅ 이중 터치포인트로 접근성 향상 |

**자료 매핑 검증의 중요성**:
- 원본 사진 2개의 의미가 EXIF rotation으로 인해 시각적으로 뒤바뀌어 있었던 사례
- 저장소에 넣기 직전 시각적 확인이 없었으면 잘못된 콘텍스트가 페이지에 반영될 뻔했음
- **다음 PDCA에 학습**: 멀티미디어 자산은 사용 직전 시각 검증 필수

---

## 6. 정량 지표

### 6.1 파일/코드

| 항목 | 수량 |
|------|------|
| 신규 파일 | 11개 |
| ├─ 페이지 | 1개 |
| ├─ 컴포넌트 | 8개 |
| ├─ 데이터 | 1개 |
| └─ 카드 | 1개 |
| 수정 파일 | 2개 |
| ├─ footer.tsx | 1줄 추가 |
| └─ page.tsx | <HomeActionCards/> 삽입 |
| 자산 | 2장 (사진) |

### 6.2 품질 지표

| 항목 | 결과 |
|------|------|
| Design Match Rate | 99% |
| TypeScript 타입 검사 | ✅ 통과 |
| ESLint | ✅ 통과 |
| Accessibility | 시맨틱 마크업 완료 (alt, figure/figcaption, semantic HTML) |

### 6.3 UX 지표

| 항목 | 달성 |
|------|------|
| 페이지 로드 시간 (목표 LCP < 2.5s) | Hero 이미지 priority + fetchpriority="high" 설정 |
| 모바일 레이아웃 | px-5 + max-w-3xl + grid-cols-1 md:grid-cols-3 대응 |
| 터치 타겟 | 모든 버튼/링크 44px 이상 |
| 본문 가독성 | text-base (16px+) + leading-relaxed (1.6+) |
| 공유 친화성 | OG 메타 설정 + signature-delivery.jpg 결정적 한 컷 |

---

## 7. 구현 상세

### 7.1 신규 파일

```
src/
├── app/
│   └── child-hospital/
│       └── page.tsx                         # 메타데이터 + 8개 컴포넌트 조합
├── components/
│   ├── child-hospital/
│   │   ├── ChildHospitalHero.tsx            # 스카이블루 그라데이션 + party-red chip
│   │   ├── DeliveryPhoto.tsx                # 결정적 한 컷 (1280×853)
│   │   ├── KeyNumbers.tsx                   # 3카드 (3,025 / 0 / 121)
│   │   ├── WhatIsDalbit.tsx                 # 제도 설명 (3 문단)
│   │   ├── CampaignTimeline.tsx             # 타임라인 (4 노드)
│   │   ├── CandidateMessage.tsx             # 후보 메시지 + 거리 사진
│   │   ├── NextSteps.tsx                    # 3가지 구의원 공약
│   │   └── ShareCta.tsx                     # 2버튼 CTA
│   └── home-action-cards.tsx                # 신규 (메인 페이지 활동 카드)
└── data/
    └── child-hospital.ts                    # 5가지 상수 + 3가지 타입

public/child-hospital/
├── signature-delivery.jpg                   # 1280×853 (gallery_11 원본)
└── street-campaign.jpg                      # 3231×2187 (180° 회전 적용)
```

### 7.2 수정 파일

**src/components/footer.tsx**
```
FOOTER_LINKS에 1줄 추가:
{ label: "달빛어린이병원", href: "/child-hospital" }
```
위치: "주민의견" 다음 (상위 노출)

**src/app/page.tsx**
```
import HomeActionCards from "@/components/home-action-cards";

위치: <Pledges /> 와 <Contact /> 사이
```

---

## 8. 향후 작업

### 8.1 검증 확인 (운영)

- [ ] `npm run dev` 시 `/child-hospital` 페이지 시각 확인
  - 모바일 375px: 가로 스크롤 없음 확인
  - 태블릿 768px: 2열 이상 정렬 정상 동작
  - 데스크톱 1280px: 최대 너비 제한 확인
- [ ] 메인 페이지 `/` 에서 HomeActionCards 카드 노출 + 링크 동작 확인
- [ ] 사진 방향 최종 확인 (특히 street-campaign.jpg 거리 캠프 상태)

### 8.2 성능 모니터링

- [ ] Lighthouse 모바일 점수 실측
  - Performance >= 85 (목표)
  - Accessibility >= 90 (목표)
  - LCP < 2.5s (Hero 이미지 우선 로드)
- [ ] 카톡 공유 OG 미리보기 모니터링
  - 결정적 한 컷(signature-delivery.jpg)이 정상 노출되는지 확인
  - 잘림 발생 시 1200×630 변형본 생성 검토

### 8.3 콘텐츠 최종 검토

- [ ] `CandidateMessage` 본문 (3 문단) 후보 본인 최종 검토
  - 톤, 사실관계, 다음 약속(NextSteps와의 일관성)
  - 필요시 수정 후 게시

### 8.4 선택 작업

- [ ] (선택) OG 1200×630 변형본 생성 및 적용
  - 카톡 미리보기에서 결정적 한 컷이 너무 많이 잘릴 경우

---

## 9. 학습 사항

### 9.1 기술 학습

**자료 매핑 검증의 중요성**
- 원본 사진 파일 2개가 EXIF rotation 때문에 시각적으로 뒤바뀌어 있었음
- 파일 이름만으로는 실제 콘텐츠를 파악할 수 없으므로, 멀티미디어 자산은 사용 직전 시각적 확인 필수
- 이전 PDCA에서 발견하지 못한 뒤 저장소에 잘못된 파일을 넣고 있었다면 큰 신뢰 손상이 발생할 뻔했음

**컴포넌트 패턴 재사용의 가치**
- `crosswalk-action` 패턴(Hero + 섹션 스택 + 타임라인 + CTA)을 거의 그대로 따라가면서 99% 매칭 달성
- 사실상 디자인 시스템화된 이 패턴은 신규 활동 페이지에 매우 효율적
- 다음 활동 페이지도 동일 구조를 따르면 빠른 구현 + 일관성 보장 가능

### 9.2 협업 학습

**자산 검증 프로세스**
- Do 단계 진입 전 사용할 모든 멀티미디어 자산(사진, 비디오 등)을 목록화하고 검증
- 특히 사진은 EXIF 회전 문제가 흔하므로, 저장소 진입 직전 시각 확인 필수
- 후속 PDCA에서는 Design 단계에 "자산 검증 체크리스트" 항목 추가 고려

**"다음 단계" 공약의 후속 처리**
- D5 (다음 단계 공약)는 Design 단계 임시 작성 → 후보 최종 검토로 분리
- 현재 상태: 구현은 100% 완료이나 후보 톤 최종 확정 대기
- 다음 회차부터 미결정 콘텐츠는 "명시적으로 보류" 상태로 추적하면 더 깔끔할 것 같음

---

## 10. 다음 단계

### 10.1 직후 작업 (2-3일 내)
1. 모바일/태블릿/데스크톱 각각 시각 확인 (3가지)
2. 후보 본인의 메시지 본문 최종 검토
3. Lighthouse 점수 실측

### 10.2 중기 작업 (필요시)
1. OG 1200×630 변형본 생성 (카톡 공유 미리보기 최적화)
2. 추가 사진 필요시 요청 (현재 2장으로 충분한지 모니터링)

### 10.3 관련 문서
- Plan: `docs/01-plan/features/child-hospital.plan.md`
- Design: `docs/02-design/features/child-hospital.design.md`
- Analysis: `docs/03-analysis/child-hospital.analysis.md`
- Archive: (완료 후 `/pdca archive child-hospital` 실행)

---

## 11. 결론

**child-hospital 기능은 1일 만에 99% Match Rate로 완료.**

동대문구 어린 자녀 가정의 가장 뜨거운 현실(야간 응급실 뺑뺑이)을 3,025명의 서명이라는 팩트로 보여주는 페이지를 성공적으로 구현했다. 후보의 공감대와 실행력을 데이터와 사진으로 증명하는 디자인 의도가 모두 기술로 실현되었다.

남은 작업은 코드 변경이 아닌 **운영 레벨 확인 3건** (모바일 시각, 후보 검토, 성능 실측)이며, 모두 예상된 항목들이다. 다음 PDCA에서는 "자료 매핑 검증" 프로세스를 정식으로 Design 단계에 포함시켜 같은 실수를 방지하자.

---

## 12. 체크리스트

### 실행 완료
- [x] Plan 문서 작성 및 승인
- [x] Design 문서 작성 및 검증
- [x] 파일 구조 생성 (11개 신규)
- [x] 8개 컴포넌트 구현
- [x] 데이터 모듈 작성 (5가지 상수 + 3가지 타입)
- [x] 사진 2장 보정 및 저장
- [x] footer + 메인 페이지 통합
- [x] Gap 분석 (Match Rate 99%)
- [x] TypeScript + ESLint 통과
- [x] 보고서 작성

### 대기/후속
- [ ] 모바일/태블릿/데스크톱 시각 확인
- [ ] 후보 메시지 최종 검토
- [ ] Lighthouse 성능 실측
- [ ] OG 1200×630 변형본 (선택)
- [ ] 완료 후 Archive

