"use client";

import { useEffect, useState } from "react";
import { adminGet } from "@/lib/admin-fetch";

const ISSUE_LABELS: Record<string, string> = {
  signal_system: "신호체계 문제",
  crosswalk_danger: "횡단보도 위험",
  signal_timer: "신호등 타이머",
  night_lighting: "야간 조명",
  bench_needed: "의자 필요",
  other: "기타",
};

const ISSUE_COLORS: Record<string, string> = {
  signal_system: "from-red-500 to-red-400",
  crosswalk_danger: "from-orange-500 to-orange-400",
  signal_timer: "from-amber-500 to-amber-400",
  night_lighting: "from-indigo-500 to-indigo-400",
  bench_needed: "from-emerald-500 to-emerald-400",
  other: "from-gray-500 to-gray-400",
};

const ISSUE_BG: Record<string, string> = {
  signal_system: "bg-red-100 text-red-700",
  crosswalk_danger: "bg-orange-100 text-orange-700",
  signal_timer: "bg-amber-100 text-amber-700",
  night_lighting: "bg-indigo-100 text-indigo-700",
  bench_needed: "bg-emerald-100 text-emerald-700",
  other: "bg-gray-100 text-gray-700",
};

interface Survey {
  id: string;
  location: string;
  issue_types: string[];
  detail: string | null;
  respondent_name: string | null;
  phone: string | null;
  created_at: string;
}

