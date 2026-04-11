"use client";

import { useEffect, useState, useCallback } from "react";
import { adminGet, adminPost, adminPut, adminDelete } from "@/lib/admin-fetch";
import { Trash2, Plus, Download, X, Pencil, Search } from "lucide-react";
import * as XLSX from "xlsx";

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string }) => void;
      }) => { open: () => void };
    };
  }
}

interface Donation {
  id: string;
  donor_name: string;
  resident_id: string;
  phone: string;
  address: string;
  detail_address: string | null;
  postal_code: string | null;
  is_anonymous: boolean;
  email: string | null;
  amount: number;
  deposit_date: string;
  created_at: string;
}

interface DonationForm {
  donor_name: string;
  resident_id: string;
  phone: string;
  address: string;
  detail_address: string;
  postal_code: string;
  is_anonymous: boolean;
  email: string;
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
    detail_address: "",
    postal_code: "",
    is_anonymous: false,
    email: "",
    amount: "",
    deposit_date: new Date().toISOString().slice(0, 10),
  };
}

function maskResidentId(rid: string) {
  if (!rid || rid.length < 8) return rid;
  return rid.slice(0, 8) + "******";
}

/** 주민번호 → 생년월일 8자리 (예: 900101-1... → 19900101) */
function ridToBirth(rid: string): string {
  if (!rid || rid.length < 8) return "";
  const digits = rid.replace("-", "");
  const front = digits.slice(0, 6);
  const gen = digits[6];
  const century = gen === "3" || gen === "4" ? "20" : "19";
  return century + front;
}

/** 입금일 → YYYY.MM.DD */
function formatDateDot(date: string): string {
  return date.slice(0, 10).replace(/-/g, ".");
}

const XLS_HEADERS = [
  "*계정", "*과목", "*수입일자", "*내역", "*수입제공자",
  "생년월일(사업자번호)", "우편번호", "주  소", "상세주소",
  "직업\n(업종)", "전화번호", "*금액", "*증빙서\n첨부",
  "영수증번호/\n미첨부사유", "*수입지출처\n구분", "비고",
];

