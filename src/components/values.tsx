const values = [
  {
    icon: "🤝",
    title: "주민과 함께",
    desc: "주민의 목소리에 귀 기울이고 함께 만들어가는 지역 정치",
  },
  {
    icon: "🏘️",
    title: "살기 좋은 이문동",
    desc: "안전하고 쾌적한 주거환경 조성을 위해 노력합니다",
  },
  {
    icon: "💪",
    title: "실천하는 정치",
    desc: "말보다 행동으로, 약속을 지키는 일꾼이 되겠습니다",
  },
] as const;

export default function Values() {
  return (
    <section className="bg-gradient-to-br from-sky-500 to-sky-600 px-5 py-20 text-center">
      <h2 className="mb-10 text-3xl font-black text-white after:mx-auto after:mt-3 after:block after:h-1 after:w-15 after:rounded-full after:bg-white/60">
        핵심 가치
      </h2>

      <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
        {values.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-white/20 bg-white/15 p-8 text-white backdrop-blur-sm transition hover:-translate-y-1.5 hover:bg-white/25"
          >
            <div className="mb-4 text-4xl">{icon}</div>
            <h3 className="mb-2 text-lg font-bold">{title}</h3>
            <p className="text-sm leading-relaxed opacity-90">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
