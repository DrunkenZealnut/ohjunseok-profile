"use client";

import { useState } from "react";
import Image from "next/image";

export default function InteractiveHero() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <section className="portrait-animate relative h-screen w-full overflow-hidden bg-sky-200">
      <div className="absolute inset-0 flex items-center justify-center">
        {!isLoaded && (
          <div
            className="absolute inset-0 bg-sky-300/40"
            style={{ animation: "skeleton-pulse 1.5s ease-in-out infinite" }}
          />
        )}
        <div className="relative h-[85%] w-full">
          <Image
            src="/ohjunseok-2026.png"
            alt="오준석 후보"
            fill
            className="object-contain"
            style={{ objectPosition: "center center" }}
            priority
            sizes="100vw"
            onLoad={() => setIsLoaded(true)}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-sky-900/40 via-transparent to-transparent" />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-8 pt-20 md:pb-12"
        style={{
          background:
            "linear-gradient(to top, rgba(7,45,74,0.7) 0%, transparent 100%)",
        }}
      >
        <div className="mx-auto max-w-5xl text-center md:text-left">
          <span className="mb-3 inline-block rounded-md bg-party-red px-4 py-1.5 text-xs font-bold tracking-widest text-white">
            진보당
          </span>
          <h1 className="text-5xl font-black leading-tight text-white drop-shadow-lg md:text-7xl lg:text-8xl">
            오준석
          </h1>
          <p className="mt-2 text-lg text-white/80 md:text-xl">
            주민과 함께 일해온 사람
          </p>
        </div>
      </div>
    </section>
  );
}
