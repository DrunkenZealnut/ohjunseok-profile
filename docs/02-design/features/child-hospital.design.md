# Design: 달빛어린이병원 캠페인 페이지 (child-hospital)

> Plan: [`docs/01-plan/features/child-hospital.plan.md`](../../01-plan/features/child-hospital.plan.md)
> 참조 패턴: `src/app/crosswalk-action/page.tsx` + `src/components/crosswalk-action/*` + `src/data/crosswalk-police-response.ts`

---

## 1. 파일 구조

```
src/
├── app/
│   └── child-hospital/
│       └── page.tsx                            # 메타데이터 + 메인 컴포지션
├── components/
│   └── child-hospital/
│       ├── ChildHospitalHero.tsx               # FR-01 Hero
│       ├── KeyNumbers.tsx                      # FR-02 3,025 / 0 / 121 카드
│       ├── WhatIsDalbit.tsx                    # FR-03 제도 설명
│       ├── DeliveryPhoto.tsx                   # 서명 박스 전달 사진 (메인 한 컷)
│       ├── CampaignTimeline.tsx                # FR-04 추진 타임라인
│       ├── CandidateMessage.tsx                # FR-05 후보 메시지 + 거리 캠페인 사진
│       ├── NextSteps.tsx                       # FR-06 다음 단계 (구의회 약속)
│       └── ShareCta.tsx                        # CTA (의견 보내기 / 응원하기)
├── data/
│   └── child-hospital.ts                       # 정적 데이터 + 타입
└── components/
    └── footer.tsx                              # FOOTER_LINKS 1줄 추가 (수정)
public/
├── child-hospital/
│   ├── signature-delivery.jpg                  # gallery_11.jpeg 리네임 복사
│   └── street-campaign.jpg                     # photo_2026-05-14 회전 보정본
└── child-hospital-og.jpg                       # 1200x630 OG 변형본 (선택)
```

### 메인 페이지에 카드 추가

기존 `src/app/page.tsx` 변경 없음. 대신 새 컴포넌트 1개 추가:

```
src/components/home-action-cards.tsx            # 신규 (또는 기존 적절한 위치에)
```

→ `<HomeActionCards />` 를 `Pledges` 와 `Contact` 사이에 삽입.
※ 기존 컴포지션 구조 손상 최소화를 위해 단일 컴포넌트로 캡슐화.

---

## 2. 페이지 레이아웃 (와이어프레임)

```
┌──────────────────────────────────────────┐
│ <Navbar/>  (글로벌, layout.tsx)            │
├──────────────────────────────────────────┤
│ ChildHospitalHero                          │  ← bg-gradient-to-br sky-200→400
│  ┌──────────────────────┐                  │
│  │ 🔴 [진보당 동대문구]      │  red chip      │
│  │                       │                  │
│  │ 응급실 뺑뺑이                              │
│  │ 내몰린 아이들                              │
│  │ 동대문구는 0개                            │
│  │                       │                  │
│  │ 2026.04.21 · 주민 3,025명                │
│  │ 서명, 동대문구청 전달                       │
│  └──────────────────────┘                  │
├──────────────────────────────────────────┤
│  max-w-3xl mx-auto -mt-10 space-y-6        │  ← 카드 오버랩
│                                            │
│  ┌────────────────────────────────────┐    │
│  │ DeliveryPhoto                       │    │  ← 결정적 한 컷
│  │  [signature-delivery.jpg]           │    │
│  │  2026.04.21 · 동대문구청              │    │
│  │  3,025명의 주민 서명을 전달했습니다.    │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │ KeyNumbers (3카드, 모바일 1열)        │    │
│  │  [3,025명]  [0개소]  [121개소]        │    │
│  │  주민서명   동대문구  전국운영          │    │
│  │  + 인근 자치구 비교 캡션               │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │ WhatIsDalbit                        │    │
│  │  🌙 달빛어린이병원이란?                │    │
│  │  본문 2-3 문단                        │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │ CampaignTimeline (status: done…)    │    │
│  │  ✓ 2026.02 추진본부 설립              │    │
│  │  ✓ 2026.02~04 주민 서명운동           │    │
│  │  ✓ 2026.04.21 서명 전달               │    │
│  │  ○ 다음 단계: 구의회 추진              │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │ CandidateMessage                    │    │
│  │  [street-campaign.jpg 보조]          │    │
│  │  "왜 우리가 직접 움직였나" — 오준석    │    │
│  │  본문 2-3 문단                        │    │
│  │  출처: NGO News 기사 →                │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │ NextSteps                           │    │
│  │  ✓ 참여 병원 발굴                     │    │
│  │  ✓ 재정 지원 확대                     │    │
│  │  ✓ 구청 적극 행정 압박                 │    │
│  └────────────────────────────────────┘    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │ ShareCta                            │    │
│  │  [의견 보내기] [응원하기]              │    │
│  └────────────────────────────────────┘    │
│                                            │
├──────────────────────────────────────────┤
│ <Footer/>  (글로벌)                         │
└──────────────────────────────────────────┘
```

