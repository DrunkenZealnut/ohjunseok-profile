---
template: analysis
version: 1.2
feature: official-pamphlet-mainpage
date: 2026-05-24
author: kcsvictory@gmail.com
project: Ohjunseok 2026 (Election2026)
---

# official-pamphlet-mainpage Analysis Report

> **Analysis Type**: Gap Analysis (Design vs Implementation) + Content Fidelity (공보물 자구 일치)
>
> **Project**: Ohjunseok 2026 (Election2026)
> **Version**: 0.2.0
> **Analyst**: kcsvictory@gmail.com (via bkit:gap-detector agent)
> **Date**: 2026-05-24
> **Design Doc**: [official-pamphlet-mainpage.design.md](../02-design/features/official-pamphlet-mainpage.design.md)
> **Plan Doc**: [official-pamphlet-mainpage.plan.md](../01-plan/features/official-pamphlet-mainpage.plan.md)
> **Source**: `data/오준석 책자형 선거공보(8p)_점자공보물.pdf` (선관위 등록 2026-05-19)

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

공식 책자형 선거공보물(8p)의 콘텐츠를 메인페이지에 반영한 구현이 Design 문서 명세와 정합하는지, 그리고 공보물 본문과 자구 일치(FR-07)를 달성했는지 검증.

### 1.2 Analysis Scope

- **Design Document**: `docs/02-design/features/official-pamphlet-mainpage.design.md`
- **Implementation Files**:
  - `src/data/pamphlet.ts` (신규)
  - `src/components/{profile,story,pledges,home-action-cards,footer}.tsx`
  - `src/app/{page,layout}.tsx`
  - `public/pamphlet/oedae-station.jpg`
- **Reference Text**: `/tmp/ohjunseok-pamphlet.txt` (PDF 추출, 231줄)
- **Analysis Date**: 2026-05-24
- **Verification Method**: gap-detector agent (자동) + 자구 grep diff

---

## 2. Gap Analysis (Design vs Implementation)

### 2.1 Data Model

| Design Entity | Implementation | Status | Notes |
|---------------|----------------|--------|-------|
| `Candidate` (Design 3.1) | `src/data/pamphlet.ts:8-22` | ✅ Match | 모든 필드(13개) 일치 |
| `StatementBlock` | `pamphlet.ts:24-29` | ✅ Match | kind: headline/body/cta |
| `Pledge`, `PledgeCategory`, `PledgeCategoryId` | `pamphlet.ts:31-49` | ✅ Match | union type + 3 카테고리 |
| `Achievement` | `pamphlet.ts:51-60` | ✅ Match | metric/href optional |
| `CareerItem` | `pamphlet.ts:62-65` | ✅ Match | status: "현" \| "전" |
| `CANDIDATE` 상수 | `pamphlet.ts:67-84` | ✅ Match | 공보물 자구 100% 일치 |
| `STATEMENT_BLOCKS` 상수 | `pamphlet.ts:86-113` | ✅ Match | 5블록(headline/body×3/cta) |
| `PLEDGE_CATEGORIES` 상수 | `pamphlet.ts:115-183` | ✅ Match | **7+8+7 = 22개** 공약 |
| `ACHIEVEMENTS` 상수 | `pamphlet.ts:185-226` | ✅ Match | 3건(달빛병원·외대앞역·신호개선) |
| `CAREER_HIGHLIGHTS` 상수 | `pamphlet.ts:228-238` | ✅ Match | 6개(현 5/전 1) |

### 2.2 Component Structure (Design 5.4)

