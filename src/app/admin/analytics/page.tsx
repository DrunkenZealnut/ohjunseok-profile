"use client";

import { useEffect, useState } from "react";
import { adminHeaders } from "@/lib/admin-fetch";
import { BarChart3, Eye, TrendingUp, Calendar } from "lucide-react";

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
  days: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`, { headers: adminHeaders() })
      .then((res) => {
        if (res.status === 401) {
          sessionStorage.removeItem("admin_token");
          window.location.href = "/admin/login";
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then(setData)
      .finally(() => setLoading(false));
  }, [days]);

  const maxDaily = data
    ? Math.max(...data.dailyStats.map((d) => d.views), 1)
    : 1;
  const maxPage = data
    ? Math.max(...data.pageStats.map((p) => p.views), 1)
    : 1;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">방문자 통계</h1>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                days === d
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {d}일
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">불러오는 중...</div>
      ) : !data ? (
        <div className="py-20 text-center text-gray-400">
          데이터를 불러올 수 없습니다.
        </div>
      ) : (
        <>
          {/* 요약 카드 */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-5 text-white shadow-sm">
              <Eye className="mb-2 h-6 w-6 opacity-80" />
              <p className="text-3xl font-black">{data.totalViews.toLocaleString()}</p>
              <p className="mt-1 text-sm opacity-80">최근 {days}일 총 방문</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-sm">
              <TrendingUp className="mb-2 h-6 w-6 opacity-80" />
              <p className="text-3xl font-black">{data.todayViews.toLocaleString()}</p>
              <p className="mt-1 text-sm opacity-80">오늘 방문</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 p-5 text-white shadow-sm">
              <BarChart3 className="mb-2 h-6 w-6 opacity-80" />
              <p className="text-3xl font-black">{data.pageStats.length}</p>
              <p className="mt-1 text-sm opacity-80">방문된 페이지 수</p>
            </div>
          </div>

          {/* 일별 추이 차트 */}
          <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <Calendar className="h-5 w-5 text-sky-500" />
              일별 방문 추이
            </h2>
            {data.dailyStats.length === 0 ? (
              <p className="py-8 text-center text-gray-400">
                데이터가 없습니다.
              </p>
            ) : (
              <div className="flex items-end gap-1.5 overflow-x-auto pb-2" style={{ minHeight: 180 }}>
                {data.dailyStats.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1" style={{ minWidth: 36 }}>
                    <span className="text-xs font-bold text-gray-700">
                      {d.views}
                    </span>
                    <div
                      className="w-full min-w-[24px] rounded-t-md bg-gradient-to-t from-sky-500 to-sky-400 transition-all"
                      style={{
                        height: `${Math.max((d.views / maxDaily) * 140, 4)}px`,
                      }}
                    />
                    <span className="text-[0.6rem] text-gray-400">
                      {d.date.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 페이지별 방문 순위 */}
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              페이지별 방문 순위
            </h2>
            <div className="space-y-3">
              {data.pageStats.map((page, i) => (
                <div key={page.path} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {page.label}
                      </span>
                      <span className="text-sm font-bold text-sky-600">
                        {page.views.toLocaleString()}회
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all"
                        style={{
                          width: `${(page.views / maxPage) * 100}%`,
                        }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">{page.path}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
