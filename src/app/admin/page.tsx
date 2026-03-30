"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminGet, adminHeaders } from "@/lib/admin-fetch";
import {
  ClipboardList,
  Heart,
  MessageSquare,
  Vote,
  FileText,
  HandHeart,
  Eye,
  TrendingUp,
  BarChart3,
} from "lucide-react";

const CARDS = [
  { key: "survey_responses", label: "설문 응답", href: "/admin/surveys", icon: ClipboardList, color: "from-sky-500 to-sky-600" },
  { key: "cheers", label: "응원 메시지", href: "/admin/cheers", icon: Heart, color: "from-pink-500 to-pink-600" },
  { key: "opinions", label: "주민 의견", href: "/admin/opinions", icon: MessageSquare, color: "from-emerald-500 to-emerald-600" },
  { key: "poll_observers", label: "참관인 신청", href: "/admin/observers", icon: Vote, color: "from-violet-500 to-violet-600" },
  { key: "posts", label: "소식", href: "/admin/posts", icon: FileText, color: "from-amber-500 to-amber-600" },
  { key: "donations", label: "후원자", href: "/admin/donations", icon: HandHeart, color: "from-rose-500 to-rose-600" },
] as const;

interface PageStat {
  path: string;
  label: string;
  views: number;
}

interface DailyStat {
  date: string;
  views: number;
}

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  pageStats: PageStat[];
  dailyStats: DailyStat[];
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    adminGet("action=counts").then((data) => {
      setCounts(data);
      setLoading(false);
    });

    fetch("/api/admin/analytics?days=7", { headers: adminHeaders() })
      .then((res) => res.json())
      .then(setAnalytics)
      .catch(() => {});
  }, []);

  const maxDaily = analytics
    ? Math.max(...analytics.dailyStats.map((d) => d.views), 1)
    : 1;
  const maxPage = analytics
    ? Math.max(...analytics.pageStats.map((p) => p.views), 1)
    : 1;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">대시보드</h1>

      {/* 방문자 통계 요약 */}
      {analytics && (
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-700">
              <Eye className="h-5 w-5 text-sky-500" />
              방문자 통계 (최근 7일)
            </h2>
            <Link
              href="/admin/analytics"
              className="text-sm text-sky-600 hover:underline"
            >
              상세보기 →
            </Link>
          </div>

          {/* 요약 수치 */}
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                총 방문
              </div>
              <p className="mt-1 text-2xl font-black text-gray-800">
                {analytics.totalViews.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4" />
                오늘 방문
              </div>
              <p className="mt-1 text-2xl font-black text-emerald-600">
                {analytics.todayViews.toLocaleString()}
              </p>
            </div>
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <BarChart3 className="h-4 w-4" />
                일평균
              </div>
              <p className="mt-1 text-2xl font-black text-violet-600">
                {analytics.dailyStats.length > 0
                  ? Math.round(
                      analytics.totalViews / analytics.dailyStats.length
                    ).toLocaleString()
                  : 0}
              </p>
            </div>
          </div>

          {/* 일별 추이 미니 차트 */}
          {analytics.dailyStats.length > 0 && (
            <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-gray-600">일별 추이</p>
              <div className="flex items-end gap-1" style={{ height: 100 }}>
                {analytics.dailyStats.map((d) => (
                  <div
                    key={d.date}
                    className="group relative flex flex-1 flex-col items-center"
                  >
                    <span className="mb-1 text-[0.6rem] font-bold text-gray-500 opacity-0 transition group-hover:opacity-100">
                      {d.views}
                    </span>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-sky-500 to-sky-400 transition-all group-hover:from-sky-600 group-hover:to-sky-500"
                      style={{
                        height: `${Math.max((d.views / maxDaily) * 72, 3)}px`,
                      }}
                    />
                    <span className="mt-1 text-[0.55rem] text-gray-400">
                      {d.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 페이지별 Top 5 */}
          {analytics.pageStats.length > 0 && (
            <div className="rounded-xl bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-semibold text-gray-600">
                페이지별 방문 Top 5
              </p>
              <div className="space-y-2">
                {analytics.pageStats.slice(0, 5).map((page) => (
                  <div key={page.path} className="flex items-center gap-3">
                    <span className="w-24 truncate text-sm text-gray-700">
                      {page.label}
                    </span>
                    <div className="flex-1">
                      <div className="h-5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="flex h-full items-center rounded-full bg-gradient-to-r from-sky-400 to-sky-500 px-2 text-[0.6rem] font-bold text-white transition-all"
                          style={{
                            width: `${Math.max((page.views / maxPage) * 100, 8)}%`,
                          }}
                        >
                          {page.views}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 기존 데이터 카드 */}
      <h2 className="mb-4 text-lg font-bold text-gray-700">데이터 현황</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ key, label, href, icon: Icon, color }) => (
          <Link
            key={key}
            href={href}
            className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
          >
            <Icon className="mb-2 h-6 w-6 opacity-80" />
            <p className="text-3xl font-black">
              {loading ? "—" : (counts[key] ?? 0)}
            </p>
            <p className="mt-1 text-sm opacity-80">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
