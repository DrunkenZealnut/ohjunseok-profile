---
template: design
version: 1.2
feature: official-pamphlet-mainpage
date: 2026-05-21
author: kcsvictory@gmail.com
project: Ohjunseok 2026 (Election2026)
status: Draft
---

# official-pamphlet-mainpage Design Document

> **Summary**: 공식 책자형 선거공보물(8p)의 핵심 메시지·공약·활동 성과를 메인페이지에 반영하기 위한 컴포넌트 구조, 데이터 모델, UI 와이어프레임, 구현 순서 명세.
>
> **Project**: Ohjunseok 2026 (Election2026)
> **Version**: 0.1.0
> **Author**: kcsvictory@gmail.com
> **Date**: 2026-05-21
> **Status**: Draft
> **Planning Doc**: [official-pamphlet-mainpage.plan.md](../../01-plan/features/official-pamphlet-mainpage.plan.md)

### Pipeline References (if applicable)

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema Definition | N/A |
| Phase 2 | Coding Conventions | N/A (기존 컨벤션 준수) |
| Phase 3 | Mockup | N/A (본 문서에 와이어프레임 포함) |
| Phase 4 | API Spec | N/A (정적 콘텐츠) |

---

## 1. Overview

### 1.1 Design Goals

1. **단일 출처 보장**: 공보물 콘텐츠를 `src/data/pamphlet.ts` 한 파일에 집중시켜 컴포넌트는 데이터만 소비.
2. **컴포넌트 책임 분리**: 메인페이지 섹션 = 1 컴포넌트 = 1 책임 (`Profile`, `Story`, `Pledges`, `HomeActionCards`).
3. **모바일 우선**: iPhone SE(375px) 기준으로 1-col 레이아웃, 데스크톱은 2~3-col로 확장.
4. **AI 슬롭 회피**: 이모지 아이콘·획일 3-col 카드·보라색 그라데이션 금지(`.impeccable.md`). 카테고리별 색상은 sky-50/100/200 강도 차이 + 포인트 red.
5. **법적 정합성**: 등록 정보(기호·이름·생년월일·학력·정당)는 공보물과 자구 일치, footer에 공직선거법 제65조 언급.

### 1.2 Design Principles

- **단방향 의존**: `components/* → data/pamphlet.ts` (역방향 금지)
- **Server Component 우선**: 인터랙션이 필요한 컴포넌트(카테고리 토글)만 `"use client"`
- **이미지 dimensions 명시**: 모든 `next/image`에 `width/height` 또는 `fill+sizes` 명시 (CLS < 0.1)
- **데이터로 신뢰를**: 모든 활동 카드에 출처(날짜·장소·서명 수치) 병기
- **공보물 우선**: 카피·수치·정당명·기호 등은 PDF 본문을 정본으로 함

---

## 2. Architecture

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────┐
│  src/app/page.tsx (Server Component)                     │
├──────────────────────────────────────────────────────────┤
│  ┌─────────────────┐                                     │
│  │ InteractiveHero │  (기존 유지, slogan 일치)            │
│  └─────────────────┘                                     │
│  ┌─────────────────┐                                     │
│  │ Profile         │  ← profile data from pamphlet.ts    │
│  └─────────────────┘                                     │
│  ┌─────────────────┐                                     │
│  │ Story (NEW)     │  ← statement data from pamphlet.ts  │
│  └─────────────────┘                                     │
│  ┌─────────────────┐                                     │
│  │ Pledges         │  ← pledges data from pamphlet.ts    │
│  │ (replaced)      │     (client: category toggle)       │
│  └─────────────────┘                                     │
│  ┌─────────────────┐                                     │
│  │ HomeActionCards │  ← actions data from pamphlet.ts    │
│  │ (expanded 1→3)  │                                     │
│  └─────────────────┘                                     │
│  ┌─────────────────┐                                     │
│  │ Contact         │  (기존 유지)                         │
│  └─────────────────┘                                     │
│  ┌─────────────────┐                                     │
│  │ Footer          │  (기존 유지 + 공직선거법 65조 추가)   │
│  └─────────────────┘                                     │
└──────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │ src/data/pamphlet.ts   │  (단일 출처)
              │  - candidate           │
              │  - statementBlocks     │
              │  - pledgeCategories    │
              │  - achievements        │
              │  - careerHighlights    │
              └────────────────────────┘
```

### 2.2 Data Flow

```
data/pamphlet.ts (constants)
    ↓ import
