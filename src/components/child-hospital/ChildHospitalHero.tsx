export default function ChildHospitalHero() {
  return (
    <header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 pt-24 pb-20 text-center">
      <div className="mb-6 inline-block rounded-2xl bg-party-red px-7 py-3 text-white shadow-md">
        <p className="text-xl font-black leading-tight md:text-2xl">
          오직 주민편
        </p>
        <p className="mt-1 text-lg font-bold leading-tight md:text-xl">
          진보당 동대문구위원회
        </p>
      </div>
      <h1 className="mx-auto max-w-2xl text-2xl font-black leading-snug text-sky-900 md:text-3xl md:leading-tight">
        응급실 뺑뺑이 내몰린 아이들,
        <br className="hidden sm:block" />
        {" "}동대문구는 0개입니다.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-sm font-bold text-sky-800/80 md:text-base">
        2026.04.21 · 동대문구청 · 주민 3,025명 서명 전달
      </p>
    </header>
  );
}
