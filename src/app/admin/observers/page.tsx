"use client";

import { useEffect, useState } from "react";
import { adminGet } from "@/lib/admin-fetch";

interface Observer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  observer_type: string[];
  available_date: string | null;
  message: string | null;
  created_at: string;
}

export default function AdminObservers() {
  const [items, setItems] = useState<Observer[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    adminGet(`table=poll_observers&page=${page}`).then((res) => {
      setItems(res.data);
      setCount(res.count);
    });
  }, [page]);

  const totalPages = Math.ceil(count / 20);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        참관인 신청 <span className="text-base font-normal text-gray-400">({count}건)</span>
      </h1>

      <div className="space-y-3">
        {items.map((o) => (
          <div key={o.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-800">{o.name}</span>
              <span className="text-sm text-gray-500">{o.phone}</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {(o.observer_type || []).map((t) => (
                <span key={t} className="rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">{t}</span>
              ))}
            </div>
            {o.address && <p className="mt-1 text-xs text-gray-500">거주지: {o.address}</p>}
            {o.available_date && <p className="mt-1 text-xs text-gray-500">가능 시간: {o.available_date}</p>}
            {o.message && <p className="mt-2 text-sm text-gray-600">{o.message}</p>}
            <p className="mt-2 text-xs text-gray-400">{new Date(o.created_at).toLocaleDateString("ko-KR")}</p>
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