---

## 3. 컴포넌트 명세

### 3.1 `app/child-hospital/page.tsx`

```tsx
import type { Metadata } from "next";
import ChildHospitalHero from "@/components/child-hospital/ChildHospitalHero";
import DeliveryPhoto from "@/components/child-hospital/DeliveryPhoto";
import KeyNumbers from "@/components/child-hospital/KeyNumbers";
import WhatIsDalbit from "@/components/child-hospital/WhatIsDalbit";
import CampaignTimeline from "@/components/child-hospital/CampaignTimeline";
import CandidateMessage from "@/components/child-hospital/CandidateMessage";
import NextSteps from "@/components/child-hospital/NextSteps";
import ShareCta from "@/components/child-hospital/ShareCta";
import { KEY_NUMBERS, CAMPAIGN_TIMELINE, NEXT_STEPS, DELIVERY_PHOTO, CAMPAIGN_PHOTO } from "@/data/child-hospital";

export const metadata: Metadata = {
  title: "달빛어린이병원, 동대문에도 — 오준석",
  description: "동대문구는 달빛어린이병원 0개. 주민 3,025명의 서명을 동대문구청에 전달한 활동 기록과 다음 단계 약속을 정리했습니다.",
  openGraph: {
    title: "주민 3,025명과 함께한 달빛어린이병원 요구",
    description: "동대문구 야간·휴일 소아 진료 공백, 부모들이 직접 움직였습니다.",
    images: [
      { url: "/child-hospital/signature-delivery.jpg", width: 1280, height: 853, alt: "동대문구청에 주민 서명을 전달하는 오준석 후보" },
    ],
    type: "article",
  },
  twitter: { card: "summary_large_image" },
};

export default function ChildHospitalPage() {
  return (
    <main className="min-h-screen bg-sky-50 pb-20">
      <ChildHospitalHero />
      <div className="mx-auto max-w-3xl space-y-6 px-5 -mt-10 md:-mt-12">
        <DeliveryPhoto photo={DELIVERY_PHOTO} />
        <KeyNumbers numbers={KEY_NUMBERS} />
        <WhatIsDalbit />
        <CampaignTimeline items={CAMPAIGN_TIMELINE} />
        <CandidateMessage photo={CAMPAIGN_PHOTO} />
        <NextSteps items={NEXT_STEPS} />
        <ShareCta />
      </div>
    </main>
  );
}
```

### 3.2 `components/child-hospital/ChildHospitalHero.tsx`

- 패턴: `ActionHero` 동일 — `bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 pt-24 pb-20 text-center`
- 상단: party-red 칩 `오직 주민편 / 진보당 동대문구위원회`
- h1: `이문동 어린 아이들을 위한 / 달빛어린이병원을 요구합니다` (font-black, sky-900)
- 부제: 작은 텍스트 `2026.04.21 · 동대문구청 · 주민 3,025명 서명 전달`

