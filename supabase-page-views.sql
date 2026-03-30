-- 페이지 방문 기록 테이블
CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT,
  user_agent TEXT
);

-- 인덱스: 페이지별 + 날짜별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_visited_at ON page_views (visited_at);
CREATE INDEX IF NOT EXISTS idx_page_views_path_date ON page_views (page_path, visited_at);

-- RLS 활성화
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- anon 사용자는 INSERT만 허용 (방문 기록 저장)
CREATE POLICY "Allow anonymous insert" ON page_views
  FOR INSERT TO anon WITH CHECK (true);

-- service_role만 SELECT 허용 (관리자 조회)
CREATE POLICY "Allow service_role select" ON page_views
  FOR SELECT TO service_role USING (true);
