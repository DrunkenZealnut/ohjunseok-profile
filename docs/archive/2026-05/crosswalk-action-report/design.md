# Design: 횡단보도 설문결과 + 동대문경찰서 면담 결과 주민 보고 페이지

> Plan 문서: `docs/01-plan/features/crosswalk-action-report.plan.md`
> Branch: `feature/crosswalk-action-report`
> 작성일: 2026-05-13

---

## 0. 결정사항 (Plan의 미정 사항 확정)

| 항목 | 결정 | 근거 |
|------|------|------|
| 페이지 경로 | `/crosswalk-action` | "활동 결과"라는 의미가 가장 명확. 기존 `/crosswalk-survey`, `/survey-results`와 자연스럽게 시리즈 형성 |
| Navbar 노출 | **B안 + C안 병행** | "캠페인 성과" 메뉴 아래 노출하지 않고, `/results` 페이지 첫 카드로 임베드. 메인 진입은 SNS 공유 링크 중심 |
| 답변자 표기 | **부서 + 직책만** ("교통과 담당자") | 실명 공개 리스크 회피. Do 단계에서 후보 최종 확인 |
| 답변 데이터 위치 | `src/data/crosswalk-police-response.ts` | TypeScript로 타입 안정성 확보. 빈 답변일 때 placeholder UI 자동 노출 |
| 면담 사진 위치 | `public/crosswalk-police-2026-05-13.jpg` | `next/image` 최적화 적용 가능 |

---

## 1. 기능 목록 (확정) — v2 단순화

> **사용자 요청 반영 (v2)**: 설문결과는 설문결과대로, 답변은 답변대로 — 이슈별 1:1 매핑 폐기.
> 두 섹션을 독립적으로 노출한다.

| ID | 기능 | 우선순위 | 신규/재사용 |
|----|------|----------|------------|
| F1 | 히어로 - 활동 결과 요약 | P0 | 신규 |
| F2 | 면담 사진 + 캡션 | P0 | 신규 (next/image) |
| F3 | **설문결과 섹션** (4대 이슈 요약) | P0 | 신규 (정적 데이터) |
| F4 | **경찰서 답변 섹션** (자유 형식) | P0 | 신규 (데이터 파일 기반) |
| F5 | 진행 타임라인 | P1 | 신규 |
| F6 | CTA (공유/추가 의견/전체 분석) | P1 | 신규 |
| F7 | SEO/OG 메타데이터 | P1 | 신규 (Next.js Metadata API) |
| F8 | `/results` 페이지에 임베드 카드 | P1 | 수정 |

---

## 2. 파일 구조

```
src/
├── app/
│   └── crosswalk-action/
│       └── page.tsx                          # 신규 - Server Component
├── components/
│   └── crosswalk-action/
│       ├── ActionHero.tsx                    # F1: 히어로 + 수치 3카드
│       ├── PoliceMeetingPhoto.tsx            # F2: 면담 사진 + 캡션
│       ├── SurveyResultSection.tsx           # F3: 설문결과 섹션 (4대 이슈 요약)
│       ├── PoliceResponseSection.tsx         # F4: 경찰서 답변 섹션 (자유 형식)
│       ├── ActionTimeline.tsx                # F5: 진행 타임라인
│       └── ShareCTA.tsx                      # F6: CTA + 공유 버튼 (Client)
└── data/
    └── crosswalk-police-response.ts          # 데이터 (TypeScript)

public/
└── crosswalk-police-2026-05-13.jpg          # 면담 사진 (이동)

수정:
├── src/app/results/page.tsx                  # F8: 첫 카드를 새 페이지로 링크
└── src/components/navbar.tsx                 # 노출 안 함 (현재 정책 유지)
```

---

## 3. 데이터 모델

### 3.1 데이터 스키마 (v2 — 매핑 제거)

`src/data/crosswalk-police-response.ts`:

