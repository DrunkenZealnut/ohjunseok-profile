"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminGet } from "@/lib/admin-fetch";
import {
  ClipboardList,
  Heart,
  MessageSquare,
  Vote,
  FileText,
} from "lucide-react";

const CARDS = [
  { key: "survey_responses", label: "설문 응답", href: "/admin/surveys", icon: ClipboardList, color: "from-sky-500 to-sky-600" },
  { key: "cheers", label: "응원 메시지", href: "/admin/cheers", icon: Heart, color: "from-pink-500 to-pink-600" },
  { key: "opinions", label: "주민 의견", href: "/admin/opinions", icon: MessageSquare, color: "from-emerald-500 to-emerald-600" },
  { key: "poll_observers", label: "참관인 신청", href: "/admin/observers", icon: Vote, color: "from-violet-500 to-violet-600" },
  { key: "posts", label: "소식", href: "/admin/posts", icon: FileText, color: "from-amber-500 to-amber-600" },
] as const;

export default function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminGet("action=counts").then((data) => {
      setCounts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">대시보드</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {CARDS.map(({ key, label, href, icon: Icon, color }) => (
          <Link
            key={key}
            href={href}
            className={`rounded-2xl bg-gradient-to-br ${color} p-5 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
          >
            <Icon className="mb-2 h-6 w-6 opacity-80" />
            <p className="text-3xl font-black">
              {loading ? "—" : (counts[key] ?? 0)}
            </p>
            <p className="mt-1 text-sm opacity-80">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
