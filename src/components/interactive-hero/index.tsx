"use client";

import { useState } from "react";
import Image from "next/image";

export default function InteractiveHero() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-sky-100 via-sky-50 to-sky-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center gap-10 px-5 pt-24 pb-12 md:flex-row md:gap-12 md:px-10 md:pt-28">
        {/* 텍스트 영역 */}
        <div className="order-2 w-full text-center md:order-1 md:flex-1 md:text-left">
          <p className="mb-3 text-xl italic text-sky-700 md:text-2xl">
            아이셋,
          </p>
          <h1 className="text-5xl font-black leading-[1.1] text-sky-900 md:text-7xl lg:text-8xl">
            우리동네
            <br />
            육아해결사!
          </h1>

          <div className="my-6 h-px w-16 bg-sky-300 mx-auto md:mx-0" />

          <p className="text-sm font-semibold leading-relaxed text-sky-800 md:text-base">
            동네민원 · 육아불편 척척 해결할
            <br className="md:hidden" />
            <span className="md:ml-1">이문동 구의원 후보</span>
          </p>

          <div className="mt-6 flex items-center justify-center gap-3 md:mt-8 md:justify-start md:gap-4">
            <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-party-red text-4xl font-black text-white shadow-lg shadow-red-500/20 md:h-20 md:w-20 md:rounded-3xl md:text-5xl">
              5
            </span>
            <span className="text-5xl font-black tracking-tight text-sky-900 md:text-7xl lg:text-8xl">
              오준석
            </span>
          </div>
        </div>

        {/* 사진 영역 */}
        <div className="order-1 relative aspect-[3/4] w-56 sm:w-64 md:order-2 md:w-96 md:flex-shrink-0 lg:w-[28rem]">
          {!isLoaded && (
            <div
              className="absolute inset-0 rounded-2xl bg-sky-200/50"
              style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite" }}
            />
          )}
          <Image
            src="/ohjunseok-2026.png"
            alt="오준석 후보"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 640px) 14rem, (max-width: 768px) 16rem, (max-width: 1024px) 24rem, 28rem"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
      </div>
    </section>
  );
}
