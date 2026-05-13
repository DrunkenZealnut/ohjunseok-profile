export default function ActionHero() {
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
        이문동 주민들의 소중한 의견들을 모아
        <br className="hidden sm:block" />
        {" "}동대문경찰서를 만나고 왔습니다.
      </h1>
    </header>
  );
}
