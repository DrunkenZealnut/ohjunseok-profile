---
template: plan
version: 1.2
feature: official-pamphlet-mainpage
date: 2026-05-21
author: kcsvictory@gmail.com
project: Ohjunseok 2026 (Election2026)
status: Draft
---

# official-pamphlet-mainpage Planning Document

> **Summary**: 공식 책자형 선거공보물(8p)의 핵심 메시지·공약·활동 성과를 메인페이지에 정합성 있게 반영하여, 인쇄물 - 웹 - 카카오 공유 전 경로에서 동일한 후보 서사를 전달한다.
>
> **Project**: Ohjunseok 2026 (Election2026)
> **Version**: 0.1.0
> **Author**: kcsvictory@gmail.com
> **Date**: 2026-05-21
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 현재 메인페이지의 `Pledges` 5개 공약("주민 소통 강화", "생활 안전 환경 개선" 등)은 일반론에 불과하여 공식 선거공보물의 3대 카테고리·17개 구체 공약과 어긋난다. 인쇄물을 받은 유권자가 사이트에 와도 같은 메시지를 확인할 수 없고, "데이터로 신뢰를" 원칙도 무너진다. |
| **Solution** | 공식 선거공보물(8p PDF)을 단일 출처(Single Source of Truth)로 삼아 (1) 슬로건·소명서 카피, (2) 3대 카테고리 17개 공약, (3) 핵심 활동 성과 3건(달빛어린이병원·외대앞역·신이문역), (4) 인적사항·경력을 메인페이지 컴포넌트(`Profile`, `Pledges`, `HomeActionCards`)와 신규 `Story`/`Achievements` 섹션에 구조화하여 반영한다. |
| **Function/UX Effect** | 인쇄 선거공보 → 카카오 공유 링크 → 메인페이지로 이어지는 동선에서 동일한 슬로건·핵심 수치(서명 3,025명/3,307명)·17개 공약을 확인할 수 있고, 모바일 스크롤 3번 이내 핵심 메시지 도달이 가능해진다. |
| **Core Value** | "말이 아니라, 하는 후보" — 공식 공보물과 100% 일치하는 메시지로 신뢰성을 확보하고, 3~40대 신혼·육아 가정 핵심 타겟층에 "같은 고민을 하는 이웃" 정체성을 일관되게 전달한다. |

---

## 1. Overview

### 1.1 Purpose

공식 책자형 선거공보물(`data/오준석 책자형 선거공보(8p)_점자공보물.pdf`, 8페이지)에 담긴 후보 서사·공약·활동 기록을 메인페이지(`src/app/page.tsx`)에 누락 없이 반영한다.

- 공보물은 선관위 등록·인쇄·배포된 **법적 공식 문서**이므로 웹사이트 메시지가 이에 우선하여 정합성을 가져야 한다.
- 동시에 웹의 강점(스크롤 인터랙션, 카드 이동, 이미지 갤러리, 외부 링크)을 활용해 공보물보다 더 풍부한 맥락을 제공한다.

### 1.2 Background

**상황**:
- 2026.06.03 제8회 전국동시지방선거 - 동대문구의회의원선거 동대문구 라선거구(이문1·2동), 기호 5번 진보당 오준석 후보.
- 공식 선거공보물 인쇄·배송 완료(`선거벽보.jpeg`, `오준석 후보 벽보_최종out.ai` 자산 존재).
- 카카오톡 공유 + SNS 유입 비중이 절대적 → 인쇄물을 본 유권자가 곧바로 사이트를 방문하는 경로가 핵심.

**현재 메인페이지 갭(2026-05-21 기준)**:
| 영역 | 현재 상태 | 공보물 내용 | 갭 |
|------|----------|-------------|-----|
| `InteractiveHero` | "우리 동네 육아 해결사!" 슬로건 있음 | 동일 슬로건 | ✅ 일치 (그대로 유지) |
| `Profile` | 4개 카드(이름/정당/지역/슬로건) | 기호 5번·생년월일·학력·핵심 경력 누락 | 🚨 보강 필요 |
| `Pledges` | 일반론 5개("주민 소통 강화" 등) | 3대 카테고리(아이/함께/다니기) 17개 구체 공약 | 🚨 전면 교체 |
| `HomeActionCards` | 달빛어린이병원 1개 카드 | 외대앞역(3,307명)·방사능 안전급식·동부간선도로 등 누락 | ⚠️ 확장 필요 |
| 소명서(스토리) | 섹션 자체 없음 | "세 아이를 키우며 이문동을 다시 보게 됐습니다" 핵심 카피 | 🚨 신규 섹션 |
| 반대 프레임 | 없음 | "압수수색 당한 구의회 / 업무추진비 1위 한우 28,894,300원" | ⚠️ 선택적 추가 검토 |

