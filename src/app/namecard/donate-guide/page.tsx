import type { Metadata } from "next";
import Image from "next/image";

/* ============================================================
   오준석 후원안내 카드 — donate_guide.png 소스코드 변환
   정사각형(1:1) SNS 공유용 카드
   ============================================================ */

const DATA = {
  candidateName: "오준석",
  party: "진보당",
  election: "동대문구 구의원선거",
  district: "이문동 구의원 후보",
  slogan1: "주민과 함께",
  slogan2: "일해온 사람",
  candidatePhoto: "/profile.jpg",

  bankName: "우체국",
  accountNumber: "100-0003-61062",
  accountHolder: "동대문구라선거구구의회원예비후보자",

  donationNotes: [
    "1인 최대 100만원까지 후원가능",
    "10만원 초과 후원은 소득공제",
    "10만원 이하 후원은 전액 세액공제",
    "단체, 법인, 외국인, 공무원은 후원불가",
  ],
};

export const metadata: Metadata = {
  title: `${DATA.candidateName} 후원안내 | ${DATA.party} ${DATA.district}`,
  description: `${DATA.district} ${DATA.candidateName} - ${DATA.slogan1} ${DATA.slogan2}`,
};

export default function DonateGuidePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      {/* 정사각형 카드 */}
      <div
        className="relative mx-auto w-full max-w-[600px] overflow-hidden font-sans"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* ── 상단: 메인 비주얼 영역 ── */}
        <div className="relative flex h-[68%] w-full bg-[#1b2d4e]">
          {/* 후보 사진 — 왼쪽 */}
          <div className="relative w-[42%] shrink-0 self-end">
            <div className="relative h-full w-full">
              <Image
                src={DATA.candidatePhoto}
                alt={`${DATA.candidateName} 후보 사진`}
                fill
                className="object-cover object-top"
                style={{
                  maskImage:
                    "linear-gradient(to right, black 80%, transparent 100%), linear-gradient(to top, transparent 0%, black 15%)",
                  WebkitMaskImage:
                    "linear-gradient(to right, black 80%, transparent 100%), linear-gradient(to top, transparent 0%, black 15%)",
                  maskComposite: "intersect",
                  WebkitMaskComposite: "destination-in",
                }}
                priority
              />
            </div>
          </div>

          {/* 텍스트 — 오른쪽 */}
          <div className="flex flex-1 flex-col justify-center px-[5%] py-[4%]">
            {/* 선거구 정보 */}
            <p className="text-[clamp(0.6rem,1.8vw,0.85rem)] font-medium leading-snug text-white/90">
              {DATA.election}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-[clamp(0.6rem,1.8vw,0.85rem)] font-medium text-white/90">
                {DATA.district}
              </p>
              <span className="rounded bg-[#d62828] px-2 py-0.5 text-[clamp(0.5rem,1.4vw,0.7rem)] font-bold text-white">
                {DATA.party}
              </span>
            </div>

            {/* 이름 */}
            <h1 className="mt-2 text-[clamp(2.2rem,7.5vw,4.5rem)] font-black leading-none tracking-tight text-white">
              {DATA.candidateName}
            </h1>

            {/* 슬로건 */}
            <p className="mt-2 text-[clamp(1rem,3.5vw,2rem)] font-bold leading-tight text-[#f5c842]">
              {DATA.slogan1}
            </p>
            <p className="text-[clamp(1.4rem,5vw,3rem)] font-black leading-tight text-[#f5c842]">
              {DATA.slogan2}
            </p>
          </div>
        </div>

        {/* ── 하단: 후원 정보 영역 ── */}
        <div className="flex h-[32%] w-full flex-col bg-[#0f1e36]">
          {/* 후원계좌 */}
          <div className="flex flex-col gap-1 border-b border-white/10 px-[5%] py-[2.5%]">
            <div className="flex items-center gap-0">
              <span className="w-[clamp(3rem,10vw,5rem)] shrink-0 text-[clamp(0.55rem,1.6vw,0.8rem)] font-bold text-white">
                후원계좌
              </span>
              <span className="mx-2 text-white/30">|</span>
              <span className="text-[clamp(0.55rem,1.6vw,0.8rem)] font-bold text-white">
                {DATA.bankName} {DATA.accountNumber}
              </span>
            </div>
            <div className="flex items-center gap-0">
              <span className="w-[clamp(3rem,10vw,5rem)] shrink-0 text-[clamp(0.55rem,1.6vw,0.8rem)] font-bold text-white">
                예금주
              </span>
              <span className="mx-2 text-white/30">|</span>
              <span className="text-[clamp(0.5rem,1.4vw,0.72rem)] text-white/80">
                {DATA.accountHolder}
              </span>
            </div>
          </div>

          {/* QR + 안내사항 */}
          <div className="flex flex-1 items-center gap-[4%] px-[5%] py-[2%]">
            {/* QR 코드 자리 */}
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div className="flex h-[clamp(3rem,10vw,5rem)] w-[clamp(3rem,10vw,5rem)] items-center justify-center rounded bg-white p-1">
                {/* QR 코드 플레이스홀더 */}
                <svg
                  viewBox="0 0 100 100"
                  className="h-full w-full text-gray-800"
                >
                  {/* 간단한 QR 코드 패턴 */}
                  <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="10" y="10" width="10" height="10" fill="currentColor" />
                  <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="80" y="10" width="10" height="10" fill="currentColor" />
                  <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="10" y="80" width="10" height="10" fill="currentColor" />
                  <rect x="35" y="0" width="5" height="5" fill="currentColor" />
                  <rect x="45" y="0" width="5" height="5" fill="currentColor" />
                  <rect x="55" y="0" width="5" height="5" fill="currentColor" />
                  <rect x="35" y="10" width="5" height="5" fill="currentColor" />
                  <rect x="50" y="10" width="5" height="5" fill="currentColor" />
                  <rect x="35" y="35" width="5" height="5" fill="currentColor" />
                  <rect x="45" y="40" width="10" height="10" fill="currentColor" />
                  <rect x="60" y="35" width="5" height="5" fill="currentColor" />
                  <rect x="0" y="35" width="5" height="5" fill="currentColor" />
                  <rect x="10" y="40" width="5" height="5" fill="currentColor" />
                  <rect x="20" y="35" width="5" height="5" fill="currentColor" />
                  <rect x="35" y="55" width="5" height="5" fill="currentColor" />
                  <rect x="45" y="60" width="5" height="5" fill="currentColor" />
                  <rect x="70" y="40" width="5" height="5" fill="currentColor" />
                  <rect x="80" y="35" width="5" height="5" fill="currentColor" />
                  <rect x="90" y="45" width="5" height="5" fill="currentColor" />
                  <rect x="70" y="55" width="5" height="5" fill="currentColor" />
                  <rect x="85" y="55" width="5" height="5" fill="currentColor" />
                  <rect x="95" y="60" width="5" height="5" fill="currentColor" />
                  <rect x="70" y="70" width="10" height="10" fill="currentColor" />
                  <rect x="85" y="75" width="10" height="10" fill="currentColor" />
                  <rect x="70" y="90" width="5" height="5" fill="currentColor" />
                  <rect x="85" y="90" width="10" height="10" fill="currentColor" />
                  <rect x="40" y="70" width="5" height="5" fill="currentColor" />
                  <rect x="50" y="80" width="5" height="5" fill="currentColor" />
                  <rect x="55" y="90" width="5" height="5" fill="currentColor" />
                </svg>
              </div>
              <span className="text-[clamp(0.4rem,1.2vw,0.6rem)] font-medium text-white/60">
                후원 QR 스캔
              </span>
            </div>

            {/* 후원 안내사항 */}
            <ul className="flex-1 space-y-0.5">
              {DATA.donationNotes.map((note, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[clamp(0.5rem,1.5vw,0.75rem)] leading-relaxed text-white/90"
                >
                  <span className="mt-[0.15em] text-[#f5c842]">&#9670;</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
