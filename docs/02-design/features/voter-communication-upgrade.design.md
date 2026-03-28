# Design: 유권자 소통 사이트 업그레이드

> Plan 문서: `docs/01-plan/features/voter-communication-upgrade.plan.md`
> 변경사항: F4 자원봉사 → 투개표참관인 신청으로 교체

---

## 1. 기능 목록 (확정)

| ID | 기능 | 우선순위 | 신규/수정 |
|----|------|----------|-----------|
| F1 | 응원 메시지 게시판 | P0 | 수정 (contact.tsx 확장) |
| F2 | 활동 소식 피드 | P0 | 신규 |
| F3 | 주민 의견함 | P1 | 신규 |
| F4 | 투개표참관인 신청 | P1 | 신규 (Plan의 자원봉사에서 교체) |
| F5 | 사이트 네비게이션 | P0 | 신규 |
| F6 | 공유 기능 | P2 | 신규 |

---

## 2. 데이터 모델

### 2.1 기존 테이블 수정

```sql
-- cheers: 익명 읽기 정책 추가 (F1 응원 게시판 표시용)
CREATE POLICY "allow_anon_select_cheers" ON public.cheers
  FOR SELECT TO anon
  USING (true);
```

### 2.2 신규 테이블

```sql
-- ========================================
-- F2: 활동 소식
-- ========================================
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_select_posts" ON public.posts
  FOR SELECT TO anon
  USING (true);

CREATE POLICY "allow_service_all_posts" ON public.posts
  FOR ALL TO service_role
  USING (true);

-- ========================================
-- F3: 주민 의견함
-- ========================================
CREATE TABLE IF NOT EXISTS public.opinions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.opinions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_insert_opinions" ON public.opinions
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "allow_service_select_opinions" ON public.opinions
  FOR SELECT TO service_role
  USING (true);

-- ========================================
-- F4: 투개표참관인 신청
-- ========================================
CREATE TABLE IF NOT EXISTS public.poll_observers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  observer_type TEXT[] NOT NULL,
  available_date TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.poll_observers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_insert_poll_observers" ON public.poll_observers
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "allow_service_select_poll_observers" ON public.poll_observers
  FOR SELECT TO service_role
  USING (true);
```

### 2.3 데이터 모델 요약

| 테이블 | 용도 | RLS (anon) | 비고 |
|--------|------|------------|------|
| `cheers` (기존) | 응원 메시지 | INSERT + **SELECT 추가** | F1 |
| `posts` (신규) | 활동 소식 | SELECT | 관리자가 Supabase에서 직접 등록 |
| `opinions` (신규) | 주민 의견 | INSERT | F3 |
| `poll_observers` (신규) | 투개표참관인 | INSERT | F4 |

---

## 3. 파일 구조 설계

```
src/
├── app/
│   ├── layout.tsx                    ← 수정: Navbar 추가
│   ├── page.tsx                      ← 수정: 소식 미리보기, 참관인 CTA 추가
│   ├── api/
│   │   └── notify/route.ts           ← 수정: opinion, observer 타입 추가
│   ├── crosswalk-survey/page.tsx     (유지)
│   ├── news/
│   │   └── page.tsx                  ← 신규: 활동 소식 전체 목록
│   ├── opinions/
│   │   └── page.tsx                  ← 신규: 주민 의견함
│   ├── observer/
│   │   └── page.tsx                  ← 신규: 투개표참관인 신청
│   └── namecard/                     (유지)
├── components/
│   ├── navbar.tsx                    ← 신규: 네비게이션 바
│   ├── news-preview.tsx              ← 신규: 메인 소식 미리보기 카드
│   ├── cheer-list.tsx                ← 신규: 응원 메시지 목록
│   ├── share-button.tsx              ← 신규: 공유 버튼
│   ├── hero.tsx                      (유지)
│   ├── profile.tsx                   (유지)
│   ├── values.tsx                    (유지)
│   ├── pledges.tsx                   (유지)
│   ├── contact.tsx                   ← 수정: cheer-list 통합
│   └── footer.tsx                    ← 수정: 네비게이션 링크 추가
└── lib/
    └── supabase.ts                   (유지)
```