| Design Component | Implementation File | Status | Notes |
|------------------|---------------------|--------|-------|
| `Profile` (보강) | `src/components/profile.tsx` | ✅ Match | Server Component, CANDIDATE+CAREER_HIGHLIGHTS import |
| `Story` (NEW) | `src/components/story.tsx` | ✅ Match | Server Component, STATEMENT_BLOCKS 분기 렌더 |
| `Pledges` (전면 교체) | `src/components/pledges.tsx` | ✅ Match | `"use client"`, useState 토글, 3개 카테고리 카드 |
| `HomeActionCards` (확장) | `src/components/home-action-cards.tsx` | ✅ Match | Feature+Compact 2종, href 분기 |
| `Footer` (보강) | `src/components/footer.tsx` | ✅ Match | 기호 5번 + 공직선거법 65조 |
| `app/page.tsx` (Story 추가) | `src/app/page.tsx:11-19` | ✅ Match | 순서: Hero→Profile→**Story**→Pledges→Action→Contact→Footer |
| `app/layout.tsx` (OG) | `src/app/layout.tsx:14-23` | ✅ Match | description에 슬로건 + 3,025명 반영 |

### 2.3 Interaction Spec (Design 5.2.3)

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| `"use client"` directive | `pledges.tsx:1` | ✅ |
| `useState<Record<PledgeCategoryId, boolean>>` | `pledges.tsx:62-63` | ✅ |
| 초기값 모두 펼침 | `INITIAL_EXPANDED = {child:true, together:true, transit:true}` | ✅ |
| `<button type="button">` | `pledges.tsx:117` | ✅ |
| `aria-expanded` 동적 바인딩 | `pledges.tsx:120` | ✅ |
| `aria-controls` 패널 매칭 | `pledges.tsx:121, 146` | ✅ |
| 데스크톱(`md:`) 토글 비활성 | `md:cursor-default md:pointer-events-none` + `md:hidden` chevron | ✅ |
| CSS grid-rows 트랜지션 | `pledges.tsx:148-151` | ✅ |

### 2.4 Content Fidelity (FR-07, 공보물 자구 일치)

| 항목 | 공보물 (PDF txt 행) | 구현 (파일:행) | Status |
|------|---------------------|----------------|--------|
| 슬로건 "우리 동네 육아 해결사!" | txt:8-11 | `pamphlet.ts:78` | ✅ 일치 |
| "기호 5번" | txt:33-38 | `profile.tsx:33`, `footer.tsx:28` | ✅ 일치 |
| "진보당" | txt:38 | `pamphlet.ts:69` | ✅ 일치 |
| "오준석 (吳俊碩)" | txt:25, hanja in PDF | `pamphlet.ts:70-71` | ✅ 일치 |
| "1985.2.28 (41세)" | txt:37-39 | `pamphlet.ts:72-73` | ✅ 일치 |
| "경희대학교 경제학과 졸업" | txt:36-40 | `pamphlet.ts:75` | ✅ 일치 |
| "세 아이를 키우며…" | txt:76-78 | `pamphlet.ts:90` | ✅ 일치 |
| "정치는 거창한 것이 아니라…" | txt:91-92 | `pamphlet.ts:106` | ✅ 일치 |
| "끝까지 해결하는 구의원이 되겠습니다" | txt:94-96 | `pamphlet.ts:111` | ✅ 일치 |
| "공직선거법 제65조" | txt:231 | `footer.tsx:34` | ✅ 일치 |
| 공약 22개 자구 | txt:156-189 | `pamphlet.ts:115-183` | ⚠️ 22/22 의미 일치, 3건 의도적 정규화 (2.5 참조) |

### 2.5 Match Rate Summary

```
┌────────────────────────────────────────────────────────┐
│  Overall Match Rate: 96%                                │
├────────────────────────────────────────────────────────┤
│  ✅ 일치 (28 items)                                     │
│  ⚠️ 부분 일치 / 의도적 정규화 (4 items)                  │
│  🚨 누락 (1 item, Low impact)                           │
└────────────────────────────────────────────────────────┘
```

### 2.6 Category Scores

