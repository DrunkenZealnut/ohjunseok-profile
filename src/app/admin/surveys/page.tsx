"use client";

import { useEffect, useState } from "react";
import { adminGet } from "@/lib/admin-fetch";

interface Survey {
  id: string;
  location: string;
  issue_types: string[];
  detail: string | null;
  respondent_name: string | null;
  phone: string | null;
  created_at: string;
}

export default function AdminSurveys() {
  const [items, setItems] = useState<Survey[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    adminGet(`table=survey_responses&page=${page}`).then((res) => {
      setItems(res.data);
      setCount(res.count);
    });
  }, [page]);

  const totalPages = Math.ceil(count / 20);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        설문 응답 <span className="text-base font-normal text-gray-400">({count}건)</span>
      </h1>

      <div className="space-y-3">
        {items.map((s) => (
          <div key={s.id} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="font-bold text-gray-800">{s.location}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {(s.issue_types || []).map((t: string) => (
                <span key={t} className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-700">{t}</span>
              ))}
            </div>
            {s.detail && <p className="mt-2 text-sm text-gray-600">{s.detail}</p>}
            <p className="mt-2 text-xs text-gray-400">
              {s.respondent_name || "익명"} {s.phone && `· ${s.phone}`} · {new Date(s.created_at).toLocaleDateString("ko-KR")}
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
