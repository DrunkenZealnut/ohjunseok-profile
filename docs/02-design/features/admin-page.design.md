# Design: 관리자 페이지 구성

> Plan 문서: `docs/01-plan/features/admin-page.plan.md`

---

## 1. 파일 구조

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx              ← 신규: 인증 가드 + 사이드바 레이아웃
│   │   ├── page.tsx                ← 신규: 대시보드
│   │   ├── login/
│   │   │   └── page.tsx            ← 신규: 로그인 페이지
│   │   ├── surveys/
│   │   │   └── page.tsx            ← 신규: 설문 응답 목록
│   │   ├── cheers/
│   │   │   └── page.tsx            ← 신규: 응원 메시지 목록
│   │   ├── opinions/
│   │   │   └── page.tsx            ← 신규: 주민 의견 목록
│   │   ├── observers/
│   │   │   └── page.tsx            ← 신규: 참관인 신청 목록
│   │   └── posts/
│   │       └── page.tsx            ← 신규: 소식 관리 (CRUD)
│   └── api/
│       └── admin/
│           ├── login/route.ts      ← 신규: 로그인 API
│           └── data/route.ts       ← 신규: 데이터 CRUD API
└── lib/
    └── supabase-admin.ts           ← 신규: service_role 클라이언트
```

---

## 2. 인증 설계 (A1)

### 2.1 로그인 API (`/api/admin/login`)

```ts
// POST { password: string }
// 검증: password === process.env.ADMIN_PASSWORD
// 성공: { token: crypto.randomUUID() } → 서버 메모리에 토큰 저장
// 실패: 401
```

- 토큰: `crypto.randomUUID()`로 생성, 서버 모듈 스코프 `Set`에 저장
- 만료: 24시간 (생성 시각 기록)
- Vercel Serverless 특성상 인스턴스 간 토큰 공유 불가 → 대안: 간단한 HMAC 토큰

**HMAC 토큰 방식** (Serverless 호환):
```ts
// 생성: HMAC-SHA256(password + timestamp, ADMIN_PASSWORD)
// 검증: 토큰 디코딩 후 timestamp가 24h 이내인지 + HMAC 재계산 일치 확인
```

### 2.2 로그인 페이지 (`/admin/login/page.tsx`)

```
┌────────────────────────────────────────┐
│                                        │
│          🔒 관리자 로그인              │
│                                        │
│    [비밀번호 입력            ]          │
│                                        │
│    [      로그인      ]                │
│                                        │
│    잘못된 비밀번호입니다 (에러 시)     │
│                                        │
└────────────────────────────────────────┘
```

- Client Component
- 비밀번호 입력 → `/api/admin/login` POST
- 성공 시 토큰을 `sessionStorage.setItem("admin_token", token)`에 저장
- `/admin`으로 리다이렉트

### 2.3 인증 가드 (`/admin/layout.tsx`)

- Client Component
- `sessionStorage`에서 토큰 확인
- 토큰 없으면 → `/admin/login`으로 리다이렉트
- 토큰 있으면 → 사이드바 + children 렌더
- 공용 Navbar 숨김 처리 (admin 전용 레이아웃)

### 2.4 Supabase Admin Client (`/lib/supabase-admin.ts`)

```ts
// 서버 전용 (API Route에서만 사용)
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

---

## 3. Admin API 설계 (`/api/admin/data`)

단일 API Route로 모든 CRUD 처리 (테이블/액션을 파라미터로 구분).

### 3.1 GET — 목록 조회

```
GET /api/admin/data?table=cheers&page=1&limit=20
Authorization: Bearer <token>

Response: { data: [...], count: 42 }
```

| 파라미터 | 설명 | 기본값 |
|----------|------|--------|
| table | survey_responses, cheers, opinions, poll_observers, posts | 필수 |
| page | 페이지 번호 | 1 |
| limit | 페이지당 건수 | 20 |

### 3.2 POST — 소식 작성