```typescript
// 4대 이슈 정의 (설문 결과 섹션 전용)
export interface Issue {
  id: string;
  rank: number;
  title: string;
  mentionCount: number;     // 25건 중 언급 건수
  icon: string;             // Lucide React 아이콘 이름
  citationQuote: string;    // 주민 원문 인용 (1줄)
  detailAnchor?: string;    // /survey-results 페이지 앵커 (옵션)
}

// 경찰서 답변 (자유 형식 — 이슈 매핑 없음)
export interface PoliceResponseItem {
  heading?: string;         // 답변 소제목 (옵션 — 없으면 단락만)
  body: string;             // 답변 본문 (단락 단위)
}

export interface PoliceResponseSection {
  responderRole: string;    // "동대문경찰서 교통과 담당자"
  meetingDate: string;      // "2026-05-13"
  intro?: string;           // 답변 도입 문장 (옵션)
  items: PoliceResponseItem[];   // 답변 본문 (1개 이상)
  followUp?: string;        // 후속 일정 한 줄
  isPending: boolean;       // true면 placeholder UI
}

export interface MeetingPhoto {
  src: string;
  alt: string;
  caption: string;
  date: string;
  width: number;
  height: number;
}

export interface TimelineItem {
  date: string;
  label: string;
  status: "done" | "in_progress" | "planned";
  description?: string;
}

// 핵심 export
export const ISSUES: Issue[];                       // F3: 설문 결과용
export const POLICE_RESPONSE: PoliceResponseSection; // F4: 답변 섹션용 (단일 객체)
export const MEETING_PHOTOS: MeetingPhoto[];
export const TIMELINE: TimelineItem[];
export const SUMMARY_STATS: {
  totalResponses: number;   // 25
  coreIssues: number;       // 4
  meetingCount: number;     // 1
};
```

### 3.2 초기 데이터

```typescript
export const ISSUES: Issue[] = [
  { id: "diagonal_crosswalk", rank: 1, title: "대각선 횡단보도 필요",
    mentionCount: 14, icon: "Footprints",
    citationQuote: "동시신호면 외대 정문 앞처럼 대각선 횡단보도 그려주세요" },
  { id: "signal_time", rank: 2, title: "보행 신호 시간 부족",
    mentionCount: 8, icon: "Clock",
    citationQuote: "보행신호가 너무 짧아 영유아, 어린이와 함께 건널때 위험합니다" },
  { id: "unprotected_left", rank: 3, title: "비보호 좌회전 위험",
    mentionCount: 4, icon: "AlertTriangle",
    citationQuote: "좌회전 차량이 많은데 직진 차량은 매일 위험을 감수합니다" },
  { id: "blind_spot", rank: 4, title: "횡단보도 사각지대",
    mentionCount: 5, icon: "MapPin",
    citationQuote: "빽다방 앞으로 건너다니는 사람이 있어 위험합니다" },
];

// ⚠️ 답변 내용은 후보 입력 대기 (Do 단계 진입 전)
export const POLICE_RESPONSE: PoliceResponseSection = {
  responderRole: "동대문경찰서 교통과 담당자",
  meetingDate: "2026-05-13",
  intro: "",          // 후보 입력 대기
  items: [],          // 후보 입력 대기 — 빈 배열이면 isPending 자동 true
  followUp: "",
  isPending: true,    // 답변 내용 입력 시 false로 변경
};
```

### 3.3 DB 변경 없음
이 페이지는 정적 콘텐츠 기반. Supabase 호출 없음.

---

## 4. 컴포넌트 설계

### 4.1 page.tsx (Server Component)

