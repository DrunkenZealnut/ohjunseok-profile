import Link from "next/link";

const FOOTER_LINKS = [
  { label: "이문동 현황", href: "/imun" },
  { label: "주민의견", href: "/opinions" },
  { label: "달빛어린이병원", href: "/child-hospital" },
  { label: "후보활동", href: "/news" },
  { label: "캠페인 성과", href: "/results" },
  { label: "후원인 정보입력", href: "/donate" },
] as const;

export default function Footer() {
  return (
    <footer className="bg-sky-800 px-5 py-10 text-center">
      <nav className="mb-6 flex flex-wrap justify-center gap-4">
        {FOOTER_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="text-sm text-white/60 transition hover:text-white"
          >
            {label}
          </Link>
        ))}
      </nav>

      <p className="text-sm text-white/60">
        <strong className="text-white">기호 5번 진보당</strong> 이문동 구의원
        후보 <strong className="text-white">오준석</strong>
      </p>
      <p className="mt-2 text-sm text-white/60">우리 동네 육아 해결사!</p>

      <p className="mx-auto mt-6 max-w-xl text-xs leading-relaxed text-white/40">
        본 게시물은 공직선거법 제65조에 따라 작성된 자료를 기반으로 합니다.
        <br />
        후보자 정보는 공식 책자형 선거공보(2026.05.19 등록)를 정본으로
        합니다.
      </p>
    </footer>
  );
}