### 1.3 Related Documents

- 공식 선거공보물 PDF: `data/오준석 책자형 선거공보(8p)_점자공보물.pdf`
- 추출 텍스트: `/tmp/ohjunseok-pamphlet.txt` (231줄, 텍스트 레이아웃 보존)
- 선거 벽보 자산: `선거벽보.jpeg`, `오준석 후보 벽보_최종out.ai`
- 디자인 컨텍스트: `.impeccable.md` (Modern·Transparent·Professional, NeuraCORE 참조)
- 관련 기존 PDCA: `docs/01-plan/features/child-hospital.plan.md`, `voter-communication-upgrade.plan.md`
- 후보 이미지: `public/ohjunseok-2026.jpg`, `public/child-hospital/signature-delivery.jpg`

---

## 2. Scope

### 2.1 In Scope

- [ ] 공보물 핵심 데이터를 구조화 (`src/data/pamphlet.ts` 신규)
  - 인적사항(기호·정당·이름·생년월일·학력)
  - 핵심 경력 6+ 항목(현재 직책)
  - 슬로건·소명서 카피(3개 키 메시지)
  - 3대 카테고리 × 17개 공약
  - 핵심 활동 성과 3건(달빛어린이병원·외대앞역·신이문역) + 서명 수치
- [ ] `Profile` 컴포넌트 보강: 기호 5번 강조 + 핵심 경력 4-6줄
- [ ] `Pledges` 컴포넌트 전면 교체: 일반론 5개 → 3대 카테고리 17개 공약 카드 그리드
- [ ] `HomeActionCards` 확장: 1개 → 3개 카드(달빛어린이병원 / 외대앞역 신규출구 / 신이문역·동부간선도로)
- [ ] 신규 `Story` 섹션: 소명서 핵심 카피 + 후보 사진 + 핵심 수치(서명 3,025명·3,307명)
- [ ] 메인페이지(`src/app/page.tsx`) 섹션 순서 재조정
- [ ] 모바일 우선(≥360px) 가독성: 본문 16px+, 터치 타겟 44px+
- [ ] 카카오 공유 OG 메타데이터에 공보물 슬로건 반영

### 2.2 Out of Scope

- 공보물 PDF 자체 뷰어/다운로드 페이지 신설 (별도 feature로 분리 가능)
- 정책 상세 페이지(공약 17개 각각의 상세 페이지) — 본 작업은 메인페이지 카드 단위까지만
- 반대 프레임("압수수색 구의회/한우 업추비") 섹션은 별도 PDCA로 분리 검토 (네거티브 톤은 디자인 원칙 #1 "데이터로 신뢰를"과 충돌 가능성)
- 점자공보물 접근성 별도 페이지 (메인페이지 통합 범위 밖)
- 후원·후원회 페이지 변경(이미 `/donate` 별도 운영)
- 다국어/영문 버전

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 공보물 데이터를 단일 출처 파일(`src/data/pamphlet.ts`)에 TypeScript 상수로 정의하고 컴포넌트가 import해서 사용 | High | Pending |
| FR-02 | `Profile`에 기호(5번)·정당(진보당)·핵심 경력 4-6항목을 표시 | High | Pending |
| FR-03 | `Pledges`를 3대 카테고리(아이/함께/다니기) × 17개 공약 카드 구조로 교체. 카테고리별 색상·아이콘 차별 | High | Pending |
| FR-04 | `HomeActionCards`에 활동 카드 3개 표시(달빛어린이병원 3,025명 / 외대앞역 3,307명 / 신이문역·동부간선도로) | High | Pending |
| FR-05 | 신규 `Story` 섹션: 소명서 핵심 카피 3개("세 아이를 키우며…", "정치는 거창한 것이 아니라…", "끝까지 해결하는…") + 후보 이미지 | High | Pending |
| FR-06 | 페이지 OG 메타데이터에 공보물 슬로건("우리 동네 육아 해결사!") 반영 | Medium | Pending |
| FR-07 | 모든 신규 카피에서 후보자 등록 정보(기호·이름·정당·소속)는 공보물과 자구(字句) 단위로 일치 | High | Pending |
| FR-08 | 공약 카드는 카테고리별 접기/펴기 또는 그대로 노출 — 모바일 스크롤 부담 측정 후 결정 | Medium | Pending |
| FR-09 | 카드 클릭 시 향후 상세 페이지로 라우팅 가능하도록 `slug` 필드를 데이터에 포함(현재는 anchor만, 라우팅은 후속) | Low | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 성능 (LCP) | 모바일 LCP < 2.5s | Lighthouse mobile / Vercel Speed Insights |
| 성능 (CLS) | CLS < 0.1 (이미지 dimensions 명시) | Lighthouse |
| 접근성 | WCAG 2.1 AA, 대비 4.5:1 이상, 모든 카드 키보드 접근 | axe-core, Lighthouse |
| 가독성 | 본문 16px 이상, 한글 줄간격 1.5 이상 | Manual review on iPhone SE/Galaxy S |
| 정합성 | 후보자 등록 정보(기호·이름·생년월일·학력·정당) 공보물과 100% 일치 | Diff against `/tmp/ohjunseok-pamphlet.txt` |
| 법적 준수 | 공직선거법 제65조에 따라 작성된 자료임을 footer에 명시 | Code review |
| SEO/공유 | 카카오톡 공유 시 슬로건 + 후보 이미지 노출 | OG meta tag 직접 점검 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] `src/data/pamphlet.ts` 생성 및 모든 컴포넌트가 이 단일 출처에서 데이터 로드
- [ ] `Profile`·`Pledges`·`HomeActionCards`·`Story`(신규) 모두 공보물 내용 반영
- [ ] `npm run build` 성공, 타입 에러 0건, lint 에러 0건
- [ ] iPhone SE(375px)·Galaxy S20(360px)·iPad(768px)·데스크톱(1280px)에서 시각 점검
- [ ] 후보 등록 정보 자구 단위 검증 완료(체크리스트)
- [ ] Plan/Design/Do/Analyze PDCA 문서 전 사이클 완료