---

## 4. 컴포넌트 상세 설계

### 4.1 F5: Navbar (`src/components/navbar.tsx`)

**구현 순서: 1번째** (다른 페이지 추가 전에 네비게이션 틀 필요)

```
┌─────────────────────────────────────────────────────┐
│ [로고: 오준석]   홈  소식  의견함  참관인신청  설문   │
│                                        [≡ 모바일]   │
└─────────────────────────────────────────────────────┘
```

- **타입**: Client Component (`"use client"`)
- **상태**: `isOpen` (모바일 메뉴 토글), `scrolled` (스크롤 감지)
- **스타일**: `fixed top-0 z-50`, 스크롤 시 `bg-white/90 backdrop-blur shadow`
- **메뉴 항목**:

| 라벨 | 경로 | 비고 |
|------|------|------|
| 홈 | `/` | |
| 소식 | `/news` | F2 |
| 의견함 | `/opinions` | F3 |
| 참관인 신청 | `/observer` | F4 |
| 설문 | `/crosswalk-survey` | 기존 |

- **모바일**: 햄버거 아이콘 → 드롭다운 메뉴 (애니메이션)
- **현재 페이지**: `usePathname()`으로 감지, 활성 메뉴 하이라이트 (sky-500 색상)

**layout.tsx 수정**:
```tsx
<body>
  <Navbar />
  <main className="pt-16">{children}</main>  {/* navbar 높이만큼 패딩 */}
</body>
```

### 4.2 F1: 응원 메시지 게시판

**구현 순서: 2번째**

#### 4.2.1 CheerList (`src/components/cheer-list.tsx`)

- **타입**: Client Component
- **데이터**: `supabase.from("cheers").select("*").order("created_at", { ascending: false }).range(0, 19)`
- **표시 항목**: 이름 (없으면 "익명의 주민"), 메시지, 상대 시간
- **페이지네이션**: "더 보기" 버튼 (20개씩 추가 로드)
- **총 응원 수**: `supabase.from("cheers").select("*", { count: "exact", head: true })`

```
┌────────────────────────────────────────┐
│  💛 총 42명이 응원하고 있습니다        │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 김OO · 2시간 전                  │  │
│  │ "오준석 후보님 화이팅!"          │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ 익명의 주민 · 5시간 전           │  │
│  │ "이문동을 위해 힘내주세요"       │  │
│  └──────────────────────────────────┘  │
│                                        │
│        [ 더 보기 ]                     │
└────────────────────────────────────────┘
```

**상대 시간 함수** (별도 라이브러리 없이 구현):
```ts
function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "방금 전";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  return `${Math.floor(seconds / 86400)}일 전`;
}
```

#### 4.2.2 Contact 수정 (`src/components/contact.tsx`)

기존 입력폼 유지 + 하단에 `<CheerList />` 추가:

```
┌────────────────────────────────────────┐
│   오준석에게 응원 보내기               │
│                                        │
│   [이름 입력]                          │
│   [응원 메시지 입력              ]     │
│   [      응원 보내기      ]            │
│                                        │
│   ──── 응원 메시지 ────                │
│   <CheerList />                        │
└────────────────────────────────────────┘
```

- 제출 성공 후 `CheerList` 새로고침 (key prop 변경으로 리렌더)

### 4.3 F2: 활동 소식 피드

**구현 순서: 3번째**

#### 4.3.1 NewsPreview (`src/components/news-preview.tsx`)

메인 페이지에 표시할 최신 소식 3건 미리보기.

- **타입**: Server Component (async)
- **데이터**: `supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(3)`
- **빈 상태**: 소식이 없으면 섹션 자체를 숨김

```
┌────────────────────────────────────────┐
│        활동 소식                       │
│                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │ 이미지│  │ 이미지│  │ 이미지│        │
│  │ 제목  │  │ 제목  │  │ 제목  │        │
│  │ 날짜  │  │ 날짜  │  │ 날짜  │        │
│  └──────┘  └──────┘  └──────┘         │
│                                        │
│        [ 소식 전체 보기 → ]            │
└────────────────────────────────────────┘
```

