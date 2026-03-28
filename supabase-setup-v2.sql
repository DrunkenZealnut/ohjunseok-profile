-- ========================================
-- v2: 유권자 소통 사이트 업그레이드
-- Supabase SQL Editor에서 실행하세요
-- ========================================

-- cheers 테이블: 익명 읽기 정책 추가 (응원 게시판 표시용)
CREATE POLICY "allow_anon_select_cheers" ON public.cheers
  FOR SELECT TO anon
  USING (true);

-- ========================================
-- 활동 소식 (posts)
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
-- 주민 의견함 (opinions)
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
-- 투개표참관인 신청 (poll_observers)
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
