"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, Ear, Megaphone, Brain } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── Menu data ── */
const MENUS: {
  id: string;
  Icon: LucideIcon;
  label: string;
  desc: string;
  href: string;
  // Annotation position on the image (% from top-left)
  point: { x: number; y: number };
  // Label anchor position (% from top-left)
  anchor: { x: number; y: number };
}[] = [
  {
    id: "head",
    Icon: Brain,
    label: "캠페인 성과",
    desc: "외대역 엘리베이터, 달빛어린이병원",
    href: "/results",
    point: { x: 50, y: 8 },
    anchor: { x: 78, y: 5 },
  },
  {
    id: "eyes",
    Icon: Eye,
    label: "이문동 현황",
    desc: "인구현황 및 객관적 변화",
    href: "/imun",
    point: { x: 38, y: 36 },
    anchor: { x: 8, y: 28 },
  },
  {
    id: "ears",
    Icon: Ear,
    label: "주민의견",
    desc: "주민의 목소리를 듣습니다",
    href: "/opinions",
    point: { x: 72, y: 38 },
    anchor: { x: 82, y: 32 },
  },
  {
    id: "mouth",
    Icon: Megaphone,
    label: "후보활동",
    desc: "활동 소식과 공약",
    href: "/news",
    point: { x: 52, y: 68 },
    anchor: { x: 80, y: 72 },
  },
];

export default function InteractiveHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Pause animations when out of viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setIsPaused(!e.isIntersecting),
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className="portrait-animate relative h-screen w-full overflow-hidden bg-sky-200"
    >
      {/* ── Portrait image — centered, natural proportion ── */}
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
        {/* Subtle gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-sky-900/40 via-transparent to-transparent" />
      </div>

      {/* ── SVG annotation lines (desktop) ── */}
      <svg
        className="absolute inset-0 z-10 hidden h-full w-full md:block"
        style={{ pointerEvents: "none" }}
      >
        {isLoaded &&
          MENUS.map((menu, i) => {
            const isActive = activeMenu === menu.id;
            return (
              <line
                key={menu.id}
                x1={`${menu.point.x}%`}
                y1={`${menu.point.y}%`}
                x2={`${menu.anchor.x}%`}
                y2={`${menu.anchor.y}%`}
                stroke={isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)"}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? "none" : "4 4"}
                style={{
                  filter: isActive
                    ? "drop-shadow(0 0 6px rgba(255,255,255,0.4))"
                    : undefined,
                  transition: "stroke 0.3s, stroke-width 0.3s",
                }}
              />
            );
          })}

        {/* Pulse dots at face points */}
        {isLoaded &&
          MENUS.map((menu, i) => {
            const isActive = activeMenu === menu.id;
            return (
              <g key={`dot-${menu.id}`}>
                {/* Ping ring */}
                <circle
                  cx={`${menu.point.x}%`}
                  cy={`${menu.point.y}%`}
                  r="6"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="1"
                  style={{
                    animationName: isPaused ? "none" : "portrait-ping",
                    animationDuration: "2.5s",
                    animationTimingFunction: "ease-out",
                    animationIterationCount: "infinite",
                    animationDelay: `${i * 0.4}s`,
                    transformOrigin: `${menu.point.x}% ${menu.point.y}%`,
                  }}
                />
                {/* Dot */}
                <circle
                  cx={`${menu.point.x}%`}
                  cy={`${menu.point.y}%`}
                  r={isActive ? 5 : 3.5}
                  fill={isActive ? "white" : "rgba(255,255,255,0.8)"}
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 0 8px rgba(255,255,255,0.8))"
                      : undefined,
                    transition: "r 0.3s, fill 0.3s",
                  }}
                />
              </g>
            );
          })}
      </svg>

      {/* ── Desktop: annotation labels on the image ── */}
      {MENUS.map((menu, i) => (
        <Link
          key={menu.id}
          href={menu.href}
          className={`absolute z-20 hidden rounded-xl px-4 py-3 backdrop-blur-md transition-all duration-300 md:block ${
            activeMenu === menu.id
              ? "bg-white/80 shadow-xl scale-105"
              : "bg-white/50 hover:bg-white/70 hover:shadow-lg"
          }`}
          style={{
            left: `${menu.anchor.x}%`,
            top: `${menu.anchor.y}%`,
            transform: "translate(-50%, -50%)",
            opacity: isLoaded ? 1 : 0,
            transitionDelay: `${0.6 + i * 0.15}s`,
          }}
          onMouseEnter={() => setActiveMenu(menu.id)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <div className="flex items-center gap-2">
            <menu.Icon className="h-4 w-4 text-sky-700" />
            <span className="text-sm font-bold text-sky-900">{menu.label}</span>
          </div>
          <p className="mt-0.5 text-xs text-sky-700/70">{menu.desc}</p>
        </Link>
      ))}

      {/* ── Bottom overlay: name + slogan ── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20 px-5 pb-8 pt-20 md:pb-12"
        style={{
          background: "linear-gradient(to top, rgba(7,45,74,0.7) 0%, transparent 100%)",
        }}
      >
        <div className="mx-auto max-w-5xl">
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

      {/* ── Mobile: bottom card grid ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-4 md:hidden">
        <div className="mx-auto max-w-sm">
          {/* Name overlay on mobile */}
          <div className="mb-3 text-center">
            <span className="mb-1 inline-block rounded-md bg-party-red px-3 py-1 text-xs font-bold tracking-widest text-white">
              진보당
            </span>
            <h1 className="text-4xl font-black text-white drop-shadow-lg">오준석</h1>
            <p className="text-sm text-white/80">주민과 함께 일해온 사람</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MENUS.map((menu) => (
              <Link
                key={menu.id}
                href={menu.href}
                className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-3 backdrop-blur-md transition-all active:scale-95"
              >
                <menu.Icon className="h-5 w-5 shrink-0 text-sky-600" />
                <div className="min-w-0">
                  <span className="block text-sm font-bold text-sky-900 truncate">
                    {menu.label}
                  </span>
                  <span className="block text-[10px] text-sky-600/70 truncate">
                    {menu.desc}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