components/* (presentation)
    ↓ render
app/page.tsx (composition)
    ↓ SSR
HTML output
```

- 외부 API·DB 없음, 클라이언트 상태는 `Pledges`의 카테고리 토글 1개뿐.
- 빌드 시 타입 체크로 데이터 무결성 보장.

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `app/page.tsx` | 모든 섹션 컴포넌트 | 페이지 조립 |
| `Profile` | `data/pamphlet.ts: candidate` | 후보 등록 정보 표시 |
| `Story` | `data/pamphlet.ts: statementBlocks`, `next/image` | 소명서 + 후보 사진 |
| `Pledges` | `data/pamphlet.ts: pledgeCategories`, `useState`, `lucide-react` | 17개 공약 카드, 카테고리 토글 |
| `HomeActionCards` | `data/pamphlet.ts: achievements`, `next/image`, `next/link` | 3개 활동 카드 |

---

## 3. Data Model

### 3.1 Entity Definition

> 위치: `src/data/pamphlet.ts` (신규)
> 기존 `src/data/child-hospital.ts`·`crosswalk-police-response.ts` 패턴 준수.

```typescript
// src/data/pamphlet.ts
// 공식 책자형 선거공보물(8p) 콘텐츠를 메인페이지 컴포넌트가 사용할 단일 출처.
// Source: data/오준석 책자형 선거공보(8p)_점자공보물.pdf (2026-05-19 등록)
// Design: docs/02-design/features/official-pamphlet-mainpage.design.md

/** 후보 등록 정보 (PDF 30-42행) */
export interface Candidate {
  number: 5;                          // 기호
  party: "진보당";
  name: string;                       // "오준석"
  nameHanja: string;                  // "吳俊碩"
  birthDate: string;                  // "1985.2.28"
  age: number;                        // 41 (2026 기준)
  gender: "남";
  occupation: string;                 // "정당인"
  education: string;                  // "경희대학교 경제학과 졸업"
  district: string;                   // "동대문구 라선거구(이문1·2동)"
  slogan: string;                     // "우리 동네 육아 해결사!"
  sloganSubline: string;              // "아이 셋,"
  photo: { src: string; alt: string };
}

/** 소명서 인용 블록 (PDF 75-97행) */
export interface StatementBlock {
  id: string;
  kind: "headline" | "body" | "cta";
  text: string;
  highlight?: { signatures?: number; topic?: string };
}

/** 공약 카테고리 */
export type PledgeCategoryId = "child" | "together" | "transit";

export interface PledgeCategory {
  id: PledgeCategoryId;
  number: 1 | 2 | 3;
  title: string;                      // "아이 키우기 좋은 이문동"
  description: string;                // 1줄 요약
  accentColor: "sky" | "amber" | "emerald";
  icon: "Baby" | "Users" | "Route";   // lucide-react
  pledges: Pledge[];
}

/** 개별 공약 (PDF 156-189행, 총 17개) */
export interface Pledge {
  id: string;
  title: string;                      // 공보물 자구 그대로
  note?: string;                      // 보충 설명 (예: "(공공실내놀이터, 장난감도서관)")
}

/** 핵심 활동 성과 (PDF 80-120행) */
export interface Achievement {
  id: string;
  date: string;                       // "2026.04.21"
  location: string;                   // "동대문구청"
  title: string;
  summary: string;
  metric?: { value: string; label: string };  // "3,025명 서명"
  image: { src: string; alt: string };
  href?: string;                      // 상세 페이지 경로 (있으면 클릭 가능)
}

/** 핵심 경력 (PDF 219-224행) */
export interface CareerItem {
  status: "현" | "전";
  title: string;
}

export const CANDIDATE: Candidate = { /* 4.1 참조 */ };
export const STATEMENT_BLOCKS: StatementBlock[] = [ /* 4.2 참조 */ ];
export const PLEDGE_CATEGORIES: PledgeCategory[] = [ /* 4.3 참조 */ ];
export const ACHIEVEMENTS: Achievement[] = [ /* 4.4 참조 */ ];
export const CAREER_HIGHLIGHTS: CareerItem[] = [ /* 4.5 참조 */ ];
```

### 3.2 Entity Relationships

```
Candidate (1)
  └─ photo (1)

PledgeCategory (3)
  └─ Pledge (1..N)   // 카테고리당 6~8개