### 4.2 Quality Criteria

- [ ] Gap Analysis Match Rate ≥ 90%
- [ ] Lighthouse Mobile Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95
- [ ] 모든 활동 카드에 출처(날짜·장소·서명 수) 명시 — "데이터로 신뢰를" 원칙
- [ ] AI 슬롭 패턴 회피: 보라색 그라데이션·이모지 아이콘·획일적 3-column 카드 그리드 사용 금지 (`.impeccable.md` Anti-References)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 공약 17개를 한 페이지에 노출 시 스크롤 부담 → 모바일 이탈 증가 | High | High | 카테고리별 접기/펴기(default: 펴짐), 카테고리 헤더에 sticky tab, FR-08로 추적 |
| 공약 텍스트가 길어 카드 높이 불균형 → 시각 깨짐 | Medium | High | 1줄 요약 + 1줄 부연 구조로 데이터 모델링, max-height + line-clamp |
| 공보물과 자구가 어긋남 → 선거법·신뢰 이슈 | High | Low | 자동 검증 스크립트(diff against extracted text) 또는 Design 단계에서 체크리스트 작성 |
| 신규 `Story` 섹션 톤이 감성적으로 치우쳐 "데이터로 신뢰를" 원칙과 충돌 | Medium | Medium | 핵심 카피 옆에 반드시 수치(서명 3,025/3,307)를 병기, 사진은 활동 사진(증명사진 X) |
| 반대 프레임 노출 시 네거티브 톤 → 브랜드 톤 손상 | Medium | Medium | Out of Scope 처리, 별도 PDCA로 분리 검토 |
| 공보물 PDF가 345MB로 거대 — repo에 그대로 유지 시 git 부담 | Low | High | data/ 폴더는 이미 .gitignore 검토 필요 — 본 작업 범위 밖이지만 메모 |
| 점자공보물 별도 페이지 요구 발생 | Low | Low | Out of Scope, 별도 feature로 분리 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | 단순 구조 (`components/`, `lib/`, `types/`) | 정적 사이트, 포트폴리오, 랜딩 페이지 | ✅ |
| **Dynamic** | Feature 기반 모듈, BaaS 연동 | 백엔드 있는 웹앱, 풀스택 | ☐ |
| **Enterprise** | 레이어 분리, DI, 마이크로서비스 | 대규모 트래픽, 복잡 아키텍처 | ☐ |