### 3.3 `components/child-hospital/DeliveryPhoto.tsx`

- 패턴: `PoliceMeetingPhoto` 거의 그대로
- `<figure>` + `aspect-[3/2]` (gallery_11.jpeg 가로 사진에 맞춤)
- `priority` + sizes prop
- 캡션:
  - 상단 메타: 📷 2026년 4월 21일 · 동대문구청
  - 본문: "오준석 진보당 동대문구 지역위원장이 주민 3,025명의 서명을 동대문구청에 전달하고 있다."

### 3.4 `components/child-hospital/KeyNumbers.tsx`

- 컨테이너: `rounded-2xl bg-white p-6 shadow-sm md:p-8`
- 헤더: 아이콘(BarChart3) + "숫자가 말하는 현실"
- 본문: `grid grid-cols-1 md:grid-cols-3 gap-4`
- 카드 3개:
  | 숫자 | 라벨 | 색상 | 아이콘 |
  |------|------|------|--------|
  | 3,025 | 동대문구 주민 서명 | party-red | FileSignature |
  | 0 | 동대문구 달빛어린이병원 | sky-900 (큰 강조) | XCircle |
  | 121 | 전국 운영 중 | sky-600 | Hospital |
- 하단 캡션: "성북·성동·중랑구 등 인근 자치구는 모두 1곳 이상 운영 중입니다."

### 3.5 `components/child-hospital/WhatIsDalbit.tsx`

- 정적 컴포넌트 (props 없음 — 콘텐츠 고정)
- 헤더: 아이콘(Moon) + "달빛어린이병원이란?"
- 본문 (3 문단):

  > 평일 밤이나 주말에 아이가 갑자기 열이 나면, 부모는 응급실로 달려가야 합니다. 하지만 대형 응급실은 늘 만원이고, 아이는 몇 시간씩 차에 실려 병원을 전전해야 합니다.
  >
  > **달빛어린이병원**은 이 공백을 메우기 위해 만들어진 제도입니다. 정부와 지자체가 운영비를 지원하면, 동네 소아과가 평일 밤 12시까지, 휴일에도 진료를 봅니다. 2026년 현재 전국에 121곳이 있습니다.
  >
  > 그런데 **동대문구에는 한 곳도 없습니다.** 조례는 있지만 참여하는 병원이 없기 때문입니다.

### 3.6 `components/child-hospital/CampaignTimeline.tsx`

- 패턴: `ActionTimeline` 그대로 (재사용 가능 — 동일 status 타입)
- 콘텐츠는 `data/child-hospital.ts` 의 `CAMPAIGN_TIMELINE`
- 헤더: 아이콘(ListChecks) + "추진 과정"
- 부제: "추진본부 설립부터 동대문구청 서명 전달까지, 그리고 다음 단계."

### 3.7 `components/child-hospital/CandidateMessage.tsx`

- 컨테이너: `rounded-2xl bg-white p-6 shadow-sm md:p-8`
- 헤더: 작은 라벨 "오준석의 메시지" + 아이콘(Quote)
- 상단: street-campaign.jpg 작은 가로 이미지 (`aspect-[16/9]` + `rounded-xl`)
- 본문 (한 인물, 한 톤, 2-3 문단):

  > 저도 아이를 키우는 아빠입니다. 작년 겨울, 둘째가 새벽에 열이 39도까지 올랐을 때 인근 병원이 모두 문을 닫아 응급실 세 곳을 돌아다녀야 했습니다. 같은 동대문 부모라면 한 번쯤 겪어본 일입니다.
  >
  > 그래서 작년 2월, 진보당 동대문구 지역위원회는 추진본부를 만들었습니다. 같은 고민을 하는 부모들과 함께 거리에서 서명을 받았고, 4월 21일 **3,025명의 서명을 동대문구청에 직접 전달**했습니다.
  >
  > 서명은 시작입니다. 동대문구청이 적극적으로 참여 병원을 찾고, 재정을 지원하고, 야간·휴일 진료 공백을 메울 때까지 멈추지 않겠습니다.