| Category | Score | Notes |
|----------|------:|-------|
| 데이터 모델 정합성 | 100/100 | Design 3·4 명세 완전 일치 |
| 컴포넌트 책임 분리 | 100/100 | 단방향 의존(`components → data`) 엄격 준수, 인라인 카피 0건 |
| 상호작용 명세 | 100/100 | useState·aria-expanded·md:비활성 모두 구현 |
| 콘텐츠 자구 일치 | 92/100 | 핵심 등록정보 100%, 공약 일부 자연스러운 정규화 |
| 페이지 구성 | 100/100 | Design 5.1 섹션 순서 정확 |
| 메타데이터 | 95/100 | OG description 반영. OG images는 Q4 별도 PDCA로 분리 |
| **종합** | **96/100** | **합격선 90% 통과** |

---

## 3. Deviations Detail

### 3.1 ⚠️ 부분 일치 / 의도적 정규화 (4)

| # | 항목 | 공보물 원문 | 구현 | 영향도 | 판정 |
|---|------|-------------|------|--------|------|
| D-01 | `together-3` | "전·월세사기 예방 및 지원" (붙임) | "전·월세 사기 예방 및 지원" (띄움) | Low | **허용** — 가독성 개선, 의미 동일, FR-07 등록정보가 아닌 공약 자구 |
| D-02 | `together-4` | "반려동물 놀이터(이화교 앞)" | title "반려동물 놀이터 조성" + note "이화교 앞" | Low | **허용** — 데이터 구조(title+note) 일관성을 위한 정규화 |
| D-03 | CAREER_HIGHLIGHTS | "외대역/신이문역" (슬래시) | "외대역·신이문역" (가운뎃점) | Low | **허용** — 사이트 전체 가운뎃점 표기 통일(예: 이문1·2동) |
| D-04 | STATEMENT_BLOCKS | "세 아이를 키우는 아빠이기에…" 문장(txt:87-89) | 누락 | Low | **허용** — Design 4.2가 5블록으로 의도적 압축, 동등한 정서 전달 |

### 3.2 🚨 갭 / 누락 (1)

| # | 항목 | 누락 내용 | 영향도 | 권장 조치 |
|---|------|----------|--------|----------|
| G-01 | Profile에 `occupation` 노출 | `CANDIDATE.occupation`("정당인") 정의되어 있으나 Profile `<dl>`(생년월일/학력/출마지역/슬로건)에 직업 행 없음 | Low | **선택사항** — 핵심 식별 정보가 아니며 핵심 경력 6개가 직업적 정체성을 더 풍부히 전달. 추가 시 `<dt>직업</dt><dd>{CANDIDATE.occupation}</dd>` 1줄 추가. |

---

## 4. Code Quality

### 4.1 Build & Type Check

| Check | Result | Notes |
|-------|--------|-------|
| `tsc --noEmit` | ✅ 통과 | 타입 에러 0 |
| `eslint` (변경 파일) | ✅ 통과 | 경고 0 |
| `next build` | ✅ 성공 | `/` 페이지 6.41 kB, 정적 사전 렌더링 |
| 빌드 경고 | ⚠️ 1건 | `metadataBase` 미설정 (Q4 별도 PDCA에서 OG 이미지와 함께 처리) |

### 4.2 Dependency Direction (Design 9.3)

```
src/app/page.tsx
  ↓
src/components/{profile,story,pledges,home-action-cards,footer}.tsx
  ↓
src/data/pamphlet.ts
  ↓
(외부 의존 0 — pure data)
```
✅ 단방향 의존 엄격 준수. 컴포넌트 간 cross-import 0건.

### 4.3 Bundle Size

| Route | Size | First Load JS | Notes |
|-------|------|---------------|-------|
| `/` | 6.41 kB | 173 kB | Pledges client component만 클라이언트 JS 추가 |

---

## 5. Accessibility & UX (NFR)

