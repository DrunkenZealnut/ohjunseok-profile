-- ========================================
-- donations 테이블 업그레이드
-- 기존 테이블에 신규 컬럼 추가
-- Supabase SQL Editor에서 이 파일만 실행하세요.
-- ========================================

ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS detail_address TEXT,
  ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email TEXT;
