"use client";

import { useEffect, useState, useCallback } from "react";
import { adminGet, adminDelete } from "@/lib/admin-fetch";
import { Trash2 } from "lucide-react";

interface Donation {
  id: string;
  donor_name: string;
  resident_id: string;
  phone: string;
  address: string;
  amount: number;
  deposit_date: string;
  created_at: string;
}

function maskResidentId(rid: string) {
  // "900101-1234567" → "900101-1******"
  if (!rid || rid.length < 8) return rid;
  return rid.slice(0, 8) + "******";
}

export default function AdminDonations() {
  const [items, setItems] = useState<Donation[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    adminGet(`table=donations&page=${page}`).then((res) => {
      setItems(res.data);
      setCount(res.count);
    });
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("이 후원 정보를 삭제하시겠습니까?")) return;
    await adminDelete("donations", id);
    load();
  }

  const totalPages = Math.ceil(count / 20);
  const totalAmount = items.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        후원자 목록{" "}
        <span className="text-base font-normal text-gray-400">
          ({count}건)
        </span>
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        이 페이지 합계:{" "}
        <span className="font-bold text-rose-600">
          {totalAmount.toLocaleString("ko-KR")}원
        </span>
      </p>

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">주민등록번호</th>
              <th className="px-4 py-3">전화번호</th>
              <th className="px-4 py-3">주소</th>
              <th className="px-4 py-3 text-right">금액</th>
              <th className="px-4 py-3">입금일</th>
              <th className="px-4 py-3">접수일</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                  {d.donor_name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-gray-600">
                  {maskResidentId(d.resident_id)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {d.phone}
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-gray-600" title={d.address}>
                  {d.address}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-rose-600">
                  {d.amount.toLocaleString("ko-KR")}원
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {new Date(d.deposit_date).toLocaleDateString("ko-KR")}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                  {new Date(d.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  아직 후원 정보가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm disabled:opacity-30"
          >
            이전
          </button>
          <span className="text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