```
POST /api/admin/data
Authorization: Bearer <token>
Body: { table: "posts", data: { title, content, image_url } }

Response: { data: { id, ... } }
```

### 3.3 PUT — 소식 수정

```
PUT /api/admin/data
Authorization: Bearer <token>
Body: { table: "posts", id: "uuid", data: { title, content, image_url } }

Response: { data: { id, ... } }
```

### 3.4 DELETE — 삭제

```
DELETE /api/admin/data?table=posts&id=uuid
Authorization: Bearer <token>

Response: { ok: true }
```

- 허용 테이블: `posts`, `cheers`, `opinions` (삭제 대상 제한)
- `survey_responses`, `poll_observers`는 삭제 불가 (보존)

### 3.5 GET count — 대시보드용 카운트

```
GET /api/admin/data?action=counts
Authorization: Bearer <token>

Response: { survey_responses: 15, cheers: 42, opinions: 8, poll_observers: 3, posts: 5 }
```

---

## 4. 페이지 상세 설계

### 4.1 Admin Layout (`/admin/layout.tsx`)

```
┌──────────────┬──────────────────────────────┐
│  사이드바     │  콘텐츠 영역                  │
│              │                              │
│  📊 대시보드  │  {children}                  │
│  📋 설문     │                              │
│  💬 응원     │                              │
│  📮 의견     │                              │
│  🗳️ 참관인   │                              │
│  📰 소식     │                              │
│              │                              │
│  [로그아웃]  │                              │
└──────────────┴──────────────────────────────┘
```

- **데스크톱**: 좌측 고정 사이드바 (w-56)
- **모바일**: 상단 햄버거 → 드롭다운 메뉴
- `usePathname()`으로 활성 메뉴 하이라이트
- 로그아웃: sessionStorage 토큰 삭제 → `/admin/login` 리다이렉트
- **메타데이터**: robots noindex (검색 엔진 제외)

**사이드바 메뉴**:

| 라벨 | 경로 | 아이콘 |
|------|------|--------|
| 대시보드 | `/admin` | LayoutDashboard |
| 설문 응답 | `/admin/surveys` | ClipboardList |
| 응원 메시지 | `/admin/cheers` | Heart |
| 주민 의견 | `/admin/opinions` | MessageSquare |
| 참관인 신청 | `/admin/observers` | Vote |
| 소식 관리 | `/admin/posts` | FileText |

### 4.2 대시보드 (`/admin/page.tsx`)

