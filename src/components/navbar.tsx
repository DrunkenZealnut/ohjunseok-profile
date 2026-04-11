"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "홈", href: "/" },
  { label: "소식", href: "/news" },
  { label: "의견함", href: "/opinions" },
  { label: "참관인 신청", href: "/observer" },
  { label: "설문", href: "/crosswalk-survey" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Navbar 숨김 페이지
  if (pathname?.startsWith("/admin") || pathname === "/crosswalk-survey") return null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isOpen
          ? "bg-white/90 shadow-md backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3">
        <Link
          href="/"
          className={`text-lg font-black transition ${
            scrolled || isOpen ? "text-sky-800" : "text-white"
          }`}
        >
          오준석
        </Link>

        {/* Desktop */}
        <ul className="hidden gap-1 md:flex">
          {NAV_ITEMS.map(({ label, href }) => (
            <li key={href}>
              <Link
                href={href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === href
                    ? "bg-sky-500/10 text-sky-600 font-bold"
                    : scrolled
                      ? "text-sky-700 hover:bg-sky-50"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-lg p-2 md:hidden transition ${
            scrolled || isOpen
              ? "text-sky-800 hover:bg-sky-50"
              : "text-white hover:bg-white/10"
          }`}
          aria-label="메뉴"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-t border-sky-100 bg-white/95 backdrop-blur-md md:hidden">
          <ul className="flex flex-col px-5 py-3">
            {NAV_ITEMS.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                    pathname === href
                      ? "bg-sky-50 text-sky-600 font-bold"
                      : "text-sky-700 hover:bg-sky-50"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
