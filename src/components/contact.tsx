export default function Contact() {
  return (
    <section className="bg-white px-5 py-20 text-center">
      <h2 className="mb-10 text-3xl font-black text-sky-800 after:mx-auto after:mt-3 after:block after:h-1 after:w-15 after:rounded-full after:bg-sky-500">
        함께해 주세요
      </h2>

      <p className="mx-auto mb-10 max-w-lg text-lg leading-loose text-sky-700/80">
        이문동의 변화는 주민 여러분의 관심과 참여에서 시작됩니다.
        <br />
        오준석과 함께 더 나은 이문동을 만들어갑시다.
      </p>

      <a
        href="#"
        className="inline-block rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-12 py-4 text-lg font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-500/40"
      >
        오준석에게 응원 보내기
      </a>
    </section>
  );
}