```
┌────────────────────────────────────────┐
│  관리자 대시보드                        │
│                                        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐  │
│  │ 15 │ │ 42 │ │  8 │ │  3 │ │  5 │  │
│  │설문│ │응원│ │의견│ │참관│ │소식│  │
│  └────┘ └────┘ └────┘ └────┘ └────┘  │
│                                        │
│  최근 접수                              │
│  ┌──────────────────────────────────┐  │
│  │ [응원] 김OO: 화이팅! - 2시간 전  │  │
│  │ [의견] 교통: ... - 3시간 전      │  │
│  │ [참관인] 박OO - 5시간 전         │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

- `GET /api/admin/data?action=counts`로 5개 카운트 조회
- 최근 접수: cheers, opinions, poll_observers에서 각 최근 1건씩 가져와 시간순 정렬
- 카드 클릭 시 해당 목록 페이지로 이동

### 4.3 데이터 목록 페이지 (공통 패턴)

4개 목록 페이지(`surveys`, `cheers`, `opinions`, `observers`)는 동일 패턴:

```
┌────────────────────────────────────────┐
│  설문 응답 (15건)                      │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 이문로34길 사거리                 │  │
│  │ 신호체계, 야간조명               │  │
│  │ 김OO · 010-xxxx · 3.28          │  │
│  │                        [삭제]   │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ ...                              │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [← 이전]  1 / 3  [다음 →]           │
└────────────────────────────────────────┘
```

- 각 카드에 테이블별 주요 컬럼 표시
- 페이지네이션: 20건씩, 이전/다음 버튼
- 삭제 버튼: cheers, opinions만 (confirm 다이얼로그 후)
- survey_responses, poll_observers는 삭제 불가 (보존 원칙)

**테이블별 카드 표시 필드**:

| 테이블 | 표시 필드 |
|--------|-----------|
| survey_responses | location, issue_types (태그), detail(축약), respondent_name, phone, created_at |
| cheers | name(또는 "익명"), message, created_at, **[삭제]** |
| opinions | category(배지), title, content(축약), name, phone, created_at, **[삭제]** |
| poll_observers | name, phone, address, observer_type(태그), available_date, created_at |

### 4.4 소식 관리 (`/admin/posts/page.tsx`)

```
┌────────────────────────────────────────┐
│  소식 관리          [+ 새 소식 작성]    │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ 이문동 주민 간담회 개최           │  │
│  │ 2026.03.28                       │  │
│  │               [수정]  [삭제]     │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ── 작성/수정 폼 (토글) ──             │
│  제목    [                      ]      │
│  이미지  [URL 입력               ]     │
│  본문    [                      ]      │
│          [                      ]      │
│          [      저장      ]            │
└────────────────────────────────────────┘
```

- 목록 + 인라인 작성/수정 폼 (같은 페이지)
- "새 소식 작성" 클릭 → 폼 표시 (제목, 이미지 URL, 본문)
- "수정" 클릭 → 폼에 기존 값 채움
- "삭제" 클릭 → confirm 후 삭제
- 저장 후 목록 자동 새로고침

---

## 5. 환경변수

```env
# 기존
SUPABASE_SERVICE_ROLE_KEY=...   # 이미 존재

# 신규
ADMIN_PASSWORD=<strong-password>  # .env.local + Vercel에 등록
```

---

## 6. 보안 설계

| 항목 | 방법 |
|------|------|
| 인증 | HMAC 토큰 (ADMIN_PASSWORD 기반, 24h 만료) |
| API 보호 | 모든 `/api/admin/*` 요청에 Bearer 토큰 검증 |
| Service Role Key | API Route 서버에서만 사용, 클라이언트 노출 금지 |
| 검색 엔진 | `/admin` 전체 `robots: noindex` 설정 |
| 삭제 제한 | survey_responses, poll_observers 삭제 불가 |
| Navbar 분리 | Admin은 공용 Navbar 미표시, 전용 사이드바 사용 |

---

## 7. 구현 순서

| 단계 | 작업 | 파일 | 의존성 |
|------|------|------|--------|
| 1 | supabase-admin 클라이언트 | `lib/supabase-admin.ts` | 없음 |
| 2 | 로그인 API | `api/admin/login/route.ts` | 없음 |
| 3 | 데이터 API (CRUD) | `api/admin/data/route.ts` | supabase-admin |
| 4 | 로그인 페이지 | `admin/login/page.tsx` | 로그인 API |
| 5 | Admin Layout (사이드바 + 인증 가드) | `admin/layout.tsx` | 로그인 |
| 6 | 대시보드 | `admin/page.tsx` | 데이터 API |
| 7 | 목록 4개 (surveys, cheers, opinions, observers) | `admin/*/page.tsx` | 데이터 API |
| 8 | 소식 관리 CRUD | `admin/posts/page.tsx` | 데이터 API |
| 9 | Navbar 숨김 처리 | `layout.tsx` 또는 `navbar.tsx` | Admin Layout |

---

## 8. UI 디자인 가이드

- **배경**: `bg-gray-50` (Admin 전용, 공개 사이트의 sky-50과 구분)
- **사이드바**: `bg-sky-800 text-white` (좌측 고정)
- **카드**: `rounded-xl bg-white p-5 shadow-sm`
- **카운트 카드**: `bg-gradient-to-br from-sky-500 to-sky-600 text-white rounded-2xl`
- **버튼**: 기존 sky 계열 유지, 삭제는 `bg-red-500`
- **모바일**: 사이드바 → 상단 드롭다운, 카드 1컬럼
