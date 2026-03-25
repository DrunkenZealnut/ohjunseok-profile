"use client";

import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-200 via-sky-300 to-sky-500 px-5 py-10 text-center">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-1/2 -top-1/2 h-[200%] w-[200%] bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15)_0%,transparent_50%)]" />

      <span className="relative z-10 mb-3 inline-block rounded-md bg-party-red px-6 py-2 text-sm font-bold tracking-widest text-white">
        진보당
      </span>

      <p className="relative z-10 mb-5 text-lg font-medium text-sky-800">
        이문동 구의원 후보
      </p>

      <h1 className="relative z-10 mb-8 text-6xl font-black leading-tight text-sky-800 drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)] md:text-8xl">
        오준석
      </h1>

      {/* Profile photo */}
      <div className="relative z-10 mb-8 h-56 w-56 overflow-hidden rounded-full border-[6px] border-white/80 shadow-2xl md:h-72 md:w-72">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/profile.jpg" alt="오준석 후보" className="h-full w-full object-cover" />
      </div>

      <div className="relative z-10 rounded-xl bg-white/85 px-10 py-4 shadow-lg">
        <p className="text-xl font-bold text-sky-800 md:text-2xl">
          <span className="text-sky-600">주민과 함께</span> 일해온 사람
        </p>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() =>
          document
            .getElementById("profile")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce opacity-50 transition-opacity hover:opacity-80"
        aria-label="아래로 스크롤"
      >
        <ChevronDown className="h-8 w-8 text-sky-800" />
      </button>
    </section>
  );
}
