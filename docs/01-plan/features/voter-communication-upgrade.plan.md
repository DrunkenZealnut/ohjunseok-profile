# Plan: 프로필 페이지를 유권자 소통 사이트로 업그레이드

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | 유권자 소통 사이트 업그레이드 |
| 시작일 | 2026-03-28 |
| 목표일 | 2026-04-05 |
| 예상 기간 | 8일 |

### Value Delivered

| 관점 | 설명 |
|------|------|
| **Problem** | 현재 사이트는 후보 소개 중심의 일방향 정보 전달로, 유권자와의 양방향 소통이 불가능하다. 응원 메시지는 저장만 되고 공개되지 않으며, 주민이 후보의 활동이나 공약 진행 상황을 확인할 방법이 없다. |
| **Solution** | 응원 메시지 공개 게시판, 주민 의견 수렴 시스템, 활동 소식 피드, 자원봉사 참여 신청 기능을 추가하여 유권자와 후보 간 양방향 소통 채널을 구축한다. |
| **Function UX Effect** | 유권자는 실시간으로 다른 주민의 응원을 보며 참여 동기를 얻고, 직접 의견을 남기고 후보의 활동을 확인할 수 있다. 후보는 주민 의견을 수집하고 지지 현황을 파악할 수 있다. |
| **Core Value** | 주민 참여형 선거 문화를 만들어, "주민과 함께 일해온 사람"이라는 슬로건을 사이트 경험으로 체현한다. |

---

## 1. 배경 및 목적

### 1.1 현재 상태
- **메인 페이지**: Hero, 프로필, 핵심가치, 공약, 응원하기, 푸터 (일방향 소개)
- **설문 페이지**: 횡단보도 개선 의견 수집 (단일 주제)
- **명함 페이지**: 후원 안내 카드 2종
- **이메일 알림**: 설문/응원 제출 시 관리자에게 알림
- **DB 테이블**: `survey_responses`, `cheers` (Supabase)

### 1.2 문제점
1. **응원 메시지 비공개**: `cheers` 테이블에 저장되지만 사이트에 표시되지 않음
2. **소통 채널 부재**: 유권자 → 후보 일방향만 존재, 후보 → 유권자 채널 없음
3. **활동 소식 없음**: 선거운동 활동, 공약 진행 상황 등 업데이트 수단 없음
4. **참여 방법 제한**: 응원/설문 외 유권자가 참여할 수 있는 방법이 없음
5. **재방문 유인 부재**: 정적 콘텐츠 위주로 재방문 동기가 없음

### 1.3 목표
- 유권자가 **보고, 남기고, 참여하는** 양방향 소통 사이트로 전환
- 기존 기능(설문, 응원, 명함)을 유지하면서 소통 기능 확장
- 후보의 활동 소식을 유권자에게 전달하는 채널 구축
- 투개표참관인 등 직접 참여 경로 제공

---

## 2. 기능 정의

### 2.1 F1: 응원 메시지 게시판 (우선순위: P0)
**현재**: 응원 메시지를 저장만 하고 공개하지 않음
**목표**: 기존 `cheers` 데이터를 실시간으로 사이트에 표시

- 최신순 응원 메시지 목록 표시
- 무한 스크롤 또는 페이지네이션
- 이름 없는 경우 "익명의 주민" 표시
- 작성 시간 표시 (상대 시간: "3시간 전")
- 총 응원 수 카운터 표시
- 기존 `contact.tsx` 컴포넌트와 통합 (입력폼 + 목록)

**영향 범위**: `src/components/contact.tsx`, Supabase RLS (SELECT 정책 추가)

### 2.2 F2: 활동 소식 피드 (우선순위: P0)
**현재**: 없음
**목표**: 후보의 선거운동 활동, 공약 관련 소식을 게시

- 관리자(후보)가 Supabase에 직접 소식 등록 (별도 관리 UI 없이)
- 메인 페이지에 최신 3건 미리보기 카드
- `/news` 페이지에 전체 목록
- 제목, 본문, 이미지(선택), 작성일
- 마크다운 또는 plain text 본문 지원

**신규 테이블**: `posts` (id, title, content, image_url, created_at)
**신규 파일**: `src/app/news/page.tsx`, `src/components/news-preview.tsx`

