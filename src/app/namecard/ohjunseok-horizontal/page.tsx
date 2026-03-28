import type { Metadata } from "next";
import Image from "next/image";

/* ============================================================
   오준석 후원회안내 — 가로형 (Blue)
   사진 크게 + 누끼, 후원계좌는 배경 없이 검은 텍스트
   ============================================================ */

const DATA = {
  candidateName: "오준석",
  slogan: "주민과 함께 일해온 사람,\n이문동의 변화를 만들겠습니다.",
  mainMessage:
    "정치적 계산이 아니라\n오직 주민 뜻대로 일할 사람이\n오준석입니다.",
  party: "진보당",
  position: "동대문구 구의원 후보",
  district: "라선거구(이문1동·이문2동)",

  candidatePhoto: "/profile.jpg",

  bankName: "농협",
  accountNumber: "000-0000-0000-00",
  accountHolder: "오준석후원회(동대문구의원선거)",

  donationNotes: [
    "개인 실명으로 입금 (법인, 단체, 공무원, 교원, 외국인 불가)",
    "1인 500만원까지 후원 가능",
    "10만원까지 전액 세액공제, 초과 시 소득공제",
  ],
  inquiryPhone: "010-0000-0000",

  kakaoChannel: {
    label: "오준석 후원회",
    url: "",
  },
};

export const metadata: Metadata = {
  title: `${DATA.candidateName}을 후원해주세요 | ${DATA.party} ${DATA.position}`,
  description: DATA.slogan.replace(/\n/g, " "),
};

export default function OhjunseokHorizontal() {
  return (
    <div className="relative mx-auto flex aspect-[4/3] max-w-[720px] flex-col overflow-hidden bg-[#5ba3d9] font-sans text-white">
      {/* ── 정당 + 선거구 ── */}
      <div className="relative z-10 flex items-center gap-2 px-6 pt-4">
        <span className="rounded bg-[#d62828] px-2 py-0.5 text-[0.65rem] font-bold text-white">
          {DATA.party}
        </span>
        <span className="text-xs font-semibold text-sky-100">
          {DATA.position}
        </span>
        <span className="text-[0.6rem] text-sky-200">{DATA.district}</span>
      </div>

      {/* ── 메인 영역: 텍스트 좌측 + 사진 중앙~우측 ── */}
      <section className="relative z-10 flex flex-1 items-end px-6 pt-1 pb-0">
        {/* 왼쪽: 제목 + 슬로건 */}
        <div className="flex-1 pb-4">
          <h1 className="text-[2.6rem] font-black leading-[1.1] tracking-tight">
            <span className="text-white">{DATA.candidateName}</span>
            <span className="text-[#1a3a5c]">을</span>
            <br />
            <span className="text-[#1a3a5c]">후원해주세요!</span>
          </h1>
          <p className="mt-2 whitespace-pre-line text-[0.8rem] font-medium leading-relaxed text-sky-100">
            {DATA.slogan}
          </p>
          <p className="mt-2 whitespace-pre-line text-[0.8rem] leading-relaxed text-white/80">
            {DATA.mainMessage}
          </p>
        </div>

        {/* 후보 사진 — 크게, 하단 정렬, 누끼 느낌 (하단 페이드) */}
        <div className="relative h-80 w-64 shrink-0">
          <Image
            src={DATA.candidatePhoto}
            alt={`${DATA.candidateName} 후보 사진`}
            fill
            className="object-cover object-top drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            style={{
              maskImage:
                "linear-gradient(to bottom, black 70%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 70%, transparent 100%)",
            }}
            priority
          />
        </div>
      </section>

      {/* ── 후원 계좌 (배경 없이, 검은 텍스트, 크게) ── */}
      <section className="relative z-10 px-6 pb-3 pt-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="mb-2 text-base font-black tracking-wide text-[#0a1e33]">
              후원계좌
            </h2>
            <div className="mb-1.5 flex items-baseline gap-2">
              <span className="rounded bg-[#00703c] px-2.5 py-1 text-xs font-bold text-white">
                {DATA.bankName}
              </span>
              <span className="text-2xl font-black tracking-wide text-[#0a1e33]">
                {DATA.accountNumber}
              </span>
            </div>
            <p className="text-sm text-[#1a3a5c]">
              예금주 : {DATA.accountHolder}
            </p>
          </div>

          <div className="max-w-[260px]">
            <ul className="space-y-1 text-sm leading-relaxed text-[#0a1e33]/80">
              {DATA.donationNotes.map((note, i) => (
                <li key={i} className="flex gap-1.5">
                  <span className="mt-0.5 text-[#0a1e33]/40">&#8226;</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
            {DATA.inquiryPhone && (
              <p className="mt-2 text-sm text-[#0a1e33]/70">
                후원문의:{" "}
                <a
                  href={`tel:${DATA.inquiryPhone}`}
                  className="font-bold text-[#0a1e33] underline"
                >
                  {DATA.inquiryPhone}
                </a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── 하단 ── */}
      <footer className="relative z-10 bg-[#3a7fc0] px-6 py-2 text-center text-xs text-sky-100">
        {DATA.kakaoChannel?.url ? (
          <a
            href={DATA.kakaoChannel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            {DATA.kakaoChannel.label}
          </a>
        ) : (
          <span>{DATA.kakaoChannel.label}</span>
        )}
      </footer>
    </div>
  );
}