- 카드: 이미지(있으면 표시, 없으면 sky-100 배경) + 제목 + 날짜
- "소식 전체 보기" → `/news` 링크

**주의**: Server Component이므로 별도 supabase 서버 클라이언트 필요. 기존 `supabase.ts`는 `NEXT_PUBLIC_` 키만 사용하므로 읽기 전용으로 활용 가능 (RLS에서 anon SELECT 허용).

#### 4.3.2 News 페이지 (`src/app/news/page.tsx`)

- **타입**: Server Component (async)
- **데이터**: 전체 소식 목록 (최신순)
- **레이아웃**: 카드 리스트 (세로 배치)

```
┌────────────────────────────────────────┐
│  활동 소식                             │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ [이미지]  제목                   │  │
│  │           본문 미리보기 (2줄)    │  │
│  │           2026.03.28             │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ [이미지]  제목                   │  │
│  │           본문 미리보기 (2줄)    │  │
│  │           2026.03.27             │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

- 본문: 200자까지 미리보기, 클릭 시 전체 본문 펼침 (accordion 방식)
- 이미지: 없으면 기본 sky gradient 배경

**page.tsx 수정**: Hero와 Pledges 사이에 `<NewsPreview />` 삽입:
```
<Hero />
<Profile />
<Values />
<NewsPreview />    ← 추가
<Pledges />
<Contact />
<Footer />
```

### 4.4 F3: 주민 의견함 (`src/app/opinions/page.tsx`)

**구현 순서: 4번째**

- **타입**: Client Component (`"use client"`)
- **폼 필드**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| category | select | O | 교통, 안전, 환경, 복지, 교육, 기타 |
| title | text | O | 제목 (50자 이내) |
| content | textarea | O | 내용 |
| name | text | X | 이름 |
| phone | tel | X | 전화번호 |

```
┌────────────────────────────────────────┐
│  📮 주민 의견함                         │
│  이문동의 생활 불편이나 개선 의견을    │
│  자유롭게 남겨주세요.                  │
│                                        │
│  카테고리 [▼ 선택하세요       ]        │
│  제목     [                   ]        │
│  내용     [                   ]        │
│           [                   ]        │
│  이름     [        ] (선택)            │
│  연락처   [        ] (선택)            │
│                                        │
│  [      의견 제출하기      ]           │
└────────────────────────────────────────┘
```

- 제출 성공 시 감사 화면 (설문과 동일한 패턴)
- 이메일 알림: `/api/notify`에 `type: "opinion"` 추가

### 4.5 F4: 투개표참관인 신청 (`src/app/observer/page.tsx`)

**구현 순서: 5번째** (Plan의 자원봉사에서 교체)

- **타입**: Client Component (`"use client"`)
- **폼 필드**:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| name | text | O | 이름 |
| phone | tel | O | 전화번호 |
| address | text | X | 거주지 (동 단위) |
| observer_type | checkbox[] | O | 투표참관인, 개표참관인 |
| available_date | text | X | 가능한 날짜/시간 |
| message | textarea | X | 하고 싶은 말 |

```
┌────────────────────────────────────────┐
│  🗳️ 투개표참관인 신청                   │
│                                        │
│  공정한 선거를 함께 지켜주세요!        │
│  투표참관인·개표참관인을               │
│  모집합니다.                           │
│                                        │
│  ── 참관인이란? ──                     │
│  선거의 공정성을 감시하는 시민의       │
│  권리입니다. 누구나 신청 가능합니다.   │
│                                        │
│  이름     [                ]  *        │
│  연락처   [                ]  *        │
│  거주지   [                ]           │
│                                        │
│  참관 유형 *                           │
│  [✓] 투표참관인 (투표일 당일)          │
│  [✓] 개표참관인 (개표 시)              │
│                                        │
│  가능한 시간 [                ]        │
│  하고싶은 말 [                ]        │
│                                        │
│  [      참관인 신청하기      ]         │
└────────────────────────────────────────┘
```

- 제출 후: 감사 화면 + 관리자 이메일 알림
- 이메일 알림: `/api/notify`에 `type: "observer"` 추가

### 4.6 F6: 공유 버튼 (`src/components/share-button.tsx`)

**구현 순서: 6번째**

- **타입**: Client Component
- **위치**: Footer 상단 또는 Hero 하단
- **기능**:
  - 링크 복사 (`navigator.clipboard.writeText`)
  - 카카오톡 공유 (Kakao SDK → 초기에는 링크 복사만 구현, P2)
- **UI**: 작은 아이콘 버튼 2개 (복사 + 카카오)

---

## 5. API 수정 (`/api/notify`)

기존 `type: "survey" | "cheer"` 에 2개 타입 추가:

```ts
// type: "opinion"
subject: `[의견] 주민 의견이 접수되었습니다 - ${category}`;
html: 카테고리, 제목, 내용, 이름, 연락처 테이블