### 2.3 F3: 주민 의견함 (우선순위: P1)
**현재**: 횡단보도 설문만 존재 (단일 주제, 고정 양식)
**목표**: 범용적인 주민 의견 접수 채널

- 주제 자유 입력 (횡단보도 외 다양한 생활 불편)
- 카테고리 선택: 교통, 안전, 환경, 복지, 교육, 기타
- 이름/연락처 선택 입력
- 관리자 이메일 알림 (기존 `/api/notify` 확장)

**신규 테이블**: `opinions` (id, category, title, content, name, phone, created_at)
**신규 파일**: `src/app/opinions/page.tsx`

### 2.4 F4: 투개표참관인 신청 (우선순위: P1)
**현재**: 없음
**목표**: 투표참관인·개표참관인 모집

- 이름, 연락처, 거주지(동 단위) 입력
- 참관 유형 선택: 투표참관인, 개표참관인
- 가능한 날짜/시간, 하고 싶은 말 입력 (선택)
- 제출 후 관리자 이메일 알림
- 참관인 안내 문구 포함

**신규 테이블**: `poll_observers` (id, name, phone, address, observer_type, available_date, message, created_at)
**신규 파일**: `src/app/observer/page.tsx`

### 2.5 F5: 사이트 네비게이션 (우선순위: P0)
**현재**: 단일 페이지 구조, 네비게이션 없음
**목표**: 여러 페이지를 연결하는 네비게이션 바

- 상단 고정 네비게이션 바
- 메뉴: 홈, 활동 소식, 주민 의견함, 참관인 신청, 설문
- 모바일 햄버거 메뉴
- 현재 페이지 하이라이트
- 스크롤 시 배경 블러 효과

**신규 파일**: `src/components/navbar.tsx`
**수정 파일**: `src/app/layout.tsx`

### 2.6 F6: 공유 기능 (우선순위: P2)
**목표**: SNS 공유를 통한 사이트 확산

- 카카오톡 공유 버튼
- 링크 복사 버튼
- 각 페이지별 OG 메타태그 최적화

---

## 3. 기술 스택

### 3.1 유지
- Next.js 15 (App Router)
- React 18
- Tailwind CSS 4
- Supabase (DB + RLS)
- Nodemailer (이메일 알림)
- Vercel (배포)

### 3.2 추가
- 없음 (기존 스택으로 충분)

---

## 4. 데이터 모델 변경

### 4.1 기존 테이블 수정
```sql
-- cheers 테이블: 읽기 정책 추가 (현재 INSERT만 허용)
CREATE POLICY "Anyone can read cheers"
  ON cheers FOR SELECT
  USING (true);
```

### 4.2 신규 테이블
```sql
-- 활동 소식
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 주민 의견함
CREATE TABLE opinions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 투개표참관인 신청
CREATE TABLE poll_observers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  observer_type TEXT[] NOT NULL,
  available_date TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. 구현 순서

| 순서 | 기능 | 우선순위 | 예상 작업량 |
|------|------|----------|-------------|
| 1 | F5: 네비게이션 바 | P0 | 소 |
| 2 | F1: 응원 메시지 게시판 | P0 | 소 |
| 3 | F2: 활동 소식 피드 | P0 | 중 |
| 4 | F3: 주민 의견함 | P1 | 중 |
| 5 | F4: 투개표참관인 신청 | P1 | 소 |
| 6 | F6: 공유 기능 | P2 | 소 |

---

## 6. 리스크 및 제약사항

| 리스크 | 영향 | 대응 |
|--------|------|------|
| Supabase 무료 요금제 한도 | DB/API 제한 | 현재 트래픽 규모에서는 충분, 모니터링 |
| 스팸 응원/의견 | 게시판 오염 | RLS 기본 보호 + 필요시 모더레이션 추가 |
| 이미지 업로드 (소식) | Supabase Storage 필요 | 초기에는 외부 이미지 URL만 지원 |
| 선거법 관련 표현 | 법적 리스크 | 콘텐츠 검토 필요 (개발 범위 외) |

---

## 7. 성공 지표

- 응원 메시지 작성 수 증가 (공개 표시 후)
- 주민 의견 접수 건수
- 투개표참관인 신청 건수
- 페이지 재방문율 증가 (활동 소식 업데이트 기반)
- 평균 체류 시간 증가
