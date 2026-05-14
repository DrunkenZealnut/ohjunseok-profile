"use client";

import { useState } from "react";
import Image from "next/image";

const POSTER_PURPLE = "#46308a";

const PROFILE_ITEMS = [
  "경희대 경제학과 졸업",
  "디자인기업 몽땅 대표",
  "21대 대선 이재명 선대위 주민소통본부 공동본부장",
  "외대역·신이문역 승강장 엘리베이터 설치 운동본부장",
  "동대문 달빛어린이병원 추진 운동본부장",
  "청량초 학교운영위원회 위원장",
] as const;

export default function InteractiveHero() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* 우상단 진보당 뱃지 */}
      <div className="absolute right-5 top-20 z-30 rounded-md bg-party-red px-3 py-1.5 text-xs font-bold tracking-widest text-white md:right-10 md:top-24 md:text-sm">
        진보당
      </div>

      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-0 px-5 pt-24 pb-12 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-2 md:px-10 md:pt-28 lg:grid-cols-[minmax(0,30rem)_1fr] lg:gap-4">
        {/* 좌측: 텍스트 영역 */}
        <div className="order-2 flex flex-col md:order-1">
          {/* 선거 정보 (작게) */}
          <p className="mb-3 text-[11px] font-bold text-neutral-700 md:text-xs">
            동대문구의회의원선거 동대문구 라선거구(이문1·2동)
          </p>

          {/* 슬로건 어퍼 */}
          <p
            className="mb-2 text-2xl italic md:text-3xl"
            style={{ color: POSTER_PURPLE }}
          >
            아이 셋,
          </p>

          {/* 메인 헤드라인 — 벽보 그대로 4줄 stacked */}
          <h1
            className="text-6xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-8xl"
            style={{ color: POSTER_PURPLE }}
          >
            우리
            <br />
            동네
            <br />
            육아
            <br />
            해결사!
          </h1>

          {/* 약력 */}
          <ul className="mt-7 space-y-1 text-xs text-neutral-900 md:mt-8 md:text-sm">
            {PROFILE_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-1.5">
                <span style={{ color: POSTER_PURPLE }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* 하단: 띠 + "5 오준석" */}
          <div className="mt-8 md:mt-auto md:pt-10">
            <div
              className="mb-2 inline-block rounded-md px-3 py-1.5 text-xs font-bold text-white md:text-sm"
              style={{ backgroundColor: POSTER_PURPLE }}
            >
              동네 민원·육아 불편 척척 해결할 이문동 구의원 후보
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <span
                className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-4xl font-black text-white shadow-lg md:h-24 md:w-24 md:rounded-3xl md:text-6xl lg:h-28 lg:w-28 lg:text-7xl"
                style={{
                  backgroundColor: POSTER_PURPLE,
                  boxShadow: "0 10px 25px -10px rgba(70,48,138,0.5)",
                }}
              >
                5
              </span>
              <span
                className="text-6xl font-black tracking-tight md:text-8xl lg:text-9xl"
                style={{ color: POSTER_PURPLE }}
              >
                오준석
              </span>
            </div>
          </div>
        </div>

        {/* 우측: 사진 영역 — 텍스트 바로 옆부터 시작 */}
        <div className="order-1 relative w-full md:order-2 md:h-auto">
          <div className="relative mx-auto aspect-[3/4] w-72 sm:w-80 md:mx-0 md:h-full md:w-full md:max-w-none md:aspect-auto md:min-h-[40rem]">
            {!isLoaded && (
              <div
                className="absolute inset-0 rounded-2xl bg-neutral-100"
                style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite" }}
              />
            )}
            <Image
              src="/ohjunseok-2026.png"
              alt="오준석 후보"
              fill
              className="object-contain object-center md:object-left-bottom"
              priority
              sizes="(max-width: 640px) 18rem, (max-width: 768px) 20rem, (max-width: 1024px) 30rem, 40rem"
              onLoad={() => setIsLoaded(true)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