- 하단: 작은 글씨로 출처 — `관련 기사: NGO News (2026-04-21) →` 외부 링크

> ⚠️ 이 본문은 **임시 카피** — 후보 검토 후 톤/사실관계 확정 필요 (Plan D5)

### 3.8 `components/child-hospital/NextSteps.tsx`

- 컨테이너: `rounded-2xl bg-white p-6 shadow-sm md:p-8`
- 헤더: 아이콘(Target) + "구의원이 되면 약속드립니다"
- 본문: 3 항목 카드 또는 체크리스트
  1. **참여 병원 발굴** — 동대문구 내 소아과 의원과 직접 협의, 야간·휴일 운영 인센티브 안내
  2. **재정 지원 확대** — 시·구비 운영비 보조금 예산 의회에서 요구
  3. **구청 적극 행정** — 보건소 차원의 안내·홍보, 미참여 사유 정기 보고 의무화

### 3.9 `components/child-hospital/ShareCta.tsx`

- 패턴: `OpinionsLink` 확장 — 버튼 2개
- 컨테이너: `rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 p-6 text-center md:p-8`
- 헤드라인: "달빛어린이병원, 함께 만들어 갑시다"
- 부제: "의견을 보내주시거나, 후보 활동을 응원해 주세요."
- 버튼 2개 (가로 정렬, 모바일 세로):
  1. `[의견 보내기]` → `/opinions` (sky-500→sky-600 그라데이션)
  2. `[응원하기]` → `/donate` (party-red 솔리드)

---

## 4. 데이터 타입 (`src/data/child-hospital.ts`)

