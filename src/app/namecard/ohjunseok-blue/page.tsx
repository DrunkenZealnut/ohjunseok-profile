import type { Metadata } from "next";
import Image from "next/image";

/* ============================================================
   오준석 후원회안내 — 세로형 (Blue)
   후보 이미지가 큰 제목 옆에 위치
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

export default function OhjunseokVertical() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-[#5ba3d9] font-sans text-white">
      {/* ── 정당 + 선거구 ── */}
      <div className="flex items-center gap-2 px-6 pt-5">
        <span className="rounded bg-[#d62828] px-2 py-0.5 text-[0.65rem] font-bold text-white">
          {DATA.party}
        </span>
        <span className="text-xs font-semibold text-sky-100">
          {DATA.position}
        </span>
        <span className="text-[0.6rem] text-sky-200">{DATA.district}</span>
      </div>

      {/* ── 메인 타이틀 + 후보 사진 ── */}
      <section className="flex items-center gap-4 px-6 pt-4 pb-4">
        {/* 제목 */}
        <div className="flex-1">
          <h1 className="text-[2.4rem] font-black leading-[1.15] tracking-tight">
            <span className="text-white">{DATA.candidateName}</span>
            <span className="text-[#1a3a5c]">을</span>
            <br />
            <span className="text-[#1a3a5c]">후원해</span>
            <br />
            <span className="text-[#1a3a5c]">주세요!</span>
          </h1>
          <p className="mt-2 whitespace-pre-line text-[0.8rem] font-medium leading-relaxed text-sky-100">
            {DATA.slogan}
          </p>
        </div>

        {/* 후보 사진 */}
        <div className="relative h-44 w-36 shrink-0 overflow-hidden rounded-2xl border-[3px] border-white/30 shadow-xl">
          <Image
            src={DATA.candidatePhoto}
            alt={`${DATA.candidateName} 후보 사진`}
            fill
            className="object-cover object-top"
          />
        </div>
      </section>

      {/* ── 메시지 ── */}
      <section className="px-6 pb-4">
        <p className="whitespace-pre-line text-[0.9rem] leading-relaxed text-white/90">
          {DATA.mainMessage}
        </p>
      </section>

      {/* ── 후원 계좌 ── */}
      <section className="mx-6 rounded-xl bg-white/95 p-5 text-gray-800 shadow-lg">
        <h2 className="mb-3 text-sm font-bold tracking-wide text-[#1a3a5c]">
          후원계좌
        </h2>
        <div className="mb-2 flex items-baseline gap-2">
          <span className="rounded bg-[#00703c] px-2 py-0.5 text-xs font-bold text-white">
            {DATA.bankName}
          </span>
          <span className="text-xl font-black tracking-wide text-gray-900">
            {DATA.accountNumber}
          </span>
        </div>
        <p className="mb-3 text-xs text-gray-500">
          예금주 : {DATA.accountHolder}
        </p>

        <ul className="space-y-1.5 text-xs leading-relaxed text-gray-600">
          {DATA.donationNotes.map((note, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="mt-0.5 text-gray-400">&#8226;</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>

        {DATA.inquiryPhone && (
          <p className="mt-3 text-xs text-gray-500">
            후원문의 및 영수증 발급 문의:{" "}
            <a
              href={`tel:${DATA.inquiryPhone}`}
              className="font-semibold text-[#1a3a5c] underline"
            >
              {DATA.inquiryPhone}
            </a>
          </p>
        )}
      </section>

      {/* ── 하단 ── */}
      <footer className="mt-auto bg-[#3a7fc0] px-6 py-3 text-center text-xs text-sky-100">
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