// type: "observer"
subject: `[참관인] 투개표참관인 신청이 접수되었습니다`;
html: 이름, 연락처, 거주지, 참관 유형, 가능한 시간, 메시지 테이블
```

---

## 6. 페이지별 메타데이터

| 페이지 | title | description |
|--------|-------|-------------|
| `/` | 오준석 \| 진보당 이문동 구의원 후보 | (기존 유지) |
| `/news` | 활동 소식 \| 오준석 | 이문동을 위한 오준석 후보의 활동 소식 |
| `/opinions` | 주민 의견함 \| 오준석 | 이문동 생활 개선을 위한 주민 의견을 들려주세요 |
| `/observer` | 투개표참관인 신청 \| 오준석 | 공정한 선거를 함께 지켜주세요 |
| `/crosswalk-survey` | (기존 유지) | (기존 유지) |

---

## 7. 구현 순서 (확정)

| 단계 | 작업 | 파일 | 의존성 |
|------|------|------|--------|
| 1 | DB 테이블 생성 + RLS | `supabase-setup-v2.sql` | 없음 |
| 2 | Navbar 컴포넌트 | `navbar.tsx`, `layout.tsx` | 없음 |
| 3 | 응원 게시판 | `cheer-list.tsx`, `contact.tsx` 수정 | DB (cheers SELECT) |
| 4 | 활동 소식 | `news-preview.tsx`, `news/page.tsx`, `page.tsx` 수정 | DB (posts) |
| 5 | 주민 의견함 | `opinions/page.tsx`, `notify/route.ts` 수정 | DB (opinions) |
| 6 | 투개표참관인 신청 | `observer/page.tsx`, `notify/route.ts` 수정 | DB (poll_observers) |
| 7 | 공유 버튼 | `share-button.tsx`, `footer.tsx` 수정 | 없음 |
| 8 | 메타데이터 최적화 | 각 page.tsx | 전체 완료 후 |

---

## 8. UI 디자인 가이드

### 8.1 색상 체계 (기존 유지)
- **Primary**: sky-500 (`#3d9ad9`)
- **Text**: sky-800 (`#0a1e33`)
- **Accent**: party-red (`#e02020`)
- **Background**: sky-50 (`#f0f7fc`)
- **Card**: white + shadow-sm

### 8.2 컴포넌트 패턴
- **카드**: `rounded-2xl bg-white p-7 shadow-sm`
- **버튼**: `rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold`
- **입력**: `rounded-xl border-2 border-sky-200 focus:border-sky-500`
- **섹션 제목**: `text-3xl font-black text-sky-800` + 밑줄 데코레이션
- **배지**: `rounded-full bg-party-red px-5 py-1.5 text-sm font-bold text-white`

### 8.3 반응형 전략
- **Mobile First**: 기본 단일 컬럼
- **sm (640px+)**: 2컬럼 그리드
- **md (768px+)**: 최대 너비 제한, 여백 확대

---

## 9. 변경사항 (Plan 대비)

| Plan 항목 | Design 변경 | 사유 |
|-----------|-------------|------|
| F4: 자원봉사 참여 신청 | **투개표참관인 신청**으로 교체 | 사용자 요청. 선거에 더 직접적으로 기여할 수 있는 참관인 모집이 우선. |
| volunteers 테이블 | **poll_observers** 테이블로 교체 | F4 변경에 따른 데이터 모델 변경 |
| 메뉴: 참여하기 | **참관인 신청**으로 명칭 변경 | F4 변경 반영 |
