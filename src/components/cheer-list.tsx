"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";

interface Cheer {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "방금 전";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  return `${Math.floor(seconds / 86400)}일 전`;
}

const PAGE_SIZE = 20;

export default function CheerList({ refreshKey }: { refreshKey: number }) {
  const [cheers, setCheers] = useState<Cheer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  async function load(append = false) {
    const from = append ? cheers.length : 0;
    const { data, count } = await supabase
      .from("cheers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (data) {
      setCheers((prev) => (append ? [...prev, ...data] : data));
      setHasMore(from + PAGE_SIZE < (count ?? 0));
    }
    if (count !== null) setTotal(count);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (loading && cheers.length === 0) {
    return (
      <div className="mt-10 text-center text-sm text-sky-400">
        응원 메시지를 불러오는 중...
      </div>
    );
  }

  if (cheers.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="mb-6 flex items-center justify-center gap-2 text-sky-600">
        <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
        <span className="font-bold">총 {total}명이 응원하고 있습니다</span>
      </div>

      <div className="mx-auto max-w-md space-y-3">
        {cheers.map((cheer) => (
          <div
            key={cheer.id}
            className="rounded-xl border border-sky-100 bg-sky-50/50 px-5 py-4"
          >
            <div className="mb-1 flex items-center justify-between text-xs text-sky-400">
              <span className="font-medium text-sky-600">
                {cheer.name || "익명의 주민"}
              </span>
              <span>{timeAgo(cheer.created_at)}</span>
            </div>
            <p className="text-sm leading-relaxed text-sky-800">
              {cheer.message}
            </p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => load(true)}
            className="rounded-full border-2 border-sky-200 px-6 py-2 text-sm font-medium text-sky-600 transition hover:bg-sky-50"
          >
            더 보기
          </button>
        </div>
      )}
    </div>
  );
}
