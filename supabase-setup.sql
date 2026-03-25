-- Supabase SQL Editor에서 실행하세요
-- https://supabase.com/dashboard → 프로젝트 선택 → SQL Editor

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  location text NOT NULL,
  issue_types jsonb NOT NULL,
  detail text,
  respondent_name text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- 익명 사용자 INSERT 허용 (설문 제출용)
CREATE POLICY "allow_anon_insert" ON public.survey_responses
  FOR INSERT TO anon
  WITH CHECK (true);

-- 서비스 롤 전체 조회 허용 (관리자용)
CREATE POLICY "allow_service_select" ON public.survey_responses
  FOR SELECT TO service_role
  USING (true);

-- ========================================
-- 응원 메시지 테이블
-- ========================================
CREATE TABLE IF NOT EXISTS public.cheers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.cheers ENABLE ROW LEVEL SECURITY;

-- 익명 사용자 INSERT 허용 (응원 제출용)
CREATE POLICY "allow_anon_insert_cheers" ON public.cheers
  FOR INSERT TO anon
  WITH CHECK (true);

-- 서비스 롤 전체 조회 허용 (관리자용)
CREATE POLICY "allow_service_select_cheers" ON public.cheers
  FOR SELECT TO service_role
  USING (true);