```ts
// 달빛어린이병원 캠페인 페이지 데이터
// Design: docs/02-design/features/child-hospital.design.md

import type { TimelineItem } from "./crosswalk-police-response";
// ↑ status 타입 재사용. 동일 enum (done | in_progress | planned).

export interface KeyNumber {
  id: string;
  value: string;          // 표시용 (콤마 포함) — "3,025"
  unit: string;           // "명" | "개소"
  label: string;          // "동대문구 주민 서명"
  accent: "red" | "sky-900" | "sky-600";
  icon: "FileSignature" | "XCircle" | "Hospital";
}

export interface PhotoAsset {
  src: string;
  alt: string;
  caption: string;
  date: string;           // ISO yyyy-mm-dd
  width: number;
  height: number;
}

export interface NextStepItem {
  id: string;
  title: string;
  description: string;
  icon: "Stethoscope" | "Coins" | "Megaphone";
}

export const KEY_NUMBERS: KeyNumber[] = [
  { id: "signatures", value: "3,025", unit: "명",  label: "동대문구 주민 서명",       accent: "red",     icon: "FileSignature" },
  { id: "ddm",        value: "0",     unit: "개소", label: "동대문구 달빛어린이병원",  accent: "sky-900", icon: "XCircle" },
  { id: "nation",     value: "121",   unit: "개소", label: "전국 운영 중 (2026년)",   accent: "sky-600", icon: "Hospital" },
];

export const DELIVERY_PHOTO: PhotoAsset = {
  src: "/child-hospital/signature-delivery.jpg",
  alt: "오준석 진보당 동대문구 지역위원장이 '달빛어린이병원 설치 · 3,025개 주민서명' 박스를 동대문구청에 전달하는 모습",
  caption: "오준석 진보당 동대문구 지역위원장이 주민 3,025명의 서명을 동대문구청에 전달하고 있다.",
  date: "2026-04-21",
  width: 1280,
  height: 853,
};

export const CAMPAIGN_PHOTO: PhotoAsset = {
  src: "/child-hospital/street-campaign.jpg",
  alt: "거리에서 '달빛어린이병원 설치' 피켓을 들고 서명을 받는 진보당 동대문구 지역위원회",
  caption: "거리 서명운동 — 같은 고민을 하는 부모들이 함께했습니다.",
  date: "2026-03-01",       // 추정 (서명운동 기간 중) — 후보 확정 시 수정
  width: 800,
  height: 533,
};

export const CAMPAIGN_TIMELINE: TimelineItem[] = [
  {
    date: "2026.02",
    label: "달빛어린이병원 추진본부 설립",
    status: "done",
    description: "진보당 동대문구 지역위원회 주도 · 공동본부장 김택연",
  },
  {
    date: "2026.02 ~ 04",
    label: "주민 서명운동 전개",
    status: "done",
    description: "이문동·답십리·전농동 거리에서 3,025명 서명 수집",
  },
  {
    date: "2026.04.21",
    label: "동대문구청 앞 기자회견 + 서명 전달",
    status: "done",
    description: "주민 3,025명의 서명을 동대문구청에 공식 전달",
  },
  {
    date: "다음 단계",
    label: "구의회 진입 후 추진",
    status: "planned",
    description: "참여 병원 발굴 · 재정 지원 확대 · 구청 적극 행정 요구",
  },
];

export const NEXT_STEPS: NextStepItem[] = [
  {
    id: "find-hospital",
    title: "참여 병원 발굴",
    description: "동대문구 소아과 의원과 직접 협의해 야간·휴일 운영 인센티브를 안내합니다.",
    icon: "Stethoscope",
  },
  {
    id: "budget",
    title: "재정 지원 확대",
    description: "시·구비 운영비 보조금을 예산안에 반영하도록 의회에서 요구합니다.",
    icon: "Coins",
  },
  {
    id: "admin",
    title: "구청 적극 행정",
    description: "보건소 차원의 안내·홍보와 미참여 사유 정기 보고 의무화를 추진합니다.",
    icon: "Megaphone",
  },
];

export const ARTICLE_LINK = {
  url: "https://www.ngonews.kr/news/articleView.html?idxno=228739",
  label: "관련 기사: NGO News (2026-04-21)",
} as const;
```

---

## 5. 디자인 토큰

| 용도 | 클래스 |
|------|--------|
| 메인 배경 | `bg-sky-50` |
| 카드 | `rounded-2xl bg-white p-6 shadow-sm md:p-8` |
| 강조 칩 (red) | `bg-party-red text-white rounded-2xl px-7 py-3` |
| Hero 그라데이션 | `bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400` |
| CTA 그라데이션 | `bg-gradient-to-r from-sky-500 to-sky-600` |
| 카드 제목 | `text-xl font-black text-sky-900 md:text-2xl` |
| 본문 | `text-base leading-relaxed text-sky-800` (모바일 16px+ 확보) |
| 메타/캡션 | `text-xs font-bold text-sky-600` |
| 헤더 아이콘 | `h-5 w-5 text-sky-600` |

---

## 6. 사진 처리

### 6.1 signature-delivery.jpg
- 원본: `child_hospital/gallery_11.jpeg` (정상 방향, 1280×853 추정)
- 처리: 단순 복사 + 리네임 → `public/child-hospital/signature-delivery.jpg`
- 최적화: `next/image` 사용으로 자동 처리. 추가 압축 불필요.

### 6.2 street-campaign.jpg
- 원본: `child_hospital/photo_2026-05-14 08.44.55.jpeg` (180° 회전 필요)
- **결정**: macOS `sips` 또는 `magick` 으로 EXIF 회전 적용 후 신규 파일 저장
- 이유: CSS `rotate-180` 은 alt 텍스트의 시각적 맥락이 일치하지 않고, 스크린리더 사용자 혼란. 정상 방향 파일이 정도(正道).
- 명령: Do 단계에서 `sips -r 180 ...` 또는 ImageMagick `convert -rotate 180 ...`