function toNamedXlsx(rows: Donation[]): ArrayBuffer {
  const named = rows.filter((d) => !d.is_anonymous);
  const data = named.map((d) => [
    "수입", "기명후원금", formatDateDot(d.deposit_date), "후원",
    d.donor_name, ridToBirth(d.resident_id),
    d.postal_code ?? "", d.address ?? "", d.detail_address ?? "",
    "", d.phone, d.amount, "Y", "", "개인", d.email ?? "",
  ]);
  const ws = XLSX.utils.aoa_to_sheet([XLS_HEADERS, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "수입 내역 일괄등록");
  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}

function toAnonXlsx(rows: Donation[]): ArrayBuffer {
  const anon = rows.filter((d) => d.is_anonymous);
  const data = anon.map((d) => [
    "수입", "익명후원금", formatDateDot(d.deposit_date), "후원",
    "익명", "", "", "", "", "", "", d.amount, "N", "익명", "개인", "",
  ]);
  const ws = XLSX.utils.aoa_to_sheet([XLS_HEADERS, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "수입 내역 일괄등록");
  return XLSX.write(wb, { bookType: "xlsx", type: "array" });
}

function sanitizeCell(value: string | number | boolean | null | undefined): string {
  const str = String(value ?? "");
  if (/^[=+\-@\t]/.test(str)) return `\t${str}`;
  return str;
}

function toCSV(rows: Donation[]): string {
  const headers = ["이름", "기명여부", "주민등록번호", "전화번호", "이메일", "우편번호", "기본주소", "상세주소", "금액", "입금일", "접수일"];
  const lines = rows.map((d) =>
    [
      sanitizeCell(d.donor_name),
      d.is_anonymous ? "익명" : "기명",
      sanitizeCell(d.resident_id),
      sanitizeCell(d.phone),
      sanitizeCell(d.email ?? ""),
      sanitizeCell(d.postal_code ?? ""),
      `"${(d.address ?? "").replace(/"/g, '""')}"`,
      `"${(d.detail_address ?? "").replace(/"/g, '""')}"`,
      d.amount,
      new Date(d.deposit_date).toLocaleDateString(LOCALE),
      new Date(d.created_at).toLocaleDateString(LOCALE),
    ].join(",")
  );
  return "\uFEFF" + [headers.join(","), ...lines].join("\n");
}

export default function AdminDonations() {
  const [items, setItems] = useState<Donation[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DonationForm>(getEmptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [downloading, setDownloading] = useState(false);

  function openDaumPostcode() {
    const run = () => {
      new window.daum!.Postcode({
        oncomplete(data) {
          setForm((f) => ({
            ...f,
            postal_code: data.zonecode,
            address: data.roadAddress || data.jibunAddress,
            detail_address: "",
          }));
        },
      }).open();
    };
    if (window.daum?.Postcode) { run(); return; }
    const s = document.createElement("script");
    s.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    s.onload = run;
    document.head.appendChild(s);
  }

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, refreshKey]);

  useEffect(() => {
    load();
  }, [load]);

  function handleEdit(d: Donation) {
    setEditingId(d.id);
    setForm({
      donor_name: d.donor_name,
      resident_id: d.resident_id,
      phone: d.phone,
      address: d.address,
      detail_address: d.detail_address ?? "",
      postal_code: d.postal_code ?? "",
      is_anonymous: d.is_anonymous ?? false,
      email: d.email ?? "",
      amount: String(d.amount),
      deposit_date: d.deposit_date.slice(0, 10),
    });
    setFormError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(getEmptyForm());
    setFormError("");
  }

  async function handleDelete(id: string) {
    if (!confirm("이 후원 정보를 삭제하시겠습니까?")) return;
    await adminDelete("donations", id);
    load();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!form.is_anonymous && !form.donor_name.trim()) return setFormError("이름을 입력해주세요.");
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      return setFormError("올바른 금액을 입력해주세요.");
    if (!form.deposit_date) return setFormError("입금일을 입력해주세요.");

    setSubmitting(true);
    const payload = {
      donor_name: form.donor_name.trim(),
      resident_id: form.resident_id.trim(),
      phone: form.phone.trim(),
      postal_code: form.postal_code.trim() || null,
      address: form.address.trim(),
      detail_address: form.detail_address.trim() || null,
      is_anonymous: form.is_anonymous,
      email: form.email.trim() || null,
      amount: Number(form.amount),
      deposit_date: form.deposit_date,
    };
    try {
      const res = editingId
        ? await adminPut({ table: "donations", id: editingId, data: payload })
        : await adminPost({ table: "donations", data: payload });
      if (res.error) {
        setFormError(res.error);
      } else {
        closeForm();
        if (!editingId) setPage(1);
        setRefreshKey((k) => k + 1);
      }
    } catch {
      setFormError("저장 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  async function fetchAll(): Promise<Donation[] | null> {
    const res = await adminGet("table=donations&action=all");
    if (!res.data) { alert("목록을 불러오지 못했습니다."); return null; }
    return res.data as Donation[];
  }

  function downloadBlob(buf: ArrayBuffer | string, filename: string, mime: string) {
    const blob = new Blob([buf], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleDownloadCSV() {
    setDownloading(true);
    try {
      const all = await fetchAll();
      if (!all) return;
      downloadBlob(toCSV(all), `후원자목록_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
    } finally { setDownloading(false); }
  }

  async function handleDownloadNamedXlsx() {
    setDownloading(true);
    try {
      const all = await fetchAll();
      if (!all) return;
      downloadBlob(toNamedXlsx(all), `기명후원금_${new Date().toISOString().slice(0, 10)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    } finally { setDownloading(false); }
  }

  async function handleDownloadAnonXlsx() {
    setDownloading(true);
    try {
      const all = await fetchAll();
      if (!all) return;
      downloadBlob(toAnonXlsx(all), `익명후원금_${new Date().toISOString().slice(0, 10)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    } finally { setDownloading(false); }
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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadNamedXlsx}
            disabled={downloading || count === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            {downloading ? "..." : "기명 XLS"}
          </button>
          <button
            onClick={handleDownloadAnonXlsx}
            disabled={downloading || count === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            {downloading ? "..." : "익명 XLS"}
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={downloading || count === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            {downloading ? "..." : "CSV"}
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setForm(getEmptyForm());
              setFormError("");
              setShowForm(true);
            }}
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
              <th className="px-4 py-3">이메일</th>
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
                  <div className="flex items-center gap-1.5">
                    {d.donor_name}
                    {d.is_anonymous && (
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                        익명
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-gray-600">
                  {maskResidentId(d.resident_id)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">{d.phone}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">{d.email ?? "-"}</td>
                <td
                  className="max-w-[220px] truncate px-4 py-3 text-gray-600"
                  title={[d.postal_code, d.address].filter(Boolean).join(" ")}
                >
                  {d.postal_code && (
                    <span className="mr-1.5 rounded bg-blue-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-600">
                      {d.postal_code}
                    </span>
                  )}
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
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(d)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-blue-500"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-red-400">
                  데이터를 불러오지 못했습니다. 새로고침 해주세요.
                </td>
              </tr>
            )}
            {!loading && !error && items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-gray-400">
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

      {/* 후원자 등록/수정 모달 */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? "후원자 정보 수정" : "새 후원자 등록"}
              </h2>
              <button
                onClick={closeForm}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* 기명/익명 (최상단) */}
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    기명/익명
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_anonymous: false })}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        !form.is_anonymous
                          ? "border-rose-500 bg-rose-50 text-rose-700"
                          : "border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      기명
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, is_anonymous: true })}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        form.is_anonymous
                          ? "border-rose-500 bg-rose-50 text-rose-700"
                          : "border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      익명
                    </button>
                  </div>
                </div>

                {/* 금액 */}
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

                {/* 입금일 */}
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

                {/* 이름 */}
                <div className={`col-span-2 sm:col-span-1 ${form.is_anonymous ? "opacity-40" : ""}`}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    이름 {!form.is_anonymous && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={form.donor_name}
                    onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                    disabled={form.is_anonymous}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="홍길동"
                  />
                </div>

                {/* 주민등록번호 */}
                <div className={`col-span-2 sm:col-span-1 ${form.is_anonymous ? "opacity-40" : ""}`}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    주민등록번호
                  </label>
                  <input
                    type="text"
                    value={form.resident_id}
                    onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
                    disabled={form.is_anonymous}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="900101-1234567"
                  />
                </div>

                {/* 전화번호 */}
                <div className={`col-span-2 sm:col-span-1 ${form.is_anonymous ? "opacity-40" : ""}`}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    전화번호
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    disabled={form.is_anonymous}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="010-0000-0000"
                  />
                </div>

                {/* 이메일 */}
                <div className={`col-span-2 sm:col-span-1 ${form.is_anonymous ? "opacity-40" : ""}`}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    disabled={form.is_anonymous}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="example@email.com"
                  />
                </div>

                {/* 우편번호 + 검색 */}
                <div className={`col-span-2 sm:col-span-1 ${form.is_anonymous ? "opacity-40" : ""}`}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">우편번호</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.postal_code}
                      onChange={(e) =>
                        setForm({ ...form, postal_code: e.target.value.replace(/\D/g, "").slice(0, 5) })
                      }
                      disabled={form.is_anonymous}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="12345"
                      maxLength={5}
                    />
                    <button
                      type="button"
                      onClick={openDaumPostcode}
                      disabled={form.is_anonymous}
                      className="flex shrink-0 items-center gap-1 rounded-lg bg-gray-600 px-3 py-2 text-sm text-white transition hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Search className="h-3.5 w-3.5" />
                      검색
                    </button>
                  </div>
                </div>

                {/* 기본주소 */}
                <div className={`col-span-2 ${form.is_anonymous ? "opacity-40" : ""}`}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">기본주소</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    disabled={form.is_anonymous}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="서울시 동대문구 휘경로7길 3"
                  />
                </div>

                {/* 상세주소 */}
                <div className={`col-span-2 ${form.is_anonymous ? "opacity-40" : ""}`}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">상세주소</label>
                  <input
                    type="text"
                    value={form.detail_address}
                    onChange={(e) => setForm({ ...form, detail_address: e.target.value })}
                    disabled={form.is_anonymous}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="동, 호수 등"
                  />
                </div>
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {submitting ? "저장 중..." : editingId ? "수정" : "등록"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
