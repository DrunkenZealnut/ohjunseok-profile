"use client";

import { useState } from "react";
import Image from "next/image";

export default function InteractiveHero() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-sky-100 via-sky-50 to-sky-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-6 px-5 pt-24 pb-12 md:flex-row md:gap-8 md:px-10 md:pt-28">
        {/* 텍스트 영역 */}
        <div className="order-2 w-full text-center md:order-1 md:flex-1 md:text-left">
          <p className="mb-3 text-xl italic text-indigo-600 md:text-2xl">
            아이셋,
          </p>
          <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-indigo-800 md:text-7xl lg:text-8xl">
            우리동네
            <br />
            육아해결사!
          </h1>

          <div className="my-6 h-px w-20 bg-indigo-300 mx-auto md:mx-0" />

          <p className="text-sm font-semibold leading-relaxed text-indigo-700 md:text-base lg:text-lg">
            동네민원 · 육아불편 척척 해결할
            <br className="md:hidden" />
            <span className="md:ml-1">이문동 구의원 후보</span>
          </p>

          <div className="mt-6 flex items-center justify-center gap-3 md:mt-8 md:justify-start md:gap-4">
            <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-700 text-4xl font-black text-white shadow-lg shadow-indigo-500/30 md:h-24 md:w-24 md:rounded-3xl md:text-6xl lg:h-28 lg:w-28 lg:text-7xl">
              5
            </span>
            <span className="text-6xl font-black tracking-tight text-indigo-900 md:text-8xl lg:text-9xl">
              오준석
            </span>
          </div>
        </div>

        {/* 사진 영역 — 벽보처럼 크게 */}
        <div className="order-1 relative aspect-[3/4] w-72 sm:w-80 md:order-2 md:w-[28rem] md:flex-shrink-0 lg:w-[34rem] xl:w-[38rem]">
          {!isLoaded && (
            <div
              className="absolute inset-0 rounded-2xl bg-indigo-200/40"
              style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite" }}
            />
          )}
          <Image
            src="/ohjunseok-2026.png"
            alt="오준석 후보"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 18rem, (max-width: 768px) 20rem, (max-width: 1024px) 28rem, (max-width: 1280px) 34rem, 38rem"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>
    </section>
  );
}