### 6.3 OG 이미지
- 기본: signature-delivery.jpg 자체를 사용 (1280×853, 비율 약 3:2)
- 카톡 미리보기 최적은 1200×630이지만, 결정적 한 컷이 잘리는 게 더 손해이므로 원본 비율 유지
- 필요 시 별도 1200×630 변형본을 `/public/child-hospital-og.jpg`로 추가 — Do 단계에서 결정

---

## 7. 메인 페이지 + Footer 변경

### 7.1 `src/components/footer.tsx`

```diff
 const FOOTER_LINKS = [
   { label: "이문동 현황", href: "/imun" },
   { label: "주민의견", href: "/opinions" },
+  { label: "달빛어린이병원", href: "/child-hospital" },
   { label: "후보활동", href: "/news" },
   { label: "캠페인 성과", href: "/results" },
   { label: "후원인 정보입력", href: "/donate" },
 ] as const;
```

순서는 "주민의견" 다음 — 핵심 활동·캠페인 성격이므로 상위 노출.

### 7.2 메인 페이지 활동 카드

- 위치: 기존 `<Pledges />` 와 `<Contact />` 사이
- 컴포넌트명: `<HomeActionCards />` (확장성 위해 일반 이름, 향후 다른 활동 추가 시 같은 자리)
- 콘텐츠: 가로형 카드 1개 (모바일 세로 스택)
  - 좌측: signature-delivery.jpg 썸네일 (`aspect-[3/2]`)
  - 우측: 작은 라벨 "최근 활동" + 헤드라인 "주민 3,025명과 함께한 달빛어린이병원 요구" + 짧은 부제 + `자세히 보기 →` 링크
- 스타일: `rounded-2xl bg-white shadow-sm overflow-hidden` + 호버 시 미세 lift

```tsx
// src/components/home-action-cards.tsx (요약)
<section className="mx-auto max-w-3xl px-5 py-10 md:py-14">
  <h2 className="mb-6 text-xl font-black text-sky-900 md:text-2xl">최근 활동</h2>
  <Link
    href="/child-hospital"
    className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className="md:flex">
      <div className="relative aspect-[3/2] md:aspect-auto md:w-1/2">
        <Image src="/child-hospital/signature-delivery.jpg" alt="..." fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      <div className="p-6 md:w-1/2 md:p-8">
        <p className="mb-2 text-xs font-bold text-party-red">2026.04.21 · 동대문구청</p>
        <h3 className="mb-3 text-lg font-black text-sky-900 md:text-xl">주민 3,025명과 함께한 달빛어린이병원 요구</h3>
        <p className="mb-4 text-sm leading-relaxed text-sky-700">동대문구는 달빛어린이병원 0개. 야간·휴일 소아 진료 공백을 메우기 위한 활동 기록.</p>
        <span className="inline-flex items-center gap-1 text-sm font-bold text-sky-600 transition group-hover:gap-2">자세히 보기 <ArrowRight className="h-4 w-4" /></span>
      </div>
    </div>
  </Link>
</section>
```

---

## 8. 반응형 / 접근성

| 항목 | 처리 |
|------|------|
| 모바일 폭 | 모든 카드 `max-w-3xl` 컨테이너 + `px-5` |
| 카드 padding | 모바일 `p-6`, 데스크톱 `md:p-8` |
| KeyNumbers | 모바일 1열 (`grid-cols-1`), `md:grid-cols-3` |
| 사진 사이즈 | `sizes="(max-width: 768px) 100vw, 768px"` |
| 본문 폰트 | `text-base` (16px) 이상, `leading-relaxed` |
| 터치 타겟 | 모든 버튼·링크 최소 `py-3` 이상 → 44px+ |
| alt 텍스트 | 모든 사진 의미 있는 한글 alt (위 데이터 참조) |
| 외부 링크 | `target="_blank" rel="noopener noreferrer"` |
| 색대비 | sky-900/sky-800 텍스트 on white/sky-50 → WCAG AA 통과 |
| 시맨틱 | `<main>`, `<section>`, `<figure>`, `<figcaption>`, `<time>` 사용 |

