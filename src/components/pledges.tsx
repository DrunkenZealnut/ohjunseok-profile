const pledges = [
  {
    title: "주민 소통 강화",
    desc: "정기적인 주민 간담회와 열린 의정 활동으로 주민의 목소리를 구정에 반영하겠습니다.",
  },
  {
    title: "생활 안전 환경 개선",
    desc: "골목길 안전 조명 확충, CCTV 사각지대 해소 등 안전한 마을 만들기에 앞장서겠습니다.",
  },
  {
    title: "주거 환경 개선",
    desc: "노후 주택 정비 지원과 쾌적한 주거환경 조성으로 살고 싶은 이문동을 만들겠습니다.",
  },
  {
    title: "복지 사각지대 해소",
    desc: "어르신, 장애인, 아동 등 사회적 약자를 위한 촘촘한 복지 안전망을 구축하겠습니다.",
  },
  {
    title: "지역 경제 활성화",
    desc: "소상공인 지원 확대와 지역 상권 활성화로 이문동 경제에 활력을 불어넣겠습니다.",
  },
] as const;

export default function Pledges() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h2 className="mb-10 text-center text-3xl font-black text-sky-800 after:mx-auto after:mt-3 after:block after:h-1 after:w-15 after:rounded-full after:bg-sky-500">
        주요 공약
      </h2>

      <div className="flex flex-col gap-5">
        {pledges.map(({ title, desc }, i) => (
          <div
            key={title}
            className="flex items-start gap-5 rounded-2xl bg-white p-7 shadow-sm transition hover:translate-x-2 hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-sky-400 text-lg font-black text-white">
              {i + 1}
            </span>
            <div>
              <h3 className="mb-1 text-lg font-bold text-sky-800">{title}</h3>
              <p className="leading-relaxed text-sky-700/80">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
