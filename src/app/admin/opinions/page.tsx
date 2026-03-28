"use client";

import { useEffect, useState } from "react";
import { adminGet, adminDelete } from "@/lib/admin-fetch";
import { Trash2 } from "lucide-react";

interface Opinion {
  id: string;
  category: string;
  title: string;
  content: string;
  name: string | null;
  phone: string | null;
  created_at: string;
}

export default function AdminOpinions() {
  const [items, setItems] = useState<Opinion[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  function load() {
    adminGet(`table=opinions&page=${page}`).then((res) => {
      setItems(res.data);
      setCount(res.count);
    });
  }

  useEffect(() => { load(); }, [page]);

  async function handleDelete(id: string) {
    if (!confirm("이 의견을 삭제하시겠습니까?")) return;
    await adminDelete("opinions", id);
    load();
  }

  const totalPages = Math.ceil(count / 20);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        주민 의견 <span className="text-base font-normal text-gray-400">({count}건)</span>
      </h1>

      <div className="space-y-3">
        {items.map((o) => (
          <div key={o.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <span className="mr-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{o.category}</span>
                <span className="font-bold text-gray-800">{o.title}</span>
              </div>
              <button onClick={() => handleDelete(o.id)} className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600">{o.content}</p>
            <p className="mt-2 text-xs text-gray-400">
              {o.name || "익명"} {o.phone && `· ${o.phone}`} · {new Date(o.created_at).toLocaleDateString("ko-KR")}
            </p>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={() => setPage(page - 1)} disabled={page <= 1} className="rounded-lg bg-gray-200 px-4 py-2 text-sm disabled:opacity-30">이전</button>
          <span className="text-sm text-gray-500">{page} / {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page >= totalPages} className="rounded-lg bg-gray-200 px-4 py-2 text-sm disabled:opacity-30">다음</button>
        </div>
      )}
    </div>
  );
}
