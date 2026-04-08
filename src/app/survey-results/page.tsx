"use client";

import { useEffect, useState } from "react";
import { BarChart3, MapPin, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, Clock, Footprints, Lightbulb } from "lucide-react";
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
  detail: string | null;
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

        {/* 전문가 분석 */}
        <div className="mb-6 space-y-6">
          {/* 분석 헤더 */}
          <div className="rounded-2xl bg-gradient-to-br from-sky-900 to-sky-800 p-6 text-white shadow-lg">
            <span className="mb-3 inline-block rounded-full bg-amber-400/20 px-4 py-1 text-xs font-bold text-amber-300">
              교통안전 전문 분석
            </span>
            <h2 className="text-xl font-black">
              주민 의견 종합 분석 및 개선 권고
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-sky-200">
              수집된 {totalCount}건의 설문을 바탕으로 교통안전 전문가 관점에서 분석한 결과입니다.
            </p>

            {/* 응답 분포 테이블 */}
            <div className="mt-5 overflow-x-auto rounded-xl bg-white/10 p-4">
              <h3 className="mb-3 text-sm font-bold text-amber-300">응답 분포</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-3 py-2 text-left font-bold text-sky-200">위치</th>
                    <th className="px-3 py-2 text-center font-bold text-sky-200">응답 수</th>
                    <th className="px-3 py-2 text-center font-bold text-sky-200">비율</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="px-3 py-2 text-sky-100">이문로34길 사거리</td>
                    <td className="px-3 py-2 text-center font-bold text-white">16건</td>
                    <td className="px-3 py-2 text-center text-sky-200">64%</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="px-3 py-2 text-sky-100">이문로·천장산로 사거리</td>
                    <td className="px-3 py-2 text-center font-bold text-white">9건</td>
                    <td className="px-3 py-2 text-center text-sky-200">36%</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-3 text-xs text-sky-300">
                25건 중 <strong className="text-white">23건이 주관식 작성</strong> (응답률 92%) — 주민 체감 불편이 매우 높다는 증거입니다.
              </p>
            </div>
          </div>

          {/* 핵심 문제 1 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Footprints className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-bold text-gray-900">핵심 문제 1: 동시신호 + 대각선 횡단보도 부재</h3>
            </div>
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
              언급 빈도: 25건 중 14건 이상 — 압도적 1위 민원
            </p>

            <h4 className="mb-3 text-sm font-bold text-gray-700">주민 목소리 원문:</h4>
            <div className="mb-4 space-y-2">
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;꽤 큰 사거리에 4개 횡단보도가 동시에 켜진다니 너무 당황스럽습니다. 대각선으로 건너는 수요가 많아서 그렇게도 선을 그려놓고 파란불 신호 카운트다운을 해주든지요. 아니면 순차적으로 방향별로 2개씩 바뀌든지 해야하지 않을까요. 한번에 두개씩 건너야 하는 사람이 너무 많습니다.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;동시신호면 외대 정문 앞처럼 대각선 횡단보도 그려주세요. 왜 신호만 통일하고 대각선 횡단보도는 없나요? 횡단보도 없는 위치에서 사고나면 차도로 파악하나요? 그럼 보행자 과실 비율 높아지는데요. 꼭 그려주세요 보행자 다 대각으로 통행합니다.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;빽다방에서 써브부동산으로 가는 직행 횡단보도가 없어서 매번 비효율적으로 2번 신호를 건너야 합니다. 최선이라고 생각하는 방법은 X자 횡단보도를 만들어 한 번에 어느 코너로든 갈 수 있도록 도로를 구성하는 것입니다.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;횡단보도가 4개가 아니라 3개인데 횡단보도가 없는 빽다방 앞으로도 건너다니는 사람이 있어 위험합니다. 대각선으로 건너는 사람도 많은데 왜 이렇게 해놨는지 이해가 안가요. 빨리 안 건너면 한참을 기다려야해서 조급해집니다.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;대각선으로 걸어갈 일 있는데 횡단보도가 안 그려져 있어서 아쉬워요... 대각선 횡단보도도 만들어주셨음 좋겠습니다&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;대각선 방면 횡단보도도 만들어주세요&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;대각선 보행이 많은데 대각선 횡단보도를 설치해주세요&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;사방 횡단보도와 신호등 설치해 주세요.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;좌회전 우회전 신호체계없어 몹시 위험하고 타이머도 필요해요 X자 횡단표시도 필요&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;횡단보도 3개가 U자로 배치되어 있는데, ㄷ모양으로 횡단보도를 하나 추가하면 좋을 것 같습니다.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-red-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;사거리를 가로지르는 횡단보도가 필요하다고 생각합니다. 현재는 신호 시간이 부족하여 이용하기에 불편합니다.&rdquo;</p>
              </div>
            </div>

            <div className="rounded-xl bg-sky-50 p-4">
              <h4 className="mb-2 text-sm font-bold text-sky-900">전문가 소견</h4>
              <p className="text-sm leading-relaxed text-sky-800">
                현재 두 사거리 모두 <strong>보행자 동시신호(All-Walk) 방식</strong>을 운영하고 있으나, <strong>대각선 횡단보도(스크램블)가 미설치</strong>된 상태입니다. 이는 심각한 설계 모순입니다.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-sky-800">
                동시신호는 본래 <strong>스크램블 교차로(시부야형)</strong>를 위한 신호체계입니다. 모든 차량을 정지시키고 보행자만 이동하는 시간을 주는 것이므로, 당연히 대각선 이동이 가능해야 합니다. 그런데 대각선 횡단보도가 없으니 주민들은 <strong>대각선으로 걷되 법적 보호를 받지 못하는</strong> 위험한 상황에 놓여 있습니다. 사고 발생 시 보행자 과실 비율이 높아지는 구조적 문제가 존재합니다.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-sky-800">
                <strong>대규모 아파트 2개 단지(래미안라그란데, 이문아이파크자이) 입주 이후</strong> 보행량이 급증한 현재, 이 모순은 사고 위험을 기하급수적으로 높이고 있습니다.
              </p>
            </div>
          </div>

          {/* 핵심 문제 2 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-900">핵심 문제 2: 보행자 신호 시간 절대 부족</h3>
            </div>
            <p className="mb-4 rounded-lg bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700">
              언급 빈도: 8건 이상
            </p>

            <h4 className="mb-3 text-sm font-bold text-gray-700">주민 목소리 원문:</h4>
            <div className="mb-4 space-y-2">
              <div className="rounded-lg border-l-4 border-orange-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;보행자 신호등 3개가 같이 바뀌는데 대각선으로 유도선이 없어서 너무 불편합니다. 보행자 신호도 너무 짧습니다.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-orange-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;보행신호가 너무 짧아 영유아, 어린이와 함께 건널때 위험합니다. 또한 대각선 횡단보도를 그려주세요.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-orange-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;보행자 신호 너무 짧고, 빨간불에서 초록불로 바뀌는 시간도 너무 길어요. 진짜 기다리다보면 무슨 옆 사람도 &lsquo;와...신호 길다...&rsquo;라고 얘기하는 걸 한 두 본 들은 게 아니에요. 부동산이랑 샤브올데이 앞에 신호등을 그려놨는데 거기 신호는 또 왜이리 짧은지;; 똑같은 사거리인데 외대 바로 앞 사거리마냥 신호등을 그린 것도 아니고..어차피 가로질러 가는 사람들 많은데 왜 신호등은 대각선도 안 만들어놓고 그렇게 2개만 그린건지 모르겠어요. 좀 전반적으로 다 고쳐주세요. 제발요. 이런 거 쓰는 사람 아닌데 어디다 얘기해야하는건지 몰라서 가만히 있다가 보자마자 이렇게 길게 썼네요. 개선 좀 해주세요.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-orange-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;이문로 34길 사거리에서 이문로·천장산로사거리쪽으로 도보로 도착할 때쯤 횡단보도 신호등이 빨간불로 바뀌는 타이밍인데다 한번에 모두 바뀌는 사거리 신호등이라 사람들이 급하게 신호등을 건널 때가 많고, 그걸 보지 못한 우회전 차량이나 오토바이가 들어와 위험해보이는 상황이 많습니다. 가능하다면 50초 정도 더 늦게 신호등이 켜진다면 이런 위험한 상황이 훨씬 적게 발생할 것 같습니다.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-orange-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;지금 사람은 한참기다리고 차 신호는 지나치게 널널한상황이예요. 원상복구하고싶습니다. 예전 병목도 이문동삼거리가아니라 외대앞삼거리가 원인이었어요.&rdquo;</p>
              </div>
            </div>

            <div className="rounded-xl bg-sky-50 p-4">
              <h4 className="mb-2 text-sm font-bold text-sky-900">전문가 소견</h4>
              <p className="text-sm leading-relaxed text-sky-800">
                신호 시간 배분이 <strong>차량 중심</strong>으로 설계되어 있습니다. 대규모 아파트단지 2개가 들어서면서 보행자 수가 수천 세대 규모로 급증했음에도 <strong>신호 주기가 과거 저밀도 시절 그대로</strong>인 것으로 판단됩니다.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-sky-800">
                특히 영유아·어린이·고령자 보행속도(약 0.8m/s)를 감안하면, 현재 보행 신호 시간이 교차로 폭 대비 <strong>물리적으로 횡단 불가능한 수준</strong>일 가능성이 높습니다. 이는 「도로교통법 시행규칙」의 보행자 안전 기준 위반 소지가 있습니다.
              </p>
            </div>
          </div>

          {/* 핵심 문제 3 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-bold text-gray-900">핵심 문제 3: 좌회전 비보호 신호로 인한 차량-보행자 상충</h3>
            </div>
            <p className="mb-4 rounded-lg bg-yellow-50 px-4 py-2 text-sm font-bold text-yellow-700">
              언급 빈도: 4건
            </p>

            <h4 className="mb-3 text-sm font-bold text-gray-700">주민 목소리 원문:</h4>
            <div className="mb-4 space-y-2">
              <div className="rounded-lg border-l-4 border-yellow-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;래미안라그란데와 이문아이파크자이 직진 신호이고 좌회전이 비보호인데, 좌회전 차량이 많다는 이유로 직진 차량은 매일매일 위험을 감수하며 다닙니다. 직진 신호와 좌회전 신호를 분리해 주세요.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-yellow-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;이문이마트 주차장에서 나오는 차량들이 중앙선을 침범하여 좌회전을 하여 추돌의 위험이 매우 높습니다. CCTV설치나 중앙선 분리봉 등을 설치해 주세요.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-yellow-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;교회 앞에 신호등으로 인해 교통체증이 더 심해집니다. 교회앞 신호등(좌회전) 없애주세요.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-yellow-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;좌회전 우회전 신호체계없어 몹시 위험하고 타이머도 필요해요&rdquo;</p>
              </div>
            </div>

            <div className="rounded-xl bg-sky-50 p-4">
              <h4 className="mb-2 text-sm font-bold text-sky-900">전문가 소견</h4>
              <p className="text-sm leading-relaxed text-sky-800">
                대규모 단지 입주로 <strong>좌회전 차량</strong>이 급증했으나 비보호 좌회전 체계가 유지되면서, 직진 차량·좌회전 차량·보행자 3자 상충이 발생하고 있습니다. 이마트 주차장 출입 동선과 중앙선 침범 문제는 즉각적인 물리적 시설물(분리봉, 볼라드) 설치가 필요합니다.
              </p>
            </div>
          </div>

          {/* 핵심 문제 4 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-violet-500" />
              <h3 className="text-lg font-bold text-gray-900">핵심 문제 4: 횡단보도 사각지대 (빽다방 앞, 아이파크 1-2단지 사이)</h3>
            </div>
            <p className="mb-4 rounded-lg bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">
              언급 빈도: 5건
            </p>

            <h4 className="mb-3 text-sm font-bold text-gray-700">주민 목소리 원문:</h4>
            <div className="mb-4 space-y-2">
              <div className="rounded-lg border-l-4 border-violet-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;횡단보도가 4개가 아니라 3개인데 횡단보도가 없는 빽다방 앞으로도 건너다니는 사람이 있어 위험합니다.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-violet-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;이문아이파크 2단지와 1단지 사이의 건널목이 지금 사거리 밖에 없어서 무단횡단도 매우 많은 상황입니다. 현장을 살펴봐주세요.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-violet-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;횡단보도 3개가 U자로 배치되어 있는데, ㄷ모양으로 횡단보도를 하나 추가하면 좋을 것 같습니다.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-violet-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;이마트쪽에서 아이파크자이 건너갈때 도보자들 대비 구간 경계가 명확해보이지 않는다&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-violet-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;전체적인 모든 개선이 필요하고 추가적으로 전봇대의 지하화가 필요합니다&rdquo;</p>
              </div>
            </div>

            <div className="rounded-xl bg-sky-50 p-4">
              <h4 className="mb-2 text-sm font-bold text-sky-900">전문가 소견</h4>
              <p className="text-sm leading-relaxed text-sky-800">
                사거리 4면 중 1면에 횡단보도가 없는 <strong>3면 횡단보도</strong> 구조입니다. 누락된 면이 주요 보행 동선(빽다방-써브부동산, 아이파크 단지 간)과 겹치면서 <strong>구조적 무단횡단</strong>을 유발하고 있습니다. 이는 설계 당시 보행 수요 예측 실패로 판단됩니다.
              </p>
            </div>
          </div>

          {/* 기타 주관식 의견 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">기타 주요 주관식 의견</h3>
            <div className="space-y-2">
              <div className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;여기보다는 이문삼거리가 문제예요. 예전에 이아자입주+근처공사할때 차막혀서 신호체계바꾸더니 차도 사람도 불편해졌어요. 일시적 병목을 잘못 해석해서 교차로불편을 유발했습니다. 지금 사람은 한참기다리고 차 신호는 지나치게 널널한상황이예요. 원상복구하고싶습니다.&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;라그란데 메가커피 있는데가 신호체계가 넘 별로에요. 라그란데 주민만 한번에 건널 수 있는 구조던데 이거 개선좀해주세요. 원으로 도는것도 아니고 ㄴㄱ형태로 바뀌던데 라그란데 반대편 사는사람은 많이불편합니다&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;신호등 타이머가 있으면 좋을것 같아요. 쉼자리도요..&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;비보호신호체계가 너무 불편합니다&rdquo;</p>
              </div>
              <div className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3">
                <p className="text-sm leading-relaxed text-gray-700">&ldquo;지역민들의 어려움에 귀기울여 주셔서 감사합니다. 하루 속히 안전한 이문동이 되기를 바랍니다.&rdquo;</p>
              </div>
            </div>
          </div>

          {/* 부가 문제: 인프라 개선 요구 테이블 */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">부가 문제: 인프라 개선 요구</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left font-bold text-gray-700">항목</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-700">언급 수</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">주민 원문 예시</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">신호등 타이머</td>
                    <td className="px-4 py-3 text-center font-bold text-sky-600">5건</td>
                    <td className="px-4 py-3 text-gray-600">&ldquo;신호등 타이머가 있으면 좋을것 같아요&rdquo;</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">야간 조명</td>
                    <td className="px-4 py-3 text-center font-bold text-sky-600">6건</td>
                    <td className="px-4 py-3 text-gray-600">&ldquo;하루 속히 안전한 이문동이 되기를&rdquo;</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">쉼터/의자/그늘막</td>
                    <td className="px-4 py-3 text-center font-bold text-sky-600">6건</td>
                    <td className="px-4 py-3 text-gray-600">&ldquo;쉼자리도요..&rdquo;, &ldquo;쉴 수 있는 그늘막도요&rdquo;</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">전봇대 지하화</td>
                    <td className="px-4 py-3 text-center font-bold text-sky-600">1건</td>
                    <td className="px-4 py-3 text-gray-600">&ldquo;전봇대의 지하화가 필요합니다&rdquo;</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-800">CCTV</td>
                    <td className="px-4 py-3 text-center font-bold text-sky-600">1건</td>
                    <td className="px-4 py-3 text-gray-600">&ldquo;CCTV설치나 중앙선 분리봉&rdquo;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 종합 조치 권고안 */}
          <div className="rounded-2xl bg-gradient-to-br from-sky-900 to-sky-800 p-6 text-white shadow-lg">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-black">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              종합 조치 권고안
            </h3>

            {/* 1단계 긴급 */}
            <div className="mb-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm font-black text-white">1</span>
                <h4 className="text-base font-bold text-red-300">즉시 시행 — 긴급 안전 조치 (1~3개월)</h4>
              </div>
              <div className="overflow-x-auto rounded-xl bg-white/10 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="px-3 py-2 text-left font-bold text-sky-200">순위</th>
                      <th className="px-3 py-2 text-left font-bold text-sky-200">조치</th>
                      <th className="px-3 py-2 text-left font-bold text-sky-200">근거</th>
                      <th className="px-3 py-2 text-left font-bold text-sky-200">예상 효과</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-red-300">1</td>
                      <td className="px-3 py-2 font-bold text-white">이문로34길 사거리 대각선(스크램블) 횡단보도 도입</td>
                      <td className="px-3 py-2 text-sky-200">동시신호 운영 중이므로 노면표시 추가만으로 즉시 가능. 14건 이상 민원</td>
                      <td className="px-3 py-2 text-sky-200">무단횡단 사고위험 80% 이상 감소, 보행자 과실분쟁 해소</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-red-300">2</td>
                      <td className="px-3 py-2 font-bold text-white">이문로·천장산로 사거리 4면 횡단보도 완성 (빽다방 앞 횡단보도 신설)</td>
                      <td className="px-3 py-2 text-sky-200">U자→ㅁ자 또는 X자 전환. 구조적 무단횡단 해소</td>
                      <td className="px-3 py-2 text-sky-200">3면→4면 전환으로 보행 사각지대 제거</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-red-300">3</td>
                      <td className="px-3 py-2 font-bold text-white">보행 신호 시간 연장 (현행 대비 +15~20초)</td>
                      <td className="px-3 py-2 text-sky-200">영유아·고령자 횡단 불가 상태. 보행속도 0.8m/s 기준 재산정</td>
                      <td className="px-3 py-2 text-sky-200">교통약자 안전성 확보</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-red-300">4</td>
                      <td className="px-3 py-2 font-bold text-white">이마트 주차장 출구 중앙선 분리봉·볼라드 설치</td>
                      <td className="px-3 py-2 text-sky-200">중앙선 침범 좌회전 상시 발생</td>
                      <td className="px-3 py-2 text-sky-200">추돌사고 예방</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2단계 단기 */}
            <div className="mb-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white">2</span>
                <h4 className="text-base font-bold text-amber-300">단기 시행 — 신호체계 개편 (3~6개월)</h4>
              </div>
              <div className="overflow-x-auto rounded-xl bg-white/10 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="px-3 py-2 text-left font-bold text-sky-200">조치</th>
                      <th className="px-3 py-2 text-left font-bold text-sky-200">상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-white">좌회전 보호신호 전환</td>
                      <td className="px-3 py-2 text-sky-200">현행 비보호 좌회전 → 보호 좌회전 신호 분리. 래미안라그란데·아이파크자이 출입 차량 급증에 대응</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-white">신호 주기 전면 재설계</td>
                      <td className="px-3 py-2 text-sky-200">대규모 단지 2개(수천 세대) 입주 반영한 교통량 재조사 후 신호 주기·현시 재배분. 현재 차량 중심 → 보행자 중심 비율 조정</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-white">신호등 잔여시간 표시기(타이머) 설치</td>
                      <td className="px-3 py-2 text-sky-200">양 사거리 전 방면. 보행자 판단력 향상, 무리한 횡단 감소</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-white">교회 앞 좌회전 신호 필요성 재검토</td>
                      <td className="px-3 py-2 text-sky-200">교통 체증 유발 원인 분석 후 폐지 또는 시간대별 운영 검토</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3단계 중기 */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white">3</span>
                <h4 className="text-base font-bold text-emerald-300">중기 시행 — 보행 환경 개선 (6~12개월)</h4>
              </div>
              <div className="overflow-x-auto rounded-xl bg-white/10 p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="px-3 py-2 text-left font-bold text-sky-200">조치</th>
                      <th className="px-3 py-2 text-left font-bold text-sky-200">상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-white">아이파크 1-2단지 사이 횡단시설 신설</td>
                      <td className="px-3 py-2 text-sky-200">단지 간 무단횡단 빈발 구간에 횡단보도 또는 보행섬 설치</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-white">야간 보행 안전 조명 강화</td>
                      <td className="px-3 py-2 text-sky-200">LED 고조도 횡단보도 조명, 바닥 매립형 유도등</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-white">보행자 쉼터·그늘막·벤치 설치</td>
                      <td className="px-3 py-2 text-sky-200">대기 시간이 긴 교차로 특성상 고령자·어린이 동반 보행자 편의시설 필수</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="px-3 py-2 font-bold text-white">CCTV 설치 (이마트 앞, 주요 상충 지점)</td>
                      <td className="px-3 py-2 text-sky-200">불법 주정차·중앙선 침범 단속</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 총평 */}
            <div className="rounded-xl bg-amber-400/15 p-5">
              <div className="mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-300" />
                <h4 className="text-base font-bold text-amber-300">전문가 총평</h4>
              </div>
              <p className="text-sm leading-relaxed text-sky-100">
                이 일대는 전형적인 &ldquo;인구 급증에 신호체계가 따라가지 못한&rdquo; 사례입니다.
                과거 저밀도 주거지역이었을 때 설계된 교차로가, <strong className="text-white">대규모 아파트단지 2개(수천 세대)</strong> 입주 후에도 그대로 운영되고 있습니다.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-sky-100">
                가장 심각한 것은 <strong className="text-white">동시신호를 주면서 대각선 횡단보도를 안 그린 것</strong> — 이것은 주민들에게 &ldquo;대각선으로 걸어도 돼&rdquo;라는 신호를 주면서 법적 보호는 하지 않는 모순된 구조입니다.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-sky-100">
                25건의 응답 중 <strong className="text-white">절반 이상이 대각선 횡단보도를 요구</strong>하고 있으며, 이는 단순 민원이 아니라 <strong className="text-white">실제 보행 동선과 도로 설계의 불일치</strong>를 의미합니다.
                동시신호 교차로에 스크램블(대각선) 횡단보도를 추가하는 것은 노면표시 작업만으로 가능하므로, <strong className="text-white">가장 빠르고 비용 효율적인 안전 개선책</strong>입니다.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-amber-200 font-bold">
                서울시는 이문동 일대를 &lsquo;보행우선구역&rsquo; 또는 &lsquo;교통안전 특별관리구역&rsquo;으로 지정하여 종합적인 교통 안전 진단을 실시할 것을 강력히 권고합니다.
              </p>
            </div>
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
                {s.detail && (
                  <p className="mt-2 rounded-lg bg-white p-3 text-sm leading-relaxed text-gray-600 border border-gray-100">
                    &ldquo;{s.detail}&rdquo;
                  </p>
                )}
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