**선택 근거**: 본 작업은 정적 콘텐츠 반영(공보물 → 메인페이지)이므로 **Starter** 패턴. 기존 프로젝트는 Dynamic이지만 본 feature는 데이터 상수와 프레젠테이션 컴포넌트로만 구성.

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / React / Vue | Next.js (기존) | 프로젝트 표준 (App Router) |
| Data 소스 | TS 상수 / JSON / CMS / DB | **TS 상수 (`src/data/pamphlet.ts`)** | 공보물은 선거 기간 불변 → 타입 안전성 + 빌드 시 검증 |
| Styling | Tailwind / CSS Modules | **Tailwind (기존)** | 기존 컴포넌트와 일관성 |
| 아이콘 | lucide-react / 이모지 / SVG | **lucide-react (기존)** | `.impeccable.md`에 명시 |
| 이미지 | next/image / `<img>` | **next/image (기존)** | LCP·CLS 자동 최적화 |
| State Management | 불필요 | - | 정적 콘텐츠, 클라이언트 상태 없음 (접기/펴기는 useState 로컬) |
| Testing | Vitest / Playwright | Manual + Lighthouse | 정적 콘텐츠 → 시각 검증 + 자동 빌드 |
| 데이터 검증 | TS type / Zod / 정규식 | **TS type + diff script** | 빌드 시 타입 + Plan 단계 산출물로 diff 검증 |

### 6.3 Clean Architecture Approach

```
Selected Level: Starter pattern (within Dynamic project)

Folder Structure:
src/
├── app/
│   └── page.tsx                          # 섹션 조립
├── components/
│   ├── interactive-hero/index.tsx        # 유지 (슬로건 이미 일치)
│   ├── profile.tsx                       # 보강
│   ├── story.tsx                         # 신규 (소명서)
│   ├── pledges.tsx                       # 교체 (카테고리 3 × 공약 17)
│   ├── home-action-cards.tsx             # 확장 (1 → 3)
│   ├── contact.tsx                       # 유지
│   └── footer.tsx                        # 유지
└── data/
    └── pamphlet.ts                       # 신규 (단일 출처)
```

