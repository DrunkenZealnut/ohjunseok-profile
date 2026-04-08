"use client";

import { useEffect, useState } from "react";
import { BarChart3, MapPin, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

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
  created_at: string;
}

export default function SurveyResultsPage() {
  const [items, setItems] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showAllResponses, setShowAllResponses] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        const res = await fetch("/api/survey-results");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        setItems(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
          <p className="text-sky-600">조사 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 px-5">
        <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h2 className="mb-2 text-xl font-bold text-gray-800">데이터를 불러올 수 없습니다</h2>
          <p className="mb-6 text-sm text-gray-500">잠시 후 다시 시도해주세요.</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-sky-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-sky-600"
          >
            다시 시도
          </button>
        </div>
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
  const displayedItems = showAllResponses
    ? filteredItems
    : filteredItems.slice(0, 10);

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 pt-24 pb-16 text-center">
        <span className="mb-4 inline-block rounded-full bg-party-red px-5 py-1.5 text-sm font-bold text-white">
          주민 의견 조사 결과
        </span>
        <h1 className="mb-3 text-3xl font-black text-sky-900 md:text-4xl">
          신호등·횡단보도 개선
        </h1>
        <p className="text-sm text-sky-700 md:text-base">
          주민 여러분의 소중한 의견을 모아 정리했습니다
        </p>
      </header>

      <div className="mx-auto -mt-8 max-w-3xl px-5">
        {/* 요약 카드 */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 p-5 text-white shadow-lg shadow-sky-500/20">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-white/80">
              <BarChart3 className="h-4 w-4" />
              총 응답 수
            </div>
            <p className="text-3xl font-black">{totalCount}<span className="text-lg font-bold">건</span></p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 p-5 text-white shadow-lg shadow-violet-500/20">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-white/80">
              <MapPin className="h-4 w-4" />
              조사 지역
            </div>
            <p className="text-3xl font-black">{locationEntries.length}<span className="text-lg font-bold">곳</span></p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white shadow-lg shadow-amber-500/20">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-white/80">
              <AlertTriangle className="h-4 w-4" />
              가장 많은 불편
            </div>
            <p className="text-lg font-black leading-tight mt-1">
              {issueEntries.length > 0
                ? ISSUE_LABELS[issueEntries[0][0]] || issueEntries[0][0]
                : "-"}
            </p>
          </div>
        </div>

        {/* 위치별 응답 분포 */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-sky-900">
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
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-sky-900">
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
          <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-sky-900">
              일자별 응답 추이
            </h2>
            <div
              className="flex items-end gap-1.5 overflow-x-auto pb-2"
              style={{ minHeight: "180px" }}
            >
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
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-sky-900">
            위치별 불편 유형 교차 분석
          </h2>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left font-bold text-gray-700">
                    위치
                  </th>
                  {Object.keys(ISSUE_LABELS).map((key) => (
                    <th
                      key={key}
                      className="px-2 py-2 text-center text-xs font-medium text-gray-500"
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
                        <td key={key} className="px-2 py-3 text-center">
                          {val > 0 ? (
                            <span
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${ISSUE_BG[key] || "bg-gray-100 text-gray-600"}`}
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

        {/* 주민 의견 목록 */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-sky-900">
              주민 의견 목록{" "}
              <span className="text-base font-normal text-gray-400">
                ({filteredItems.length}건)
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
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
            {displayedItems.map((s, i) => (
              <div
                key={s.id}
                className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-600">
                    {filter === "all"
                      ? items.indexOf(s) + 1
                      : filteredItems.indexOf(s) + 1}
                  </span>
                  <span className="font-bold text-gray-800">{s.location}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(s.created_at).toLocaleDateString("ko-KR", {
                      month: "long",
                      day: "numeric",
                    })}
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
              </div>
            ))}
          </div>

          {filteredItems.length > 10 && (
            <button
              onClick={() => setShowAllResponses(!showAllResponses)}
              className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-sky-200 py-3 text-sm font-medium text-sky-600 transition hover:bg-sky-50"
            >
              {showAllResponses ? (
                <>
                  접기 <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  전체 {filteredItems.length}건 보기 <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          {filteredItems.length === 0 && (
            <p className="py-12 text-center text-gray-400">
              해당 조건의 응답이 없습니다
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 p-8 text-center">
          <h3 className="mb-2 text-lg font-bold text-sky-900">
            아직 의견을 제출하지 않으셨나요?
          </h3>
          <p className="mb-5 text-sm text-sky-700">
            여러분의 의견이 모여 안전한 횡단보도를 만듭니다
          </p>
          <Link
            href="/crosswalk-survey"
            className="inline-block rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-3 font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5"
          >
            설문 참여하기
          </Link>
        </div>
      </div>
    </div>
  );
}