export default function SurveyResultsPage() {
  const [items, setItems] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const allItems: Survey[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const res = await adminGet(
          `table=survey_responses&page=${page}&limit=100`
        );
        allItems.push(...res.data);
        hasMore = allItems.length < res.count;
        page++;
      }

      setItems(allItems);
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-400">데이터 불러오는 중...</div>
      </div>
    );
  }

  // --- 통계 계산 ---
  const totalCount = items.length;

  // 위치별 통계
  const locationCounts: Record<string, number> = {};
  items.forEach((s) => {
    locationCounts[s.location] = (locationCounts[s.location] || 0) + 1;
  });
  const locationEntries = Object.entries(locationCounts).sort(
    (a, b) => b[1] - a[1]
  );
  const maxLocationCount = Math.max(...locationEntries.map(([, c]) => c), 1);

  // 불편유형별 통계
  const issueCounts: Record<string, number> = {};
  items.forEach((s) => {
    (s.issue_types || []).forEach((t) => {
      issueCounts[t] = (issueCounts[t] || 0) + 1;
    });
  });
  const issueEntries = Object.entries(issueCounts).sort(
    (a, b) => b[1] - a[1]
  );
  const maxIssueCount = Math.max(...issueEntries.map(([, c]) => c), 1);

  // 날짜별 추이
  const dateCounts: Record<string, number> = {};
  items.forEach((s) => {
    const d = new Date(s.created_at).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
    dateCounts[d] = (dateCounts[d] || 0) + 1;
  });
  const dateEntries = Object.entries(dateCounts);
  const maxDateCount = Math.max(...dateEntries.map(([, c]) => c), 1);

  // 위치별 불편유형 교차 분석
  const locationIssueMatrix: Record<string, Record<string, number>> = {};
  items.forEach((s) => {
    if (!locationIssueMatrix[s.location]) {
      locationIssueMatrix[s.location] = {};
    }
    (s.issue_types || []).forEach((t) => {
      locationIssueMatrix[s.location][t] =
        (locationIssueMatrix[s.location][t] || 0) + 1;
    });
  });

  // 필터링된 응답
  const filteredItems =
    filter === "all" ? items : items.filter((s) => s.location === filter);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        설문 응답 결과
      </h1>
      <p className="mb-8 text-sm text-gray-400">
        총 {totalCount}건의 응답이 수집되었습니다
      </p>

      {/* 요약 카드 */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-5 text-white shadow-lg shadow-sky-500/20">
          <p className="text-sm font-medium text-white/80">총 응답 수</p>
          <p className="mt-1 text-3xl font-black">{totalCount}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 p-5 text-white shadow-lg shadow-violet-500/20">
          <p className="text-sm font-medium text-white/80">조사 지역</p>
          <p className="mt-1 text-3xl font-black">{locationEntries.length}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white shadow-lg shadow-amber-500/20">
          <p className="text-sm font-medium text-white/80">
            가장 많은 불편 유형
          </p>
          <p className="mt-1 text-lg font-black">
            {issueEntries.length > 0
              ? ISSUE_LABELS[issueEntries[0][0]] || issueEntries[0][0]
              : "-"}
          </p>
        </div>
      </div>

      {/* 위치별 응답 분포 */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-gray-800">
          위치별 응답 분포
        </h2>
        <div className="space-y-4">
          {locationEntries.map(([loc, count]) => (
            <div key={loc}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{loc}</span>
                <span className="font-bold text-sky-600">
                  {count}건{" "}
                  <span className="font-normal text-gray-400">
                    ({((count / totalCount) * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="h-8 overflow-hidden rounded-lg bg-gray-100">
                <div
                  className="flex h-full items-center rounded-lg bg-gradient-to-r from-sky-500 to-sky-400 px-3 text-xs font-bold text-white transition-all duration-700"
                  style={{
                    width: `${(count / maxLocationCount) * 100}%`,
                    minWidth: "2rem",
                  }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 불편 유형별 통계 */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-gray-800">
          불편 유형별 통계
        </h2>
        <div className="space-y-4">
          {issueEntries.map(([type, count]) => (
            <div key={type}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {ISSUE_LABELS[type] || type}
                </span>
                <span className="font-bold text-gray-600">
                  {count}건{" "}
                  <span className="font-normal text-gray-400">
                    ({((count / totalCount) * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="h-8 overflow-hidden rounded-lg bg-gray-100">
                <div
                  className={`flex h-full items-center rounded-lg bg-gradient-to-r ${ISSUE_COLORS[type] || "from-gray-500 to-gray-400"} px-3 text-xs font-bold text-white transition-all duration-700`}
                  style={{
                    width: `${(count / maxIssueCount) * 100}%`,
                    minWidth: "2rem",
                  }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 일자별 응답 추이 */}
      {dateEntries.length > 1 && (
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-800">
            일자별 응답 추이
          </h2>
          <div className="flex items-end gap-1.5 overflow-x-auto pb-2" style={{ minHeight: "180px" }}>
            {dateEntries.map(([date, count]) => (
              <div
                key={date}
                className="group flex flex-1 flex-col items-center gap-1"
                style={{ minWidth: "40px" }}
              >
                <span className="text-xs font-bold text-gray-600 opacity-0 transition group-hover:opacity-100">
                  {count}
                </span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-sky-500 to-sky-400 transition-all duration-300 group-hover:from-sky-600 group-hover:to-sky-500"
                  style={{
                    height: `${(count / maxDateCount) * 140}px`,
                    minHeight: "8px",
                  }}
                />
                <span className="mt-1 text-[10px] text-gray-400 whitespace-nowrap">
                  {date}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 위치별 불편 유형 교차 분석 */}
      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-gray-800">
          위치별 불편 유형 교차 분석
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-3 py-2 text-left font-bold text-gray-700">
                  위치
                </th>
                {Object.keys(ISSUE_LABELS).map((key) => (
                  <th
                    key={key}
                    className="px-3 py-2 text-center font-medium text-gray-500"
                  >
                    {ISSUE_LABELS[key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {locationEntries.map(([loc]) => (
                <tr key={loc} className="border-b border-gray-100">
                  <td className="px-3 py-3 font-medium text-gray-700 whitespace-nowrap">
                    {loc}
                  </td>
                  {Object.keys(ISSUE_LABELS).map((key) => {
                    const val = locationIssueMatrix[loc]?.[key] || 0;
                    return (
                      <td key={key} className="px-3 py-3 text-center">
                        {val > 0 ? (
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${ISSUE_BG[key] || "bg-gray-100 text-gray-600"}`}
                          >
                            {val}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 전체 응답 목록 */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-gray-800">
            전체 응답 목록{" "}
            <span className="text-base font-normal text-gray-400">
              ({filteredItems.length}건)
            </span>
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                filter === "all"
                  ? "bg-sky-500 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              전체
            </button>
            {locationEntries.map(([loc]) => (
              <button
                key={loc}
                onClick={() => setFilter(loc)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  filter === loc
                    ? "bg-sky-500 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredItems.map((s, i) => (
            <div
              key={s.id}
              className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition hover:border-sky-200 hover:bg-sky-50/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">
                      {filteredItems.length - i}
                    </span>
                    <span className="font-bold text-gray-800">
                      {s.location}
                    </span>
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {(s.issue_types || []).map((t: string) => (
                      <span
                        key={t}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ISSUE_BG[t] || "bg-gray-100 text-gray-600"}`}
                      >
                        {ISSUE_LABELS[t] || t}
                      </span>
                    ))}
                  </div>
                  {s.detail && (
                    <p className="mb-2 rounded-lg bg-white p-3 text-sm leading-relaxed text-gray-600">
                      {s.detail}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">
                    {s.respondent_name || "익명"}{" "}
                    {s.phone && `· ${s.phone}`} ·{" "}
                    {new Date(s.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p className="py-12 text-center text-gray-400">
            해당 조건의 응답이 없습니다
          </p>
        )}
      </div>
    </div>
  );
}