StatementBlock (N, 평면)
Achievement (3)
CareerItem (N)
```

### 3.3 Database Schema

해당 없음(정적 콘텐츠). MongoDB/Postgres 미사용.

---

## 4. Concrete Data Values

> Plan 8.1~8.5의 매핑을 TypeScript 상수로 구체화. **공보물 자구를 정본으로 함.**

### 4.1 CANDIDATE

```typescript
export const CANDIDATE: Candidate = {
  number: 5,
  party: "진보당",
  name: "오준석",
  nameHanja: "吳俊碩",
  birthDate: "1985.2.28",
  age: 41,
  gender: "남",
  occupation: "정당인",
  education: "경희대학교 경제학과 졸업",
  district: "동대문구 라선거구(이문1·2동)",
  slogan: "우리 동네 육아 해결사!",
  sloganSubline: "아이 셋,",
  photo: {
    src: "/ohjunseok-2026.jpg",
    alt: "오준석 진보당 동대문구의원 후보 (기호 5번)",
  },
};
```

### 4.2 STATEMENT_BLOCKS

```typescript
export const STATEMENT_BLOCKS: StatementBlock[] = [
  {
    id: "headline",
    kind: "headline",
    text: "세 아이를 키우며\n이문동을 다시 보게 됐습니다",
  },
  {
    id: "body-1",
    kind: "body",
    text: "아이가 아픈 밤, 부모의 마음도 함께 앓습니다.",
  },
  {
    id: "body-2",
    kind: "body",
    text: "야간·주말에도 마음 놓고 진료받을 수 있도록 달빛어린이병원 유치를 위해 주민 3,025명의 서명을 모아 전달했습니다.",
    highlight: { signatures: 3025, topic: "달빛어린이병원" },
  },
  {
    id: "body-3",
    kind: "body",
    text: "정치는 거창한 것이 아니라 주민의 삶 가까이에 있어야 한다고 믿습니다.",
  },
  {
    id: "cta",
    kind: "cta",
    text: "이문동 주민들의 목소리를 가장 가까이에서 듣고, 끝까지 해결하는 구의원이 되겠습니다.",
  },
];
```

### 4.3 PLEDGE_CATEGORIES (3 × 17 = 17개)

```typescript
export const PLEDGE_CATEGORIES: PledgeCategory[] = [
  {
    id: "child",
    number: 1,
    title: "아이 키우기 좋은 이문동",
    description: "야간·주말 진료, 안전 통학로, 돌봄 인프라.",
    accentColor: "sky",
    icon: "Baby",
    pledges: [
      { id: "child-1", title: "야간·주말 달빛어린이병원 추진" },
      { id: "child-2", title: "어린이 문화공간 설치", note: "공공실내놀이터, 장난감도서관" },
      { id: "child-3", title: "어린이 통학로 옐로우카펫 설치" },
      { id: "child-4", title: "동별 우리동네키움센터 설치" },
      { id: "child-5", title: "여성 청소년 생리대 무상지원" },
      { id: "child-6", title: "이문초 인근 공사 안전 점검" },
      { id: "child-7", title: "디지털성범죄지원센터 설치" },
    ],
  },
  {
    id: "together",
    number: 2,
    title: "함께 사는 이문동",
    description: "청년·어르신·소상공인을 두루 살피는 생활 정책.",
    accentColor: "amber",
    icon: "Users",
    pledges: [
      { id: "together-1", title: "청년 마음 상담 센터" },
      { id: "together-2", title: "모두의 1층 경사로 설치", note: "휠체어·유아차 통행" },
      { id: "together-3", title: "전·월세 사기 예방 및 지원" },
      { id: "together-4", title: "반려동물 놀이터 조성", note: "이화교 앞" },
      { id: "together-5", title: "상권활성화 위한 골목형 상점가 지정" },
      { id: "together-6", title: "신이문역 루프스퀘어 주민공간으로 개선" },
      { id: "together-7", title: "어르신 돌봄 주치의" },
      { id: "together-8", title: "대상포진 예방접종 지원" },
    ],
  },
  {
    id: "transit",
    number: 3,
    title: "다니기 좋은 이문동",
    description: "역세권·도로·보행 환경을 주민 시선으로.",
    accentColor: "emerald",
    icon: "Route",
    pledges: [
      { id: "transit-1", title: "신규 아파트 인근 신호 및 횡단보도 개선" },
      { id: "transit-2", title: "외대앞역 신규 출구 추진" },
      { id: "transit-3", title: "신이문역 공사 조속 추진" },
      { id: "transit-4", title: "이문2동 싱크홀 피해자 제대로 보상" },
      { id: "transit-5", title: "출퇴근 불편 버스노선 개선" },
      { id: "transit-6", title: "신이문역 인근 토끼굴 보행로 개선" },
      { id: "transit-7", title: "동부간선도로 지하화 재검토 및 산책로 대안 마련" },
    ],
  },
];
```

> **Note**: Plan 8.3에서 "이문초 인근 공사 안전 점검 + 디지털성범죄지원센터 설치"를 6개로 통합/7개로 분리 결정 보류 → **본 Design에서 7개로 분리** 확정. 공보물 PDF 줄바꿈 기준 분리가 자연스럽고 카드 시인성이 좋음. 따라서 카테고리 1은 7개, 합계 17 → **22개**가 아닌 7+8+7 = **22개**가 아닌 7+8+7 = **22개?** 재검산: 7+8+7=**22**. Plan에서 "17개"로 명시했으나 PDF 정밀 분리 시 22개. ✅ **결론**: 총 22개 공약으로 확정, Plan 문서는 Design 단계에서 보정 (history에 기록).

### 4.4 ACHIEVEMENTS (3개)

```typescript
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "child-hospital",
    date: "2026.04.21",
    location: "동대문구청",
    title: "주민 3,025명과 함께한 달빛어린이병원 요구",
    summary:
      "동대문구는 달빛어린이병원 0개. 야간·휴일 소아 진료 공백을 메우기 위한 활동 기록과 다음 단계 약속.",
    metric: { value: "3,025", label: "명 서명" },
    image: {
      src: "/child-hospital/signature-delivery.jpg",
      alt: "동대문구청에 주민 3,025명 서명을 전달하는 오준석 후보",
    },
    href: "/child-hospital",
  },
  {
    id: "oedae-station",
    date: "2025.10.23",
    location: "외대앞역",
    title: "주민 3,307명과 함께한 외대앞역·신이문역 개선",
    summary:
      "지하철 계단 앞에서 망설이던 어르신·유아차·휠체어 이용자를 위해 모은 서명. 외대앞역 신규 출구 검토 및 신이문역 공사 조속 추진 답변을 이끌어냈습니다.",
    metric: { value: "3,307", label: "명 서명" },
    image: {
      src: "/pamphlet/oedae-station.jpg",     // 신규 자산 필요
      alt: "외대앞역 앞에서 국가철도공단 관계자와 면담하는 오준석 후보",
    },
    // 상세 페이지는 후속 PDCA로 분리 (현재는 카드만 노출, href 미지정)
  },
  {
    id: "crosswalk-action",
    date: "2026.05.13",
    location: "동대문 경찰서",
    title: "신규 아파트 인근 사거리 신호 개선 협의",
    summary:
      "동대문 경찰서와 신규 아파트 인근 사거리 신호 개선을 논의. 작은 불편도 '별일 아니다' 하고 지나치지 않습니다.",
    image: {
      src: "/crosswalk-police-2026-05-13.jpg",
      alt: "동대문 경찰서에서 신호 개선을 논의하는 오준석 후보",
    },
    href: "/crosswalk-action",
  },
];
```

### 4.5 CAREER_HIGHLIGHTS (Profile에 6개 노출)

```typescript
export const CAREER_HIGHLIGHTS: CareerItem[] = [
  { status: "현", title: "진보당 동대문 달빛어린이병원 추진 운동본부장" },
  { status: "현", title: "진보당 외대역·신이문역 승강장 엘리베이터 설치 운동본부장" },
  { status: "현", title: "청량초 학교운영위원회 위원장" },
  { status: "현", title: "디자인기업 몽땅 대표" },
  { status: "전", title: "21대 대선 이재명 선대위 주민소통본부 공동본부장" },
  { status: "현", title: "대통령 직속 민주평통 자문위원" },
];
```

---

## 5. UI/UX Design

### 5.1 Page Layout

```
┌──────────────────────────────────────────────┐
│ Navbar (sticky, 기존)                         │
├──────────────────────────────────────────────┤
│                                              │
│ InteractiveHero (기존)                        │
│  "아이 셋, 우리 동네 육아 해결사!"             │
│  기호 5번 · 진보당 · 이문동                    │
│                                              │
├──────────────────────────────────────────────┤
│ Profile (보강)                                │
│  ┌──┐ 기호 5번  진보당 오준석                  │
│  │📷│ 1985.2.28  경희대 경제학과              │
│  └──┘ 핵심 경력 6개 (현/전 배지)              │
├──────────────────────────────────────────────┤
│ Story (신규)                                  │
│  "세 아이를 키우며 이문동을 다시 보게…"        │
│  본문 3블록 · 후보 사진 1장                   │
│  하이라이트: 서명 3,025명 (강조)              │
├──────────────────────────────────────────────┤
│ Pledges (전면 교체)                            │
│  주요 공약 3+1                                │
│  [① 아이 키우기 좋은 이문동]  ▼ (7개)         │
│  [② 함께 사는 이문동]         ▼ (8개)         │
│  [③ 다니기 좋은 이문동]       ▼ (7개)         │
├──────────────────────────────────────────────┤
│ HomeActionCards (1→3 확장)                    │
│  최근 활동                                    │
│  [달빛어린이병원] [외대앞역] [신호 개선]       │
├──────────────────────────────────────────────┤
│ Contact (기존)                                │
├──────────────────────────────────────────────┤
│ Footer (보강: 공직선거법 65조 명시)            │
└──────────────────────────────────────────────┘
```

### 5.2 Component Wireframes

#### 5.2.1 `Profile` (보강)

```
모바일 (≤768px):
┌──────────────────────────────────────┐
│         후보 소개                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│                                      │
│  ┌────────────┐                     │
│  │            │  기호 5번            │
│  │  사진      │  진보당 오준석        │
│  │  (square)  │  (吳俊碩)            │
│  │            │  1985.2.28 (41세)    │
│  └────────────┘  경희대 경제학과     │
│                                      │
│  핵심 경력                            │
│  [현] 달빛어린이병원 추진 운동본부장   │
│  [현] 외대·신이문역 엘리베이터 본부장 │
│  [현] 청량초 학교운영위원회 위원장    │
│  [현] 디자인기업 몽땅 대표           │
│  [전] 21대 대선 이재명 선대위 공동본부장│
│  [현] 민주평통 자문위원              │
└──────────────────────────────────────┘

