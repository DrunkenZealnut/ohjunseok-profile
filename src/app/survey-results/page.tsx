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
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-sky-900 to-sky-800 p-6 text-white shadow-lg">
          <div className="mb-6">
            <span className="mb-3 inline-block rounded-full bg-amber-400/20 px-4 py-1 text-xs font-bold text-amber-300">
              교통안전 전문 분석
            </span>
            <h2 className="text-xl font-black">
              주민 의견 종합 분석 및 개선 권고
            </h2>
            <p className="mt-1 text-sm text-sky-300">
              수집된 {totalCount}건의 설문을 바탕으로 교통안전 전문가 관점에서 분석한 결과입니다.
            </p>
          </div>

          {/* 핵심 진단 */}
          <div className="mb-6 rounded-xl bg-white/10 p-5 backdrop-blur-sm">
            <h3 className="mb-3 text-base font-bold text-amber-300">핵심 진단</h3>
            <p className="text-sm leading-relaxed text-sky-100">
              이 일대는 <strong className="text-white">대규모 아파트단지 2개(래미안라그란데, 이문아이파크자이)가 입주</strong>하면서 보행량이 급증했으나,
              교차로 설계가 <strong className="text-white">과거 저밀도 시절 그대로</strong> 운영되고 있는 전형적인
              &ldquo;인구 급증에 신호체계가 따라가지 못한&rdquo; 사례입니다.
            </p>
          </div>

          {/* 주요 문제점 4가지 */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <Footprints className="h-5 w-5 text-red-400" />
                <h4 className="font-bold text-red-300">문제 1. 대각선 횡단보도 부재</h4>
              </div>
              <p className="text-xs leading-relaxed text-sky-200">
                동시신호(All-Walk)를 운영하면서 대각선 횡단보도가 없어, 주민들이 <strong className="text-white">법적 보호 없이 대각선으로 횡단</strong>하고 있습니다.
                전체 응답의 절반 이상이 이 문제를 지적했습니다.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-400" />
                <h4 className="font-bold text-orange-300">문제 2. 보행 신호 시간 부족</h4>
              </div>
              <p className="text-xs leading-relaxed text-sky-200">
                보행 신호가 너무 짧아 <strong className="text-white">영유아·어린이·고령자가 횡단을 완료하지 못하는</strong> 상황이 반복되고 있습니다.
                차량 중심의 신호 배분이 원인입니다.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <h4 className="font-bold text-yellow-300">문제 3. 비보호 좌회전 위험</h4>
              </div>
              <p className="text-xs leading-relaxed text-sky-200">
                대단지 입주로 좌회전 차량이 급증했으나 <strong className="text-white">비보호 좌회전</strong>이 유지되어
                직진 차량·보행자와 3자 상충이 발생하고 있습니다.
              </p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-violet-400" />
                <h4 className="font-bold text-violet-300">문제 4. 횡단보도 사각지대</h4>
              </div>
              <p className="text-xs leading-relaxed text-sky-200">
                사거리 4면 중 <strong className="text-white">1면에 횡단보도가 없는 3면 구조</strong>로,
                누락된 면이 주요 보행 동선과 겹쳐 구조적 무단횡단을 유발합니다.
              </p>
            </div>
          </div>

          {/* 개선 권고안 */}
          <div className="mb-4">
            <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
              단계별 개선 권고안
            </h3>

            {/* 1단계 */}
            <div className="mb-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-black text-white">1</span>
                <h4 className="font-bold text-red-300">긴급 조치 (1~3개월)</h4>
              </div>
              <ul className="space-y-1.5 text-xs leading-relaxed text-sky-200">
                <li className="flex gap-2">
                  <span className="mt-0.5 text-red-400">●</span>
                  <span><strong className="text-white">이문로34길 사거리 스크램블(대각선) 횡단보도 도입</strong> — 동시신호 운영 중이므로 노면표시 추가만으로 즉시 가능</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-red-400">●</span>
                  <span><strong className="text-white">이문로·천장산로 사거리 4면 횡단보도 완성</strong> — 빽다방 앞 횡단보도 신설 (U자→ㅁ자 또는 X자 전환)</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-red-400">●</span>
                  <span><strong className="text-white">보행 신호 시간 +15~20초 연장</strong> — 보행속도 0.8m/s 기준 재산정</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-red-400">●</span>
                  <span><strong className="text-white">이마트 주차장 출구 중앙선 분리봉·볼라드 설치</strong> — 중앙선 침범 좌회전 방지</span>
                </li>
              </ul>
            </div>

            {/* 2단계 */}
            <div className="mb-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-black text-white">2</span>
                <h4 className="font-bold text-amber-300">단기 시행 (3~6개월)</h4>
              </div>
              <ul className="space-y-1.5 text-xs leading-relaxed text-sky-200">
                <li className="flex gap-2">
                  <span className="mt-0.5 text-amber-400">●</span>
                  <span><strong className="text-white">비보호 좌회전 → 보호 좌회전 전환</strong> — 대단지 입주로 급증한 좌회전 차량 대응</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-amber-400">●</span>
                  <span><strong className="text-white">신호 주기 전면 재설계</strong> — 수천 세대 입주 반영 교통량 재조사, 보행자 중심 비율 조정</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-amber-400">●</span>
                  <span><strong className="text-white">신호등 잔여시간 표시기(타이머) 전 방면 설치</strong></span>
                </li>
              </ul>
            </div>

            {/* 3단계 */}
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">3</span>
                <h4 className="font-bold text-emerald-300">중기 시행 (6~12개월)</h4>
              </div>
              <ul className="space-y-1.5 text-xs leading-relaxed text-sky-200">
                <li className="flex gap-2">
                  <span className="mt-0.5 text-emerald-400">●</span>
                  <span><strong className="text-white">아이파크 1-2단지 사이 횡단시설 신설</strong> — 무단횡단 빈발 구간 해소</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-emerald-400">●</span>
                  <span><strong className="text-white">야간 보행 안전 조명 강화</strong> — LED 고조도 횡단보도 조명, 바닥 매립형 유도등</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-emerald-400">●</span>
                  <span><strong className="text-white">보행자 쉼터·그늘막·벤치 설치</strong> — 대기 시간이 긴 교차로 특성 반영</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 text-emerald-400">●</span>
                  <span><strong className="text-white">CCTV 설치</strong> — 이마트 앞 등 주요 상충 지점 불법행위 단속</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 총평 */}
          <div className="rounded-xl bg-amber-400/15 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-300" />
              <h4 className="text-sm font-bold text-amber-300">전문가 총평</h4>
            </div>
            <p className="text-xs leading-relaxed text-sky-100">
              가장 시급한 것은 <strong className="text-white">동시신호 교차로에 스크램블(대각선) 횡단보도를 추가</strong>하는 것입니다.
              노면표시 작업만으로 가능하므로 가장 빠르고 비용 효율적인 안전 개선책입니다.
              서울시는 이문동 일대를 <strong className="text-white">&lsquo;보행우선구역&rsquo; 또는 &lsquo;교통안전 특별관리구역&rsquo;으로 지정</strong>하여
              종합적인 교통 안전 진단을 실시할 것을 권고합니다.
            </p>
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
