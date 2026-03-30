import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const PAGE_LABELS: Record<string, string> = {
  "/": "메인 페이지",
  "/news": "활동 소식",
  "/opinions": "주민 의견함",
  "/observer": "참관인 신청",
  "/crosswalk-survey": "설문",
  "/donate": "후원인 정보입력",
};

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token || !verifyToken(token)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") || "7");

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  const supabase = getSupabaseAdmin();

  // 전체 방문수 (기간 내)
  const { count: totalViews } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .gte("visited_at", sinceISO);

  // 페이지별 방문수
  const { data: rawRows } = await supabase
    .from("page_views")
    .select("page_path, visited_at")
    .gte("visited_at", sinceISO);

  const rows = rawRows ?? [];

  // 페이지별 집계
  const perPage: Record<string, number> = {};
  for (const row of rows) {
    perPage[row.page_path] = (perPage[row.page_path] || 0) + 1;
  }

  const pageStats = Object.entries(perPage)
    .map(([path, views]) => ({
      path,
      label: PAGE_LABELS[path] || path,
      views,
    }))
    .sort((a, b) => b.views - a.views);

  // 일별 추이
  const daily: Record<string, number> = {};
  for (const row of rows) {
    const date = row.visited_at.slice(0, 10);
    daily[date] = (daily[date] || 0) + 1;
  }

  const dailyStats = Object.entries(daily)
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 오늘 방문수
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayViews = daily[todayStr] || 0;

  return NextResponse.json({
    totalViews: totalViews ?? 0,
    todayViews,
    pageStats,
    dailyStats,
    days,
  });
}