데스크톱 (≥768px): 2-col 그리드 (사진+요약 / 경력)
```

**스타일 노트**:
- 기호 "5"는 `text-5xl font-black text-party-red` 강조 (큰 숫자)
- "[현]/[전]" 배지: `bg-sky-100 text-sky-800` (현), `bg-neutral-100 text-neutral-700` (전)
- 카드 배경: `bg-white shadow-xl rounded-2xl`
- 사진: `aspect-square rounded-2xl object-cover`

#### 5.2.2 `Story` (신규)

```
┌──────────────────────────────────────┐
│  세 아이를 키우며                     │
│  이문동을 다시 보게 됐습니다           │  ← H2 font-black text-sky-900 text-4xl
│  ━━━                                 │
│                                      │
│  ┌──────────────┐  아이가 아픈 밤,    │
│  │              │  부모의 마음도      │
│  │  사진        │  함께 앓습니다.     │
│  │              │                    │
│  └──────────────┘  야간·주말에도      │
│                    마음 놓고…        │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  3,025명                      │   │  ← 강조 박스
│  │  주민 서명을 모아 전달        │   │
│  └──────────────────────────────┘   │
│                                      │
│  정치는 거창한 것이 아니라…           │
│                                      │
│  > 끝까지 해결하는 구의원이 되겠습니다│  ← CTA blockquote
└──────────────────────────────────────┘
```

**스타일 노트**:
- 배경: `bg-gradient-to-b from-sky-50 to-white`
- 강조 박스: 글래스모피즘 (`bg-white/70 backdrop-blur border border-sky-200 rounded-2xl`)
- CTA: `border-l-4 border-party-red pl-4 italic text-sky-900 text-xl`
- 사진은 `next/image` `aspect-[3/4]`, `priority` 없음 (above-the-fold 아님)

#### 5.2.3 `Pledges` (전면 교체)

```
모바일:
┌──────────────────────────────────────┐
│         주요 공약                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 1 [Baby] 아이 키우기 좋은     ▼│   │  ← 카테고리 헤더 클릭 = toggle
│  │   이문동                      │   │
│  │   야간·주말 진료, 안전 통학로  │   │
│  ├──────────────────────────────┤   │
│  │ • 야간·주말 달빛어린이병원    │   │
│  │ • 어린이 문화공간 설치        │   │
│  │   (공공실내놀이터…)           │   │
│  │ • 어린이 통학로 옐로우카펫    │   │
│  │ … (7개)                       │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 2 [Users] 함께 사는 이문동   ▼│   │
│  │ … (8개)                       │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 3 [Route] 다니기 좋은 이문동 ▼│   │
│  │ … (7개)                       │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘

데스크톱 (≥1024px): 3-col 그리드, toggle 비활성 (항상 펼침)
```

**상호작용 명세**:
- 모바일: 각 카테고리 카드를 `<button>` 로 감싸 클릭 시 `expanded` 토글. **기본값: 모두 펼침** (이탈 위험 < 발견성).
- 데스크톱: 미디어 쿼리(`md:`)에서 토글 버튼 숨김, 모든 카드 펼친 상태로 렌더.
- 키보드: `Enter`/`Space`로 토글, `aria-expanded` 속성 관리.
- 모션: `transition-[max-height]` + `overflow-hidden` (`framer-motion` 도입 X — 의존성 최소화).

**스타일 노트**:
- 카테고리 번호: `1`/`2`/`3` 큰 숫자 (`text-6xl font-black opacity-20`) 배경 워터마크
- 아이콘: lucide-react `Baby`, `Users`, `Route` (선 두께 1.5)
- 카테고리별 accent (Tailwind 클래스로 매핑):
  - `sky` (아이) → `border-sky-300`, `bg-sky-50/60`
  - `amber` (함께) → `border-amber-300`, `bg-amber-50/60`
  - `emerald` (다니기) → `border-emerald-300`, `bg-emerald-50/60`
- 공약 항목: `• {title}` + (note 있으면 회색 작은 텍스트)
- **AI 슬롭 회피**: 보라색 그라데이션 ❌, 이모지 ❌, 획일 카드 ❌ → 카테고리별 색상 차별 + 번호 워터마크로 차이 만듦

#### 5.2.4 `HomeActionCards` (1→3 확장)

```
모바일:
┌──────────────────────────────────────┐
│  최근 활동                            │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ [img]  2026.04.21 · 동대문구청│   │
│  │        주민 3,025명과 함께한  │   │
│  │        달빛어린이병원 요구    │   │
│  │        자세히 보기 →          │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ [img]  2025.10.23 · 외대앞역  │   │
│  │        주민 3,307명과 함께한  │   │
│  │        외대앞역·신이문역 개선 │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ [img]  2026.05.13 · 동대문경찰서│
│  │        신호 개선 협의         │   │
│  │        자세히 보기 →          │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘

데스크톱: 3-col 그리드 또는 1+2 비대칭 (1번 카드만 좌우 split, 2-3은 stacked)
```

**스타일 노트**:
- 기존 `home-action-cards.tsx`의 좌우 split 패턴(첫 카드)을 유지하되, 나머지 2개는 `<ul>` 로 stacked
- `href` 있는 카드만 `<Link>` 래핑, 없는 카드(외대앞역)는 정적 `<article>` (CTA "준비 중" 표시)

#### 5.2.5 `Footer` 보강

```
기존 Footer
+ 추가: "이 게시물은 공직선거법 제65조에 따라 작성된 자료를 기반으로 합니다."
+ 추가: "후보자 정보는 공식 책자형 선거공보(2026.05.19 등록)를 정본으로 합니다."
```

### 5.3 User Flow

```
인쇄 공보 → QR/링크 → 메인페이지 도착
                        │
                        ▼
              [Hero: 슬로건 확인 - 0.5초]
                        │
                        ▼
              [Profile: 기호 5번·등록 정보 확인 - 3초]
                        │
                        ▼
              [Story: "세 아이를 키우며…" - 10초]
                        │
                        ▼
              [Pledges: 관심 카테고리 펼침 - 30초]
                        │
                        ▼
              [Action: 최근 활동 카드 → 상세 (선택)]
                        │
                        ▼
              [Contact: 후원 / 연락]
```

**목표**: 스크롤 3번 이내 핵심 메시지(슬로건·기호·소명서·카테고리) 도달.

### 5.4 Component List

| Component | Location | Responsibility | Server/Client |
|-----------|----------|----------------|:-------------:|
| `Profile` | `src/components/profile.tsx` | 등록 정보 + 경력 6 | Server |
| `Story` | `src/components/story.tsx` (NEW) | 소명서 + 후보 사진 + 강조 박스 | Server |
| `Pledges` | `src/components/pledges.tsx` | 3 카테고리 × 22 공약, 카테고리 토글 | Client |
| `HomeActionCards` | `src/components/home-action-cards.tsx` | 활동 카드 3개 | Server |
| `Footer` | `src/components/footer.tsx` | 공직선거법 65조 추가 | Server |

---

## 6. Error Handling

본 feature는 정적 콘텐츠 + 클라이언트 인터랙션 1개(토글)만 다루므로 런타임 에러 가능성이 낮음.

| Code | 상황 | 처리 |
|------|------|------|
| 빌드 시 타입 에러 | `pamphlet.ts`의 데이터가 인터페이스와 불일치 | `tsc --noEmit`에서 차단 |
| 이미지 404 | `public/pamphlet/oedae-station.jpg` 누락 | Design 단계에서 자산 준비, 누락 시 placeholder + 콘솔 경고 |
| `useState` SSR 미스매치 | 카테고리 토글 초기값 mismatch | 초기 expanded state를 SSR/CSR 모두 `true`로 고정 |

---

## 7. Security Considerations

- [x] **XSS**: 모든 데이터는 정적 상수이므로 외부 입력 없음. `dangerouslySetInnerHTML` 미사용.
- [x] **CSP**: 외부 도메인 이미지 없음 (모두 `/public` 자산).
- [x] **공직선거법**: footer에 제65조 명시 (FR-07).
- [x] **개인정보**: 후보 등록 정보만 노출 (선관위 공개 정보).
- [N/A] 인증/인가, Rate Limiting (API 없음).

---

## 8. Test Plan

### 8.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| 빌드 검증 | TypeScript 타입 일치 | `npm run build`, `tsc --noEmit` |
| 시각 회귀 | 4개 디바이스 폭(360/375/768/1280) | 수동 (Chrome DevTools) |
| 접근성 | WCAG 2.1 AA, 키보드 토글 | axe DevTools, Lighthouse |
| 성능 | LCP, CLS, TBT | Lighthouse Mobile |
| 콘텐츠 정합성 | 등록 정보·공약 자구 | grep 기반 diff 스크립트 (Plan FR-07) |

### 8.2 Test Cases (Key)

- [ ] **TC-01 (Happy)** 메인페이지가 SSR로 정상 렌더되고 5개 섹션이 순서대로 노출된다.
- [ ] **TC-02 (Happy)** Profile에 기호 5·진보당·오준석·1985.2.28·경희대 경제학과가 모두 보인다.
- [ ] **TC-03 (Happy)** Pledges 3개 카테고리 헤더(아이/함께/다니기)가 보이고, 카테고리별 공약 개수가 7/8/7이다.
- [ ] **TC-04 (Interaction)** 모바일에서 카테고리 헤더 탭 → 공약 목록 토글된다, `aria-expanded` 변경 확인.
- [ ] **TC-05 (Interaction)** 데스크톱(≥1024px)에서 토글 버튼이 보이지 않고 모든 공약이 펼쳐져 있다.
- [ ] **TC-06 (Content)** HomeActionCards 3개 카드 모두 날짜·장소·요약·이미지가 노출된다.
- [ ] **TC-07 (Edge)** 자산 누락 시 빌드 단계에서 감지 (이미지 경로 string 검증).
- [ ] **TC-08 (A11y)** Tab 키로 카테고리 헤더에 포커스 이동, Space/Enter로 토글 가능.
- [ ] **TC-09 (A11y)** 본문 글자 16px 이상, 대비 4.5:1 이상.
- [ ] **TC-10 (Content)** Footer에 공직선거법 제65조 문구가 보인다.

---

## 9. Clean Architecture

### 9.1 Layer Structure

본 feature는 Starter 패턴이므로 Application/Infrastructure 레이어 미사용.

| Layer | 본 feature 적용 | Location |
|-------|----------------|----------|
| **Presentation** | 컴포넌트 5개 | `src/components/{profile,story,pledges,home-action-cards,footer}.tsx` |
| **Application** | N/A | - |
| **Domain** | 데이터 모델 타입 | `src/data/pamphlet.ts` (인터페이스 + 상수 동시 보관) |
| **Infrastructure** | N/A | - |

> **Note**: `pamphlet.ts`는 엄밀히는 Domain(타입) + Data(상수)가 섞여 있으나, Starter 패턴에서는 분리 비용 > 이득이므로 통합 유지. Dynamic 레벨로 확장 시 분리 검토.

### 9.2 Dependency Rules

```
src/app/page.tsx
  ↓