```tsx
import type { Metadata } from "next";
import { ActionHero } from "@/components/crosswalk-action/ActionHero";
import { PoliceMeetingPhoto } from "@/components/crosswalk-action/PoliceMeetingPhoto";
import { SurveyResultSection } from "@/components/crosswalk-action/SurveyResultSection";
import { PoliceResponseSection } from "@/components/crosswalk-action/PoliceResponseSection";
import { ActionTimeline } from "@/components/crosswalk-action/ActionTimeline";
import { ShareCTA } from "@/components/crosswalk-action/ShareCTA";
import {
  ISSUES, POLICE_RESPONSE, MEETING_PHOTOS, TIMELINE, SUMMARY_STATS,
} from "@/data/crosswalk-police-response";

export const metadata: Metadata = {
  title: "이문동 횡단보도 25건 의견, 동대문경찰서 전달 완료 — 오준석",
  description: "주민 25명이 모은 횡단보도 개선 의견을 동대문경찰서에 직접 전달했습니다. 4대 이슈별 답변과 후속 일정을 한눈에 보세요.",
  openGraph: {
    title: "이문동 횡단보도 의견 25건, 동대문경찰서에 전달",
    description: "주민이 모은 의견, 후보가 직접 전달, 경찰서 답변까지 — 한 페이지로 정리했습니다.",
    images: [{ url: "/crosswalk-police-2026-05-13.jpg", width: 1200, height: 630 }],
    type: "article",
  },
  twitter: { card: "summary_large_image" },
};

export default function CrosswalkActionPage() {
  return (
    <main className="min-h-screen bg-sky-50 pb-20">
      <ActionHero stats={SUMMARY_STATS} />
      <div className="mx-auto -mt-8 max-w-3xl px-5 space-y-6">
        <PoliceMeetingPhoto photo={MEETING_PHOTOS[0]} />
        <SurveyResultSection issues={ISSUES} totalResponses={SUMMARY_STATS.totalResponses} />
        <PoliceResponseSection response={POLICE_RESPONSE} />
        <ActionTimeline items={TIMELINE} />
        <ShareCTA />
      </div>
    </main>
  );
}
```

### 4.2 ActionHero (F1)

**Props**: `{ stats: { totalResponses: number; coreIssues: number; meetingCount: number } }`

```tsx
<header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 pt-24 pb-16 text-center">
  <span className="mb-4 inline-block rounded-full bg-party-red px-5 py-1.5 text-sm font-bold text-white">
    주민 의견 → 동대문경찰서 전달 완료
  </span>
  <h1 className="mb-3 text-3xl font-black text-sky-900 md:text-4xl leading-tight">
    여러분의 <span className="text-party-red">{stats.totalResponses}건</span>이<br />
    경찰서로 전달됐습니다
  </h1>
  <p className="mb-8 text-sm text-sky-700 md:text-base">
    주민 설문 결과를 바탕으로 동대문경찰서를 직접 찾아 면담했습니다
  </p>
  {/* 3-stat 카드 */}
  <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
    <StatCard label="수집된 의견" value={stats.totalResponses} unit="건" />
    <StatCard label="핵심 이슈" value={stats.coreIssues} unit="대" />
    <StatCard label="경찰서 면담" value={stats.meetingCount} unit="회" />
  </div>
</header>
```

**디자인 토큰**:
- 글래스모피즘: `bg-white/30 backdrop-blur-md`
- 본문 16px 이상, 제목 `font-black` (900)
- 모바일 우선: 모든 패딩은 px-5 기본

### 4.3 PoliceMeetingPhoto (F2)

**Props**: `{ photo: MeetingPhoto }`

```tsx
<figure className="overflow-hidden rounded-2xl bg-white shadow-sm">
  <div className="relative aspect-[4/3] w-full">
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      className="object-cover"
      priority
      sizes="(max-width: 768px) 100vw, 768px"
    />
  </div>
  <figcaption className="border-t border-sky-100 bg-sky-50/50 px-5 py-4">
    <div className="mb-1 flex items-center gap-2 text-xs font-bold text-sky-600">
      <Camera className="h-3.5 w-3.5" />
      {formatDate(photo.date)} · 동대문경찰서
    </div>
    <p className="text-sm leading-relaxed text-sky-800">{photo.caption}</p>
  </figcaption>
</figure>
```

**중요**:
- `priority` 사용 (LCP 후보)
- `alt`: "동대문경찰서 면담 장면 - 오준석 후보가 주민 설문 결과를 설명하는 모습"
- 사진은 `public/crosswalk-police-2026-05-13.jpg`로 이동 (현재 `src/app/crosswalk-survey/photo_2026-05-13 23.28.41.jpeg`)

### 4.4 SurveyResultSection (F3) — v2 단순화

