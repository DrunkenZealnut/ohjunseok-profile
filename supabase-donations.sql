-- ========================================
-- 후원금 입금정보 (donations)
-- 기부금영수증 발급용
-- Supabase SQL Editor에서 실행하세요
-- ========================================

CREATE TABLE IF NOT EXISTS public.donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  resident_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  amount INTEGER NOT NULL,
  deposit_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- 익명 사용자 INSERT만 허용 (폼 제출용)
CREATE POLICY "allow_anon_insert_donations" ON public.donations
  FOR INSERT TO anon
  WITH CHECK (true);

-- service_role 전체 접근 (관리자용)
CREATE POLICY "allow_service_all_donations" ON public.donations
  FOR ALL TO service_role
  USING (true);