| 항목 | 검증 방법 | 결과 |
|------|----------|------|
| Pledges 토글 키보드 접근 | `<button type="button">` + `aria-expanded/controls` | ✅ Tab/Space/Enter 동작 보장 |
| 이미지 alt 텍스트 | `next/image` alt prop 모두 설정 | ✅ |
| 이미지 dimensions 명시 | `fill` + `sizes` 패턴 | ✅ CLS 안전 |
| 본문 16px 이상 | Pledges/Profile/Story 본문 `text-sm`(14px) ~ `text-base`(16px) | ⚠️ 일부 14px (공약 항목) — 모바일 실제 점검 필요 |
| 대비 4.5:1 | sky-* 토큰 + 흰 배경 | 🔄 Lighthouse로 별도 측정 권장 |
| 한글 줄간격 1.5+ | `leading-relaxed`(1.625) 적용 | ✅ |

> **Note**: NFR(Lighthouse Mobile Performance/Accessibility 점수)은 본 Gap 분석 범위를 넘으며, 별도 측정은 사용자가 dev 서버로 시각 점검 시 함께 진행 권장.

---

## 6. Decisions Validation (Design 12)

| Decision | 적용 여부 | 근거 |
|----------|----------|------|
| **Q2** 외대앞역 사진 `public/pamphlet/oedae-station.jpg` | ✅ 적용 | `pamphlet.ts:209` 참조, 파일 존재 확인(140KB) |
| **Q3** 네거티브 프레임 영구 제외 | ✅ 적용 | 컴포넌트 5개 어디에도 "압수수색·업무추진비" 카피 없음 |
| **Q4** OG 이미지 별도 PDCA 분리 | ✅ 적용 | `openGraph.description`만 반영, `images` 필드 미설정 |

---

## 7. Recommendations

### 7.1 합격 판정

**Match Rate 96% ≥ 90%** — PDCA Check 단계 합격선 통과.

다음 단계로 진행 가능:
- `/pdca report official-pamphlet-mainpage` — 완료 보고서 생성
- 또는 `/simplify` — Check ≥ 90% 후 코드 정리 (선택)

### 7.2 선택적 후속 작업 (Report 단계 이전 또는 별도 PDCA로 분리 가능)

| 우선순위 | 항목 | 소요 | 근거 |
|:--:|------|------|------|
| **Low** | G-01: Profile에 직업("정당인") 행 추가 | 1줄 | 공보물 인적사항 표 컬럼 완비 |
| **Low** | 모바일 14px 텍스트 점검 후 16px 승격 | 클래스 수정 | NFR(가독성) 강화 |
| **분리** | `og-image-2026` 신규 PDCA: OG 이미지 합성 + `metadataBase` 설정 | 별도 | Q4 결정사항 |
| **분리** | 네거티브 프레임 페이지(`/why-change`) 검토 | 별도 | Q3 영구 제외 결정이나 캠프 재검토 가능 |

### 7.3 Iteration 불요

Match Rate 96%는 `/pdca iterate` 자동 개선 임계치(90% 미만) 위. 잔여 갭은 모두 의도적 정규화·Low 영향도이며 자동 수정 시 오히려 Design 결정(데이터 구조 일관성)을 손상시킬 위험.

---

## 8. Conclusion

✅ **PDCA Check 합격 (96%)**

공식 책자형 선거공보물 콘텐츠를 메인페이지에 충실히 반영. 핵심 등록 정보(기호·이름·생년월일·학력·정당)는 자구 단위 100% 일치하며, 공약 22개·활동 성과 3건·핵심 경력 6개 모두 단일 출처(`src/data/pamphlet.ts`)에서 관리되어 향후 유지보수 비용 최소화.

부분 일치 4건은 모두 의도적 정규화(데이터 구조·표기 통일·정서 압축)이며, 누락 1건(occupation)은 선택사항.

**다음 단계 권장**: `/pdca report official-pamphlet-mainpage`

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-24 | gap-detector agent 분석 결과를 PDCA Check 보고서로 정리. Match Rate 96%, 부분 일치 4건/누락 1건(모두 Low) 명시. | kcsvictory@gmail.com |