**Props**: `{ issues: Issue[]; totalResponses: number }`

설문 결과를 답변과 무관하게 **그 자체로** 보여준다.

```tsx
<section className="rounded-2xl bg-white p-6 shadow-sm">
  <div className="mb-2 flex items-center gap-2">
    <BarChart3 className="h-5 w-5 text-sky-600" />
    <h2 className="text-xl font-black text-sky-900">설문 결과 요약</h2>
  </div>
  <p className="mb-5 text-sm text-sky-600">
    주민 {totalResponses}건의 응답을 분석한 핵심 이슈 4가지입니다.
  </p>
  <div className="grid gap-4 md:grid-cols-2">
    {issues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
  </div>
  <div className="mt-6 border-t border-sky-100 pt-4 text-center">
    <Link href="/survey-results" className="inline-flex items-center gap-1 text-sm font-bold text-sky-600 hover:underline">
      전체 분석 보기 (전문가 소견 포함) <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
</section>
```

**IssueCard 디자인**:
- 순위 뱃지 (1~4)
- Lucide 아이콘 (이슈별 색상 — red/orange/yellow/violet)
- 제목 (font-bold text-base)
- 언급 건수 뱃지 (예: "14건 언급")
- 주민 원문 인용 (italic, border-l-4, 회색 배경)
- "자세히 보기" 링크는 카드 단위가 아닌 섹션 하단에 1개만 → `/survey-results`

### 4.5 PoliceResponseSection (F4) — v2 단순화

**Props**: `{ response: PoliceResponseSection }`

답변을 이슈와 매핑하지 않고 **답변 자체로** 보여준다. 자유 형식.

```tsx
<section className="rounded-2xl bg-white p-6 shadow-sm">
  <div className="mb-2 flex items-center gap-2">
    <ShieldCheck className="h-5 w-5 text-sky-600" />
    <h2 className="text-xl font-black text-sky-900">동대문경찰서 답변</h2>
  </div>
  <p className="mb-5 text-sm text-sky-600">
    {formatDate(response.meetingDate)} 면담 · {response.responderRole}
  </p>

  {response.isPending || response.items.length === 0 ? (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <Clock className="mx-auto mb-3 h-8 w-8 text-gray-400" />
      <p className="text-sm font-medium text-gray-600">
        답변 내용을 정리하고 있습니다
      </p>
      <p className="mt-1 text-xs text-gray-500">
        곧 이 자리에 동대문경찰서의 답변이 업데이트됩니다.
      </p>
    </div>
  ) : (
    <div className="space-y-5">
      {response.intro && (
        <p className="leading-relaxed text-sky-800">{response.intro}</p>
      )}
      <div className="space-y-4">
        {response.items.map((item, i) => (
          <div key={i} className="rounded-xl border-l-4 border-sky-300 bg-sky-50/50 p-4">
            {item.heading && (
              <h3 className="mb-2 font-bold text-sky-900">{item.heading}</h3>
            )}
            <p className="leading-relaxed text-sky-800 whitespace-pre-line">
              {item.body}
            </p>
          </div>
        ))}
      </div>
      {response.followUp && (
        <div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-4">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm font-medium text-amber-900">{response.followUp}</p>
        </div>
      )}
    </div>
  )}
</section>
```

**Fallback 처리**:
- `isPending === true` 또는 `items.length === 0` → "답변 내용을 정리하고 있습니다" placeholder
- 후보가 답변 입력 후 `isPending: false`로 변경하고 `items` 채움
- 상태 뱃지·이슈 매핑 없음 (자유 형식만 유지)

### 4.6 ActionTimeline (F5)

**Props**: `{ items: TimelineItem[] }`

```tsx
<section className="rounded-2xl bg-white p-6 shadow-sm">
  <h2 className="mb-5 text-xl font-black text-sky-900">진행 상황</h2>
  <ol className="space-y-4">
    {items.map((item, i) => (
      <TimelineRow
        key={i}
        item={item}
        isLast={i === items.length - 1}
      />
    ))}
  </ol>
</section>
```