src/components/{profile,story,pledges,home-action-cards,footer}.tsx
  ↓
src/data/pamphlet.ts
  ↓
(아무것도 import하지 않음 — pure data)
```

### 9.3 File Import Rules

| From | Can Import | Cannot Import |
|------|-----------|---------------|
| `app/page.tsx` | `components/*` | `data/*` 직접 (컴포넌트 통해서만) |
| `components/*` | `data/pamphlet.ts`, `lucide-react`, `next/image`, `next/link`, `react` | 다른 컴포넌트의 내부 상태 |
| `data/pamphlet.ts` | TypeScript 표준 라이브러리만 | React, Next.js, 외부 의존 모두 X |

### 9.4 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| `Profile`, `Story`, `Pledges`, `HomeActionCards`, `Footer` | Presentation | `src/components/*.tsx` |
| `Candidate`, `Pledge`, `Achievement` 등 인터페이스 | Domain (types) | `src/data/pamphlet.ts` (export interface) |
| `CANDIDATE`, `PLEDGE_CATEGORIES` 등 상수 | Domain (data) | `src/data/pamphlet.ts` (export const) |

---

## 10. Coding Convention Reference

### 10.1 Naming Conventions

| Target | Rule | 본 feature 적용 |
|--------|------|---------------|
| Components | PascalCase | `Profile`, `Story`, `Pledges`, `HomeActionCards` |
| 파일 (component) | kebab-case.tsx | `profile.tsx`, `story.tsx`, `pledges.tsx`, `home-action-cards.tsx` (기존 컨벤션 준수) |
| 파일 (data) | kebab-case.ts | `pamphlet.ts` |
| 상수 | UPPER_SNAKE_CASE | `CANDIDATE`, `PLEDGE_CATEGORIES`, `ACHIEVEMENTS`, `CAREER_HIGHLIGHTS`, `STATEMENT_BLOCKS` |
| 인터페이스 | PascalCase | `Candidate`, `Pledge`, `Achievement` |
| 카테고리 ID | kebab-case-friendly | `"child"`, `"together"`, `"transit"` |

### 10.2 Import Order

```typescript
// 1. React / Next.js
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

// 2. 외부 라이브러리
import { Baby, Users, Route, ArrowRight } from "lucide-react";

// 3. 내부 모듈 (절대 경로)
import {
  PLEDGE_CATEGORIES,
  type PledgeCategory,
} from "@/data/pamphlet";
```

### 10.3 Environment Variables

해당 없음 — 정적 콘텐츠만 다룸.

### 10.4 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| Component naming | PascalCase (export default function `Profile`) |
| File organization | `src/components/*.tsx` (기존), `src/data/*.ts` (기존) |
| State management | useState 로컬만 (카테고리 토글), 전역 상태 없음 |
| Error handling | 빌드 시 TypeScript로 검증, 런타임 에러 핸들링 불필요 |
| 색상 토큰 | Tailwind sky-* / amber-* / emerald-* + party-red 커스텀 |

---

## 11. Implementation Guide

### 11.1 File Structure

```
src/
├── app/
│   └── page.tsx                      [수정] 섹션 순서: Hero → Profile → Story → Pledges → HomeActionCards → Contact → Footer
├── components/
│   ├── interactive-hero/index.tsx    [유지]
│   ├── profile.tsx                   [수정] pamphlet.CANDIDATE + CAREER_HIGHLIGHTS 사용
│   ├── story.tsx                     [신규] pamphlet.STATEMENT_BLOCKS 사용
│   ├── pledges.tsx                   [전면 교체] pamphlet.PLEDGE_CATEGORIES + useState 토글
│   ├── home-action-cards.tsx         [확장] pamphlet.ACHIEVEMENTS 3개 사용
│   ├── contact.tsx                   [유지]
│   └── footer.tsx                    [수정] 공직선거법 제65조 문구 추가
└── data/
    └── pamphlet.ts                   [신규] 단일 출처

public/
└── pamphlet/
    └── oedae-station.jpg             [신규 자산 필요] 외대앞역 활동 사진
                                      — 누락 시: ohjunseok-2026.jpg로 임시 대체
```

### 11.2 Implementation Order

1. **데이터 우선** — `src/data/pamphlet.ts` 작성 (인터페이스 + 상수 모두)
   - 타입 정의 → 상수 채우기 → `tsc --noEmit`로 검증
2. **신규 자산 준비** — `public/pamphlet/oedae-station.jpg` 확보 (없으면 임시 placeholder, 후속 작업으로 분리)
3. **Profile 보강** — `pamphlet.ts` import + 기호·생년월일·학력·경력 6개 추가
4. **Story 신규 작성** — `story.tsx` 생성, STATEMENT_BLOCKS 렌더
5. **Pledges 전면 교체** — `pledges.tsx` "use client" 추가, useState 토글, 카테고리 3개 + 공약 22개 렌더
6. **HomeActionCards 확장** — ACHIEVEMENTS 3개 카드 렌더, href 있는 것만 `<Link>`
7. **Footer 보강** — 공직선거법 제65조 문구 추가
8. **메인페이지 조립** — `app/page.tsx`에 Story 추가, 순서 조정
9. **OG 메타 점검** — `app/layout.tsx`의 `openGraph.description` 검토 (현재 "주민과 함께 일해온 사람" 유지 가능, 또는 슬로건으로 교체 검토)
10. **빌드·시각 점검** — `npm run build` → `npm run dev` → 4개 디바이스 폭 점검
11. **콘텐츠 정합성 검증** — `/tmp/ohjunseok-pamphlet.txt`와 자구 diff (수동 또는 grep)
12. **Lighthouse** — Mobile Performance ≥ 90, Accessibility ≥ 95 확인

### 11.3 Pledge Card Toggle 의사코드

```typescript
"use client";

import { useState } from "react";

export default function Pledges() {
  const [expanded, setExpanded] = useState<Record<PledgeCategoryId, boolean>>({
    child: true,
    together: true,
    transit: true,
  });

  const toggle = (id: PledgeCategoryId) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section>
      {PLEDGE_CATEGORIES.map((category) => (
        <article key={category.id}>
          <button
            type="button"
            onClick={() => toggle(category.id)}
            aria-expanded={expanded[category.id]}
            aria-controls={`pledges-${category.id}`}
            className="... md:pointer-events-none md:cursor-default"
            // md: 이상에서는 클릭 비활성 (CSS로 숨기는 chevron 포함)
          >
            <CategoryHeader category={category} />
          </button>
          <ul
            id={`pledges-${category.id}`}
            className={`${expanded[category.id] ? "max-h-[800px]" : "max-h-0"} md:max-h-none overflow-hidden transition-[max-height]`}
          >
            {category.pledges.map((p) => <PledgeItem key={p.id} {...p} />)}
          </ul>
        </article>
      ))}
    </section>
  );
}
```

---

## 12. Decisions Log

- [ ] **Q1**: 카테고리 3개를 한 페이지에 모두 펼쳤을 때 모바일 스크롤 길이 — 구현 후 측정. (검증 단계로 이연)
- [x] **Q2 → 결정**: 외대앞역 활동 사진은 `child_hospital/외대역_달빛서명.jpg` 사용.
  - 원본 → `public/pamphlet/oedae-station.jpg`로 복사 완료 (2026-05-24).
  - Design 4.4 `ACHIEVEMENTS.oedae-station.image.src = "/pamphlet/oedae-station.jpg"` 유지.
- [x] **Q3 → 결정**: 네거티브 프레임("압수수색 구의회/업무추진비 1위") **영구 제외**.
  - `.impeccable.md` 디자인 원칙 #1 "데이터로 신뢰를"·#3 "정치인 사이트답지 않게"와 정합.
  - 별도 PDCA 분리 안 함. 후속 검토 시 새 feature로 재제안.
- [x] **Q4 → 결정**: OG 이미지 슬로건 합성판 **별도 제작** (`public/og-image-2026.png` 또는 .jpg).
  - **본 feature의 Out of Scope로 분리**. 디자이너 별도 작업 필요(공보물 슬로건 + 후보 사진 + 진보당 컬러).
  - 별도 PDCA feature 제안: `og-image-2026`.
  - 본 feature는 `app/layout.tsx`의 `openGraph.description`만 슬로건 반영("우리 동네 육아 해결사!")으로 업데이트하고, `images` 필드는 OG 이미지 제작 완료 후 별도 PDCA에서 추가.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-21 | 초안 작성. Plan 8.x 콘텐츠 매핑을 TypeScript 타입·상수로 구체화. UI 와이어프레임·구현 순서·테스트 케이스 정의. 공약 개수는 PDF 분리 기준으로 7+8+7 = 22개로 확정(Plan의 17개에서 정밀화). | kcsvictory@gmail.com |
| 0.2 | 2026-05-24 | Open Questions → Decisions Log 전환. Q2(외대역 사진 채택, public/pamphlet/oedae-station.jpg 복사 완료), Q3(네거티브 프레임 영구 제외), Q4(OG 이미지 별도 PDCA로 분리) 확정. | kcsvictory@gmail.com |
