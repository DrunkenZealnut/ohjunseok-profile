import { SUMMARY_STATS } from "@/data/crosswalk-police-response";

interface Props {
  stats: typeof SUMMARY_STATS;
}

export default function ActionHero({ stats }: Props) {
  return (
    <header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 pt-24 pb-20 text-center">
      <span className="mb-4 inline-block rounded-full bg-party-red px-5 py-1.5 text-sm font-bold text-white shadow-sm">
        주민 의견 → 동대문경찰서 전달 완료
      </span>
      <h1 className="mb-4 text-3xl font-black leading-tight text-sky-900 md:text-4xl">
        여러분의 <span className="text-party-red">{stats.totalResponses}건</span>이
        <br />
        경찰서로 전달됐습니다
      </h1>
      <p className="mx-auto mb-8 max-w-md text-sm text-sky-800/80 md:text-base">
        주민 설문 결과를 바탕으로 동대문경찰서를 직접 찾아 면담했습니다.
      </p>

      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
        <StatCard label="수집된 의견" value={stats.totalResponses} unit="건" />
        <StatCard label="핵심 이슈" value={stats.coreIssues} unit="대" />
        <StatCard label="경찰서 면담" value={stats.meetingCount} unit="회" />
      </div>
    </header>
  );
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-2xl bg-white/40 px-3 py-4 backdrop-blur-md ring-1 ring-white/50">
      <p className="text-xs font-medium text-sky-800/80">{label}</p>
      <p className="mt-1 text-2xl font-black text-sky-900">
        {value}
        <span className="ml-0.5 text-sm font-bold">{unit}</span>
      </p>
    </div>
  );
}