**디자인**:
- 좌측 세로선 (`border-l-2`)
- 상태별 점: ✅ done (emerald), 🔄 in_progress (amber), ⏳ planned (gray)
- 날짜 + 라벨 + 설명(있으면)

**초기 데이터**:
```typescript
[
  { date: "2026-04~05", label: "주민 설문 수집", status: "done", description: "25건 응답" },
  { date: "2026-05-13", label: "동대문경찰서 면담", status: "done" },
  { date: "다음", label: "동대문구청 교통행정과 면담", status: "in_progress" },
  { date: "계획", label: "서울시 교통안전 특별관리구역 지정 요청", status: "planned" },
  { date: "계획", label: "주민 결과 보고 간담회", status: "planned" },
]
```

### 4.7 ShareCTA (F6) — Client Component

**Props**: 없음

```tsx
"use client";
<section className="rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 p-8 text-center">
  <h3 className="mb-2 text-lg font-bold text-sky-900">
    이웃에게도 알려주세요
  </h3>
  <p className="mb-5 text-sm text-sky-700">
    여러분의 한 번의 공유가 변화를 만듭니다
  </p>
  <div className="grid gap-3 sm:grid-cols-3">
    <Link href="/survey-results" className="...">📊 전체 분석 보기</Link>
    <button onClick={shareKakao} className="...">💬 카톡 공유</button>
    <button onClick={copyLink} className="...">🔗 링크 복사</button>
  </div>
  {/* 설문 진행 중이면 추가 */}
  <div className="mt-4 border-t border-sky-300/50 pt-4 text-sm text-sky-700">
    <Link href="/crosswalk-survey" className="font-bold underline">
      아직 의견을 못 주셨나요? →
    </Link>
  </div>
</section>
```

**카카오 공유**:
- 카카오 SDK는 옵션 (이미 다른 페이지에서 사용 여부 확인 필요)
- 기본은 Web Share API + 복사 fallback

### 4.8 `/results` 페이지 수정 (F8)

`src/app/results/page.tsx`의 RESULTS 배열에 새 항목 추가 또는 기존 항목 수정. 최상단 카드로 노출:

```tsx
{
  icon: Footprints,
  title: "이문동 횡단보도 개선",
  status: "진행 중",
  description: "주민 25건 의견을 모아 동대문경찰서에 직접 전달했습니다.",
  link: { href: "/crosswalk-action", label: "활동 결과 자세히 보기 →" },
  // ...
}
```

또는 별도 카드 형태로 임베드 (사진 미리보기 포함).

---

## 5. 페이지 구조 (모바일 와이어프레임)

```
┌─────────────────────────────┐
│ [Hero - sky gradient]       │
│ 🔴 주민 의견 → 동대문경찰서 │
│ "여러분의 25건이             │
│  경찰서로 전달됐습니다"      │
│ ┌──┬──┬──┐                  │
│ │25│ 4│ 1│                  │
│ │건│대│회│                  │
│ └──┴──┴──┘                  │
├─────────────────────────────┤
│ [면담 사진 - 풀와이드]       │
│ ┌─────────────────────────┐ │
│ │  [동대문경찰서 면담]    │ │
│ │  사진 (4:3)             │ │
│ └─────────────────────────┘ │
│ 📷 2026.05.13 · 동대문경찰서│
│ "주민 설문 결과 설명..."     │
├─────────────────────────────┤
│ [설문 결과 요약]             │
│ 📊 설문 결과 요약            │
│ 주민 25건 응답 분석          │
│ ┌─────────┐ ┌─────────┐    │
│ │ ① 14건  │ │ ② 8건   │    │
│ │ 대각선  │ │ 신호시간 │    │
│ │ "인용"  │ │ "인용"  │    │
│ └─────────┘ └─────────┘    │
│ ┌─────────┐ ┌─────────┐    │
│ │ ③ 4건   │ │ ④ 5건   │    │
│ │ 비보호  │ │ 사각지대│    │
│ └─────────┘ └─────────┘    │
│      전체 분석 보기 →        │
├─────────────────────────────┤
│ [경찰서 답변]                │
│ 🛡️ 동대문경찰서 답변         │
│ 2026.05.13 · 교통과 담당자   │
│ ┌─────────────────────────┐ │
│ │ (답변 도입 문장)          │ │
│ │                          │ │
│ │ ▎답변 항목 1 (소제목)    │ │
│ │   답변 본문 단락          │ │
│ │                          │ │
│ │ ▎답변 항목 2             │ │
│ │   답변 본문 단락          │ │
│ │                          │ │
│ │ 📅 후속 일정 (있으면)     │ │
│ └─────────────────────────┘ │
│ (답변 입력 전: placeholder) │
├─────────────────────────────┤
│ [진행 상황 타임라인]         │
│ ✅ 4~5월 주민 설문 (25건)    │
│ ✅ 5/13 경찰서 면담         │
│ 🔄 구청 교통행정과 면담      │
│ ⏳ 서울시 특별관리구역      │
│ ⏳ 주민 결과 보고 간담회    │
├─────────────────────────────┤
│ [CTA]                       │
│ "이웃에게도 알려주세요"      │
│ [📊분석] [💬카톡] [🔗복사]   │
│ ─────────────────           │
│ 아직 의견을 못 주셨나요? →   │
└─────────────────────────────┘
```

