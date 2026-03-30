"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  Heart,
  MessageSquare,
  Vote,
  FileText,
  HandHeart,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const MENU = [
  { label: "대시보드", href: "/admin", icon: LayoutDashboard },
  { label: "방문자 통계", href: "/admin/analytics", icon: BarChart3 },
  { label: "설문 응답", href: "/admin/surveys", icon: ClipboardList },
  { label: "응원 메시지", href: "/admin/cheers", icon: Heart },
  { label: "주민 의견", href: "/admin/opinions", icon: MessageSquare },
  { label: "참관인 신청", href: "/admin/observers", icon: Vote },
  { label: "소식 관리", href: "/admin/posts", icon: FileText },
  { label: "후원자 관리", href: "/admin/donations", icon: HandHeart },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }
    const token = sessionStorage.getItem("admin_token");
    if (!token) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!ready) return null;

  // 로그인 페이지는 레이아웃 없이 렌더
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_token");
    router.replace("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col bg-sky-800 md:flex">
        <div className="px-5 py-6">
          <h2 className="text-lg font-black text-white">관리자</h2>
        </div>
        <nav className="flex-1 px-3">
          {MENU.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                pathname === href
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-3 py-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile Header + Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex items-center justify-between bg-sky-800 px-4 py-3 md:hidden">
          <h2 className="text-lg font-black text-white">관리자</h2>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="border-b bg-sky-800 px-4 pb-3 md:hidden">
            {MENU.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname === href
                    ? "bg-white/15 text-white"
                    : "text-white/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </nav>
        )}

        {/* Content */}
        <main className="flex-1 p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
