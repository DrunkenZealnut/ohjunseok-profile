"use client";

import { useEffect, useState, useCallback } from "react";
import { adminGet, adminDelete } from "@/lib/admin-fetch";
import { Trash2 } from "lucide-react";

interface Cheer {
  id: string;
  name: string | null;
  message: string;
  created_at: string;
}

export default function AdminCheers() {
  const [items, setItems] = useState<Cheer[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    adminGet(`table=cheers&page=${page}`).then((res) => {
      setItems(res.data);
      setCount(res.count);
    });
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("이 응원 메시지를 삭제하시겠습니까?")) return;
    await adminDelete("cheers", id);
    load();
  }

  const totalPages = Math.ceil(count / 20);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        응원 메시지 <span className="text-base font-normal text-gray-400">({count}건)</span>
      </h1>

      <div className="space-y-3">
        {items.map((c) => (
          <div key={c.id} className="flex items-start justify-between rounded-xl bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm text-gray-800">{c.message}</p>
              <p className="mt-1 text-xs text-gray-400">
                {c.name || "익명"} · {new Date(c.created_at).toLocaleDateString("ko-KR")}
              </p>
            </div>
            <button onClick={() => handleDelete(c.id)} className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
              <Trash2 className="h-4 w-4" />
            </button>
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