**총 길이 예상**: 약 2800~3200px (모바일 375px 기준) — 스크롤 4~5회

---

## 6. 상태 관리 / 로직

### 6.1 SSR (Server Component)
- 모든 데이터는 정적 import (`@/data/crosswalk-police-response`)
- DB 호출 없음 → 빌드 시점에 모든 콘텐츠 결정
- Vercel ISR 불필요 (정적)

### 6.2 답변 미입력 처리 (v2)

`PoliceResponseSection` 내부에서 단일 분기로 처리:
- `response.isPending === true` 또는 `response.items.length === 0` → 섹션 전체에 placeholder 카드 (회색 톤 + 시계 아이콘 + "답변 내용을 정리하고 있습니다")
- 답변 입력 후 데이터 파일에서 `isPending: false`, `items: [...]` 채우면 정상 노출
- 이슈별 매핑/상태 뱃지 없음 — 자유 형식 단일 섹션

### 6.3 카카오 공유 로직 (옵션)
- 카카오 SDK 미설치 시 Web Share API → 미지원 시 클립보드 복사 fallback
- 우선순위 낮음. 첫 배포는 링크 복사만 구현해도 충분.

---

## 7. 디자인 시스템 준수

### 7.1 색상 (impeccable.md 준수)
- 배경: `bg-sky-50`
- 히어로: `bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400`
- 카드: `bg-white shadow-sm`
- 강조: `bg-party-red` (`#e02020`), `text-sky-900`
- 다크 섹션 없음 (`/survey-results`와 차별화 — 더 밝은 톤 유지)

### 7.2 타이포그래피
- 제목: `font-black` (900), `text-3xl ~ text-4xl`
- 본문: `font-normal` (400), `text-sm ~ text-base`
- 본문 최소 16px (어르신 가독성)

### 7.3 모서리/효과
- 카드: `rounded-2xl`
- 뱃지: `rounded-full`
- 사진: `rounded-2xl`
- 글래스모피즘: 히어로 수치 카드만 (`bg-white/30 backdrop-blur-md`)

### 7.4 아이콘
- Lucide React (기존과 일관)
- 사용: `Footprints`, `Clock`, `AlertTriangle`, `MapPin`, `ShieldCheck`, `Camera`, `CheckCircle2`, `MessageCircle`, `ArrowRightCircle`, `Calendar`

### 7.5 Anti-Goal 준수
- ❌ 3-column 카드 그리드 남발 (이슈 카드는 2-column으로)
- ❌ 보라색 그라데이션 (sky 톤 일관)
- ❌ AI 템플릿 느낌 — 사진을 중앙 배치해 "사람" 느낌 강조

---

## 8. 구현 순서 (Do 단계 가이드)

