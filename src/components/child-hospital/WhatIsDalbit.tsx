import { Moon } from "lucide-react";

export default function WhatIsDalbit() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-2 flex items-center gap-2">
        <Moon className="h-5 w-5 text-sky-600" />
        <h2 className="text-xl font-black text-sky-900 md:text-2xl">
          달빛어린이병원이란?
        </h2>
      </div>

      <div className="mt-4 space-y-4 text-base leading-relaxed text-sky-800">
        <p>
          평일 밤이나 주말에 아이가 갑자기 열이 나면, 부모는 응급실로 달려가야
          합니다. 하지만 대형 응급실은 늘 만원이고, 아이는 몇 시간씩 차에 실려
          병원을 전전해야 합니다.
        </p>
        <p>
          <strong className="text-sky-900">달빛어린이병원</strong>은 이 공백을
          메우기 위해 만들어진 제도입니다. 정부와 지자체가 운영비를 지원하면,
          동네 소아과가 평일 밤 12시까지, 휴일에도 진료를 봅니다. 2026년 현재
          전국에 121곳이 운영 중입니다.
        </p>
        <p>
          그런데{" "}
          <strong className="text-party-red">
            동대문구에는 한 곳도 없습니다.
          </strong>{" "}
          관련 조례는 있지만 참여하는 병원이 없기 때문입니다.
        </p>
      </div>
    </section>
  );
}
