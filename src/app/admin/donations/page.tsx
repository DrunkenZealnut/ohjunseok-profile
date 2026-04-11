"use client";

import { useEffect, useState, useCallback } from "react";
import { adminGet, adminPost, adminDelete } from "@/lib/admin-fetch";
import { Trash2, Plus, Download, X } from "lucide-react";

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

interface DonationForm {
  donor_name: string;
  resident_id: string;
  phone: string;
  address: string;
  amount: string;
  deposit_date: string;
}

const PAGE_SIZE = 20;
const LOCALE = "ko-KR";

function getEmptyForm(): DonationForm {
  return {
    donor_name: "",
    resident_id: "",
    phone: "",
    address: "",
    amount: "",
    deposit_date: new Date().toISOString().slice(0, 10),
  };
}

function maskResidentId(rid: string) {
  if (!rid || rid.length < 8) return rid;
  return rid.slice(0, 8) + "******";
}

function sanitizeCell(value: string | number): string {
  const str = String(value);
  // CSV injection 방지: 수식 문자로 시작하는 값에 탭 접두
  if (/^[=+\-@\t]/.test(str)) return `\t${str}`;
  return str;
}

function toCSV(rows: Donation[]): string {
  const headers = ["이름", "주민등록번호", "전화번호", "주소", "금액", "입금일", "접수일"];
  const lines = rows.map((d) => [
    sanitizeCell(d.donor_name),
    sanitizeCell(d.resident_id),
    sanitizeCell(d.phone),
    `"${d.address.replace(/"/g, '""')}"`,
    d.amount,
    new Date(d.deposit_date).toLocaleDateString(LOCALE),
    new Date(d.created_at).toLocaleDateString(LOCALE),
  ].join(","));
  return "\uFEFF" + [headers.join(","), ...lines].join("\n");
}

export default function AdminDonations() {
  const [items, setItems] = useState<Donation[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<DonationForm>(getEmptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [downloading, setDownloading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    adminGet(`table=donations&page=${page}`)
      .then((res) => {
        if (res.data) {
          setItems(res.data);
          setCount(res.count ?? 0);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("이 후원 정보를 삭제하시겠습니까?")) return;
    await adminDelete("donations", id);
    load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!form.donor_name.trim()) return setFormError("이름을 입력해주세요.");
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return setFormError("올바른 금액을 입력해주세요.");
    if (!form.deposit_date) return setFormError("입금일을 입력해주세요.");

    setSubmitting(true);
    try {
      const res = await adminPost({
        table: "donations",
        data: {
          donor_name: form.donor_name.trim(),
          resident_id: form.resident_id.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          amount: Number(form.amount),
          deposit_date: form.deposit_date,
        },
      });
      if (res.error) {
        setFormError(res.error);
      } else {
        setShowForm(false);
        setForm(getEmptyForm());
        setPage(1);
      }
    } catch {
      setFormError("저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    let objectUrl: string | null = null;
    try {
      const res = await adminGet("table=donations&action=all");
      if (!res.data) {
        alert("목록을 불러오지 못했습니다. 다시 시도해주세요.");
        return;
      }
      const csv = toCSV(res.data as Donation[]);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `후원자목록_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } finally {
      if (objectUrl) {
        const url = objectUrl;
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setDownloading(false);
    }
  }

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const totalAmount = items.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            후원자 목록{" "}
            <span className="text-base font-normal text-gray-400">({count}건)</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            이 페이지 합계:{" "}
            <span className="font-bold text-rose-600">
              {totalAmount.toLocaleString("ko-KR")}원
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading || count === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            {downloading ? "다운로드 중..." : "CSV 다운로드"}
          </button>
          <button
            onClick={() => { setShowForm(true); setFormError(""); }}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            새 후원자 등록
          </button>
        </div>
      </div>

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
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{d.phone}</td>
                <td
                  className="max-w-[200px] truncate px-4 py-3 text-gray-600"
                  title={d.address}
                >
                  {d.address}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-rose-600">
                  {d.amount.toLocaleString("ko-KR")}원
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {new Date(d.deposit_date).toLocaleDateString(LOCALE)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-400">
                  {new Date(d.created_at).toLocaleDateString(LOCALE)}
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
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-red-400">
                  데이터를 불러오지 못했습니다. 새로고침 해주세요.
                </td>
              </tr>
            )}
            {!loading && !error && items.length === 0 && (
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

      {/* 새 후원자 등록 모달 */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">새 후원자 등록</h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    이름 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.donor_name}
                    onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    placeholder="홍길동"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    주민등록번호
                  </label>
                  <input
                    type="text"
                    value={form.resident_id}
                    onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    placeholder="900101-1234567"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    전화번호
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    placeholder="010-0000-0000"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    금액 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    placeholder="50000"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">주소</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                    placeholder="서울시 종로구 ..."
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    입금일 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.deposit_date}
                    onChange={(e) => setForm({ ...form, deposit_date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-500">{formError}</p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {submitting ? "저장 중..." : "등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