---

## 9. 구현 순서 (Do 단계용)

1. **자산 준비**
   - `public/child-hospital/` 디렉토리 생성
   - `child_hospital/gallery_11.jpeg` → `public/child-hospital/signature-delivery.jpg` 복사
   - `child_hospital/photo_2026-05-14 08.44.55.jpeg` → 180° 회전 → `public/child-hospital/street-campaign.jpg`
2. **데이터** — `src/data/child-hospital.ts` 작성
3. **컴포넌트** — `src/components/child-hospital/*.tsx` 8개 작성 (위 순서대로)
4. **페이지** — `src/app/child-hospital/page.tsx` 작성
5. **네비게이션 통합**
   - `src/components/footer.tsx` 1줄 추가
   - `src/components/home-action-cards.tsx` 신규 + `src/app/page.tsx` 에 삽입
6. **검증**
   - `npm run dev` → 모바일(375), 태블릿(768), 데스크톱(1280) 폭 시각 확인
   - Lighthouse 모바일 점수 확인 (LCP < 2.5s 목표)
   - footer/메인 카드에서 페이지 진입 동선 확인
7. **임시 카피 표시** — `CandidateMessage` 본문 위에 작은 노트로 "(검토 중)" 또는 주석. 후보 검토 후 제거.

---

## 10. 위험 및 미정 사항

| # | 항목 | 상태 | 처리 시점 |
|---|------|------|----------|
| R1 | `CandidateMessage` 본문 임시 카피 | Design에 명시, Do 단계에서 후보 검토 요청 | Do 후반 |
| R2 | gallery_11.jpeg 실제 해상도 미확인 | `next/image`가 자동 처리 — fill 사용 시 무관 | — |
| R3 | street-campaign.jpg 회전 보정 미실행 | sips/ImageMagick 명령은 Do 단계에서 실행 | Do 1단계 |
| R4 | OG 이미지 별도 1200×630 변형 여부 | signature-delivery 원본 사용으로 시작 | Do 후 모니터링 |
| R5 | `party-red` 색 토큰 정의 위치 | `tailwind.config.ts` 확인 필요 (이미 사용 중이므로 존재) | Do 1단계에서 확인만 |

---

## 11. 검증 체크리스트 (Check 단계)

- [ ] `app/child-hospital/page.tsx` 존재 및 메타데이터 정확
- [ ] 8개 컴포넌트 (`Hero/Delivery/KeyNumbers/WhatIs/Timeline/Message/NextSteps/ShareCta`) 존재
- [ ] `data/child-hospital.ts` 타입과 상수 5종 (KEY_NUMBERS, DELIVERY_PHOTO, CAMPAIGN_PHOTO, CAMPAIGN_TIMELINE, NEXT_STEPS) 일치
- [ ] `public/child-hospital/signature-delivery.jpg` 존재
- [ ] `public/child-hospital/street-campaign.jpg` 존재 + 정상 방향
- [ ] `footer.tsx` FOOTER_LINKS 에 "달빛어린이병원" 추가
- [ ] 메인 페이지에 `HomeActionCards` 노출 + `/child-hospital` 링크 동작
- [ ] 모바일 375px 폭에서 가로 스크롤 없음
- [ ] 모든 사진 alt 텍스트 존재
- [ ] OG 메타 태그 (`<meta property="og:image">`) 동작
- [ ] Lighthouse 모바일 Performance ≥ 85, Accessibility ≥ 90
