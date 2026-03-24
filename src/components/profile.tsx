const cards = [
  { label: "이름", value: "오준석 (吳俊碩)" },
  { label: "소속 정당", value: "진보당" },
  { label: "출마 지역", value: "이문동 구의원" },
  { label: "슬로건", value: "주민과 함께 일해온 사람" },
] as const;

export default function Profile() {
  return (
    <section
      id="profile"
      className="relative z-10 mx-auto -mt-16 max-w-3xl rounded-2xl bg-white px-6 py-14 shadow-xl md:px-10"
    >
      <h2 className="mb-10 text-center text-3xl font-black text-sky-800 after:mx-auto after:mt-3 after:block after:h-1 after:w-15 after:rounded-full after:bg-sky-500">
        후보 소개
      </h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border-l-4 border-sky-500 bg-gradient-to-br from-sky-50 to-sky-100 p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-sky-500">
              {label}
            </h3>
            <p className="text-lg font-medium text-sky-800">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