1. **사진 이동** (1단계 — 5분)
   - `src/app/crosswalk-survey/photo_2026-05-13 23.28.41.jpeg` → `public/crosswalk-police-2026-05-13.jpg`
   - 빈 `crosswalk_police_reply.md` 정리 (삭제 또는 `_legacy/` 이동)

2. **데이터 파일** (2단계 — 30분)
   - `src/data/crosswalk-police-response.ts` 생성
   - 타입 정의 + ISSUES, MEETING_PHOTOS, TIMELINE, SUMMARY_STATS 채우기
   - `POLICE_RESPONSE`는 `isPending: true`, `items: []`로 시작

3. **컴포넌트 구현** (3단계 — 2~3시간)
   순서: ActionHero → PoliceMeetingPhoto → SurveyResultSection → PoliceResponseSection → ActionTimeline → ShareCTA

4. **페이지 조립** (4단계 — 30분)
   - `src/app/crosswalk-action/page.tsx` 생성
   - metadata 작성
   - 컴포넌트 조립

5. **`/results` 임베드** (5단계 — 20분)
   - `src/app/results/page.tsx`에 최상단 카드 또는 링크 추가

6. **모바일 실기기 점검** (6단계 — 30분)
   - 375px 폭에서 스크롤 횟수 확인
   - 사진 로딩 속도 (LCP)
   - 본문 16px 이상 확인

7. **답변 데이터 입력** (7단계 — 후보 작업)
   - `POLICE_RESPONSE.items`에 답변 단락 작성 (소제목 + 본문)
   - `POLICE_RESPONSE.intro`, `followUp` 작성
   - `isPending: false`로 변경

8. **OG 이미지 확인 + 배포** (8단계)
   - 카톡 미리보기 시뮬레이션 (실기기로 공유 테스트)
   - Vercel 배포

---

## 9. 테스트 시나리오

| # | 시나리오 | 기대 결과 |
|---|---------|----------|
| 1 | `POLICE_RESPONSE.isPending: false` + items 입력 | 답변 섹션에 본문 정상 노출 |
| 2 | `isPending: true` 또는 items 빈 배열 | "답변 정리 중" placeholder 1개 |
| 3 | 설문 결과 섹션 단독 동작 | 답변 입력 여부와 무관하게 4대 이슈 노출 |
| 4 | 모바일 375px에서 스크롤 | 4~5회 스크롤로 완독 가능 |
| 5 | `/results` 페이지 진입 | 첫 카드가 새 페이지로 링크 |
| 6 | 카톡으로 링크 공유 | OG 이미지 + 핵심 메시지 미리보기 |
| 7 | Lighthouse | Performance 90+, Accessibility 95+ |
| 8 | 사진 alt 텍스트 | 스크린리더로 의미 전달 |

---

## 10. 리스크 / 미정 사항

### 10.1 해결됨
- ✅ 페이지 경로 (`/crosswalk-action`)
- ✅ Navbar 노출 (안 함 + `/results` 임베드)
- ✅ 답변자 표기 (실명 X, 부서·직책 O)
- ✅ 답변 미입력 처리 (placeholder)

### 10.2 Do 단계 진입 전 확인 필요 (후보)
- ⚠️ **면담 답변 4건 텍스트** (5/13 면담 내용 정리)
- ⚠️ 후속 일정 (현장 점검 등 약속받은 일정)
- ⚠️ 다음 면담 일정 (구청 교통행정과 등)
- ❓ 면담 추가 사진 (있으면 갤러리 형태 가능)

### 10.3 향후 확장
- 다른 면담(구청, 서울시) 추가 시 같은 페이지 구조 재사용 가능
- 진행 상황 업데이트 시 `TIMELINE`만 수정하면 됨

---

## 11. 다음 단계

1. **Do 단계 진입**:
   ```
   /pdca do crosswalk-action-report
   ```

2. **후보(사용자) 입력 대기**:
   - 면담 답변 4건 텍스트
   - 후속 일정
   - 다음 면담 계획

3. **Do 단계 시작 가능 항목 (답변 입력 없이도)**:
   - 사진 이동
   - 데이터 파일 스켈레톤
   - 컴포넌트 구현
   - 페이지 조립 (placeholder UI로 작동)
