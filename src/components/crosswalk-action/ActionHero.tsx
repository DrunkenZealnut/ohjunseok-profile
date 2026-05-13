import { SUMMARY_STATS } from "@/data/crosswalk-police-response";

interface Props {
  totalResponses?: number;
}

export default function ActionHero({
  totalResponses = SUMMARY_STATS.totalResponses,
}: Props) {
  return (
    <header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 pt-24 pb-20 text-center">
      <span className="mb-4 inline-block rounded-full bg-party-red px-5 py-1.5 text-sm font-bold text-white shadow-sm">
        주민 의견 → 동대문경찰서 전달 완료
      </span>
      <h1 className="mb-4 text-3xl font-black leading-tight text-sky-900 md:text-4xl">
        여러분의 <span className="text-party-red">{totalResponses}건</span>이
        <br />
        경찰서로 전달됐습니다
      </h1>
      <p className="mx-auto max-w-md text-sm text-sky-800/80 md:text-base">
        주민 설문 결과를 바탕으로 동대문경찰서를 직접 찾아 면담했습니다.
      </p>
    </header>
  );
}
