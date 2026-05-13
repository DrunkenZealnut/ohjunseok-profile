export default function ActionHero() {
  return (
    <header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 pt-28 pb-20 text-center">
      <span className="mb-5 inline-block rounded-full bg-party-red px-5 py-1.5 text-sm font-bold text-white shadow-sm">
        오직 주민편 진보당 동대문구위원회
      </span>
      <h1 className="mx-auto max-w-2xl text-2xl font-black leading-snug text-sky-900 md:text-3xl md:leading-tight">
        이문동 주민들의 소중한 의견들을 모아
        <br className="hidden sm:block" />
        {" "}동대문경찰서를 만나고 왔습니다.
      </h1>
    </header>
  );
}