**의존 방향**: `components/* → data/pamphlet.ts` (단방향, 컴포넌트가 데이터에 의존, 데이터는 외부 의존 0).

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` 디자인 컨텍스트 (`.impeccable.md` 임포트)
- [x] `AGENTS.md` (Next.js 주의사항)
- [x] TypeScript 설정 (`tsconfig.json`)
- [x] Tailwind 설정
- [ ] `docs/01-plan/conventions.md` (없음, 본 feature에서는 불필요)
- [ ] ESLint/Prettier 명시 설정 (확인 필요, Design 단계에서 점검)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| Naming | 기존 컴포넌트는 kebab-case 파일명, PascalCase export | 유지 | Medium |
| 데이터 파일 위치 | `src/data/` 이미 존재(`council-records.ts`, `imun-stats.ts`) | `src/data/pamphlet.ts` 추가 | High |
| 한글 카피 위치 | 컴포넌트 내 인라인 | 본 feature는 `data/pamphlet.ts`로 분리 | High |
| 이미지 자산 | `public/` 직접 참조 | 활동 사진은 `public/pamphlet/` 하위에 정리 | Medium |
| OG 메타 | `src/app/layout.tsx` 점검 필요 | 슬로건 반영 | Medium |

### 7.3 Environment Variables Needed

본 feature는 클라이언트 정적 콘텐츠만 다루므로 **신규 환경 변수 없음**. 기존 `NEXT_PUBLIC_*` 활용 안 함.

### 7.4 Pipeline Integration

본 feature는 PDCA만 사용. 9-phase Development Pipeline은 사용하지 않음.

---

## 8. Content Mapping (공보물 → 메인페이지)

> Plan 단계의 핵심 산출물 — Design 단계에서 컴포넌트별 props/스키마로 변환됨.

### 8.1 인적사항 (PDF 30-42행)

| 항목 | 공보물 값 | 반영 위치 |
|------|----------|----------|
| 기호 | 5번 | `Profile` 신규 강조 |
| 정당 | 진보당 | `Profile` (기존) |
| 성명 | 오준석 (吳俊碩) | `Profile` (기존) |
| 생년월일 | 1985.2.28 (41세) | `Profile` 신규 |
| 학력 | 경희대학교 경제학과 졸업 | `Profile` 신규 |
| 핵심 직책 | 진보당 동대문구 달빛어린이병원 추진 운동본부장 / 진보당 동대문구지역위원장 | `Profile` 신규 |

### 8.2 슬로건 & 소명서 카피 (PDF 7-11, 75-97행)

| 카피 | 반영 위치 |
|------|----------|
| "우리 동네 육아 해결사!" | `InteractiveHero` (기존, 변경 없음) |
| "세 아이를 키우며 이문동을 다시 보게 됐습니다" | `Story` 헤드라인 |
| "아이가 아픈 밤, 부모의 마음도 함께 앓습니다" | `Story` 본문 |
| "정치는 거창한 것이 아니라 주민의 삶 가까이에 있어야 한다" | `Story` 본문 |
| "주민의 한숨을 직접 듣고 끝까지 해결하는 것" | `Story` 본문 |
| "유일하게 구의회를 바꿀 수 있는 사람 / 일해온 사람·일할 사람" | `Story` CTA |

### 8.3 3대 카테고리 × 17개 공약 (PDF 156-189행)

**1. 아이 키우기 좋은 이문동 (6개)**
1. 야간·주말 달빛어린이병원 추진
2. 어린이 문화공간 설치(공공실내놀이터, 장난감도서관)
3. 어린이 통학로 옐로우카펫 설치
4. 동별 우리동네키움센터 설치
5. 여성 청소년 생리대 무상지원
6. 이문초 인근 공사 안전 점검 + 디지털성범죄지원센터 설치 (※ PDF 줄바꿈 처리: 6개로 통합 또는 7개로 분리 — Design에서 확정)

**2. 함께 사는 이문동 (8개)**
1. 청년 마음 상담 센터
2. 모두의 1층 경사로 설치(휠체어, 유아차 통행)
3. 전·월세 사기 예방 및 지원
4. 반려동물 놀이터(이화교 앞)
5. 상권활성화 위한 골목형 상점가 지정
6. 신이문역 루프스퀘어 주민공간으로 개선
7. 어르신 돌봄 주치의
8. 대상포진 예방접종 지원

**3. 다니기 좋은 이문동 (7개)**
1. 신규 아파트 인근 신호 및 횡단보도 개선
2. 외대앞역 신규 출구 추진
3. 신이문역 공사 조속 추진
4. 이문2동 싱크홀 피해자 제대로 보상
5. 출퇴근 불편 버스노선 개선
6. 신이문역 인근 토끼굴 보행로 개선
7. 동부간선도로 지하화 재검토 및 산책로 대안 마련

### 8.4 핵심 활동 성과 (PDF 80-120행)

| 활동 | 핵심 수치 | 결과 | 카드 위치 |
|------|----------|------|----------|
| 달빛어린이병원 유치 | 주민 3,025명 서명 | 동대문구청 전달 | `HomeActionCards` 카드 #1 (기존 유지) |
| 외대앞역 신규 출구·신이문역 공사 | 주민 3,307명 서명 | 외대앞역 신규 출구 검토 + 신이문역 공사 조속 추진 답변 확보 | `HomeActionCards` 카드 #2 (신규) |
| 동대문구 방사능 안전급식 조례 | (수치 미기재) | 제정 촉구 서명 전달 | `HomeActionCards` 카드 #3 (신규, 옵션) |
| 동대문 경찰서 신호 개선 협의 | 2026.05.13 | 신규 아파트 인근 사거리 신호 개선 논의 | `Story` 또는 카드 |

### 8.5 핵심 경력 (PDF 219-224행) — `Profile`에 4-6개 노출

- 현 진보당 동대문 달빛어린이병원 추진 운동본부장
- 현 진보당 외대역/신이문역 승강장 엘리베이터 설치 운동본부장
- 현 청량초 학교운영위원회 위원장
- 현 디자인기업 몽땅 대표
- 전 21대 대선 이재명 선대위 주민소통본부 공동본부장
- 현 대통령 직속 민주평통 자문위원

---

## 9. Next Steps

1. [ ] 본 Plan 사용자 검토 및 승인
2. [ ] Out of Scope 항목(반대 프레임 섹션·공보물 다운로드 페이지) 별도 PDCA 분리 여부 확인
3. [ ] `/pdca design official-pamphlet-mainpage` 실행 — Design 문서에서 컴포넌트별 props 스키마·UI 와이어프레임 작성
4. [ ] Design 검토 후 `/pdca do official-pamphlet-mainpage` 실행
5. [ ] 구현 완료 후 `/pdca analyze official-pamphlet-mainpage` 실행 (Gap ≥ 90% 목표)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-21 | 초안 작성. 공보물 PDF(8p) 텍스트 추출 후 콘텐츠 매핑·갭 분석·범위 정의 | kcsvictory@gmail.com |
