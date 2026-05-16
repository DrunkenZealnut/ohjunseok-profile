"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { adminGet, adminPost, adminPut, adminDelete } from "@/lib/admin-fetch";
import { Trash2, Plus, Download, X, Pencil, Search, Package, FileDown, XCircle } from "lucide-react";
import {
  toExpenseSourceXlsx,
  toNamedIncomeXlsx,
  toAnonIncomeXlsx,
  buildFileName,
  isAnonymousDonation,
  ANONYMOUS_RESIDENT_ID,
  ANONYMOUS_PHONE,
  ANONYMOUS_ADDRESS,
  type Donation,
} from "./lib/donation-export";
import { TEMPLATE_META } from "./lib/template-meta";

type AnonFilter = "all" | "named" | "anon";

const SELECTED_FILENAME_SUFFIX = "_선택";

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string }) => void;
      }) => { open: () => void };
    };
  }
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
      isAnonymousDonation(d) ? "익명" : "기명",
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
  const [allData, setAllData] = useState<Donation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [anonFilter, setAnonFilter] = useState<AnonFilter>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

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
    adminGet("table=donations&action=all")
      .then((res) => {
        if (res.data) {
          setAllData(res.data as Donation[]);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allData.filter((d) => {
      const ymd = d.deposit_date.slice(0, 10);
      if (dateFrom && ymd < dateFrom) return false;
      if (dateTo && ymd > dateTo) return false;
      if (anonFilter !== "all") {
        const isAnon = isAnonymousDonation(d);
        if (anonFilter === "anon" && !isAnon) return false;
        if (anonFilter === "named" && isAnon) return false;
      }
      if (q) {
        const haystack = [
          d.donor_name,
          d.phone,
          d.email ?? "",
          d.address ?? "",
          d.detail_address ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allData, searchQuery, dateFrom, dateTo, anonFilter]);

  const count = filtered.length;
  const totalAmount = useMemo(
    () => filtered.reduce((sum, d) => sum + d.amount, 0),
    [filtered]
  );
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const items = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, dateFrom, dateTo, anonFilter]);

  const selectedRows = useMemo(
    () => allData.filter((d) => selectedIds.has(d.id)),
    [allData, selectedIds]
  );
  const selectedCount = selectedRows.length;
  const selectedAmount = useMemo(
    () => selectedRows.reduce((s, d) => s + d.amount, 0),
    [selectedRows]
  );
  const selectedNamedCount = useMemo(
    () => selectedRows.reduce((n, d) => n + (isAnonymousDonation(d) ? 0 : 1), 0),
    [selectedRows]
  );
  const selectedAnonCount = selectedCount - selectedNamedCount;

  const filteredSelectedCount = useMemo(
    () => filtered.reduce((n, d) => n + (selectedIds.has(d.id) ? 1 : 0), 0),
    [filtered, selectedIds]
  );
  const headerCheckState: "all" | "some" | "none" =
    filtered.length === 0
      ? "none"
      : filteredSelectedCount === 0
      ? "none"
      : filteredSelectedCount === filtered.length
      ? "all"
      : "some";

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = headerCheckState === "some";
    }
  }, [headerCheckState]);

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllFiltered() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const shouldSelect = headerCheckState !== "all";
      for (const d of filtered) {
        if (shouldSelect) next.add(d.id);
        else next.delete(d.id);
      }
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function resetFilters() {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setAnonFilter("all");
  }

  function handleEdit(d: Donation) {
    setEditingId(d.id);
    setForm({
      donor_name: d.donor_name,
      resident_id: d.resident_id,
      phone: d.phone,
      address: d.address,
      detail_address: d.detail_address ?? "",
      postal_code: d.postal_code ?? "",
      is_anonymous: isAnonymousDonation(d),
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

  function setAnonymousMode(anon: boolean) {
    if (anon) {
      setForm((f) => ({
        ...f,
        is_anonymous: true,
        resident_id: ANONYMOUS_RESIDENT_ID,
        phone: "",
        email: "",
        postal_code: "",
        address: "",
        detail_address: "",
      }));
    } else {
      setForm((f) => ({
        ...f,
        is_anonymous: false,
        resident_id: "",
      }));
    }
  }

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
    const payload = {
      donor_name: form.donor_name.trim(),
      resident_id: form.is_anonymous ? ANONYMOUS_RESIDENT_ID : form.resident_id.trim(),
      phone: form.is_anonymous ? ANONYMOUS_PHONE : form.phone.trim(),
      postal_code: form.is_anonymous ? null : (form.postal_code.trim() || null),
      address: form.is_anonymous ? ANONYMOUS_ADDRESS : form.address.trim(),
      detail_address: form.is_anonymous ? null : (form.detail_address.trim() || null),
      is_anonymous: form.is_anonymous,
      email: form.is_anonymous ? null : (form.email.trim() || null),
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

  const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  function buildSelectedFileName(prefix: string): string {
    const today = new Date().toISOString().slice(0, 10);
    return `${prefix}${SELECTED_FILENAME_SUFFIX}_${today}.xlsx`;
  }

  async function handleExportSelectedNamed() {
    if (selectedNamedCount === 0) return;
    setDownloading(true);
    try {
      const buf = await toNamedIncomeXlsx(selectedRows);
      downloadBlob(
        buf,
        buildSelectedFileName(TEMPLATE_META.namedIncome.fileNamePrefix),
        XLSX_MIME
      );
    } catch (err) {
      handleXlsxError(err, "선택 수입내역(기명)");
    } finally {
      setDownloading(false);
    }
  }

  async function handleExportSelectedAnon() {
    if (selectedAnonCount === 0) return;
    setDownloading(true);
    try {
      const buf = await toAnonIncomeXlsx(selectedRows);
      downloadBlob(
        buf,
        buildSelectedFileName(TEMPLATE_META.anonIncome.fileNamePrefix),
        XLSX_MIME
      );
    } catch (err) {
      handleXlsxError(err, "선택 익명수입자");
    } finally {
      setDownloading(false);
    }
  }

  async function handleExportSelectedAll() {
    if (selectedCount === 0) return;
    setDownloading(true);
    try {
      const jobs: Array<{ name: string; run: () => Promise<ArrayBuffer>; prefix: string; available: boolean }> = [
        {
          name: "선택 수입내역(기명)",
          run: () => toNamedIncomeXlsx(selectedRows),
          prefix: TEMPLATE_META.namedIncome.fileNamePrefix,
          available: selectedNamedCount > 0,
        },
        {
          name: "선택 익명수입자",
          run: () => toAnonIncomeXlsx(selectedRows),
          prefix: TEMPLATE_META.anonIncome.fileNamePrefix,
          available: selectedAnonCount > 0,
        },
      ];
      for (const job of jobs) {
        if (!job.available) continue;
        try {
          const buf = await job.run();
          downloadBlob(buf, buildSelectedFileName(job.prefix), XLSX_MIME);
        } catch (err) {
          if (err instanceof Error && err.message === "NO_DATA") continue;
          handleXlsxError(err, job.name);
          return;
        }
      }
    } finally {
      setDownloading(false);
    }
  }

  function handleXlsxError(err: unknown, kind: string) {
    if (err instanceof Error && err.message === "NO_DATA") {
      alert(`${kind}: 내보낼 데이터가 없습니다.`);
      return;
    }
    console.error(err);
    alert(`${kind} 다운로드 중 오류가 발생했습니다. 양식 파일을 확인해주세요.`);
  }

  async function handleDownloadExpenseSource() {
    setDownloading(true);
    try {
      const all = await fetchAll();
      if (!all) return;
      const buf = await toExpenseSourceXlsx(all);
      downloadBlob(buf, buildFileName(TEMPLATE_META.expenseSource.fileNamePrefix), XLSX_MIME);
    } catch (err) {
      handleXlsxError(err, "수입지출처");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadNamedIncome() {
    setDownloading(true);
    try {
      const all = await fetchAll();
      if (!all) return;
      const buf = await toNamedIncomeXlsx(all);
      downloadBlob(buf, buildFileName(TEMPLATE_META.namedIncome.fileNamePrefix), XLSX_MIME);
    } catch (err) {
      handleXlsxError(err, "수입내역(기명)");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadAnonIncome() {
    setDownloading(true);
    try {
      const all = await fetchAll();
      if (!all) return;
      const buf = await toAnonIncomeXlsx(all);
      downloadBlob(buf, buildFileName(TEMPLATE_META.anonIncome.fileNamePrefix), XLSX_MIME);
    } catch (err) {
      handleXlsxError(err, "익명수입자");
    } finally {
      setDownloading(false);
    }
  }

  async function handleDownloadAll() {
    setDownloading(true);
    try {
      const all = await fetchAll();
      if (!all) return;
      const jobs: Array<{ name: string; run: () => Promise<ArrayBuffer>; prefix: string }> = [
        { name: "수입지출처", run: () => toExpenseSourceXlsx(all), prefix: TEMPLATE_META.expenseSource.fileNamePrefix },
        { name: "수입내역(기명)", run: () => toNamedIncomeXlsx(all), prefix: TEMPLATE_META.namedIncome.fileNamePrefix },
        { name: "익명수입자", run: () => toAnonIncomeXlsx(all), prefix: TEMPLATE_META.anonIncome.fileNamePrefix },
      ];
      for (const job of jobs) {
        try {
          const buf = await job.run();
          downloadBlob(buf, buildFileName(job.prefix), XLSX_MIME);
        } catch (err) {
          if (err instanceof Error && err.message === "NO_DATA") {
            console.info(`[일괄] ${job.name}: 데이터 없음, 건너뜀`);
            continue;
          }
          handleXlsxError(err, job.name);
          return;
        }
      }
    } finally {
      setDownloading(false);
    }
  }

  const hasActiveFilter =
    searchQuery.trim().length > 0 ||
    dateFrom !== "" ||
    dateTo !== "" ||
    anonFilter !== "all";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            후원자 목록{" "}
            <span className="text-base font-normal text-gray-400">
              ({count}건{hasActiveFilter && ` / 전체 ${allData.length}건`})
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {hasActiveFilter ? "필터 결과 합계" : "전체 합계"}:{" "}
            <span className="font-bold text-rose-600">
              {totalAmount.toLocaleString("ko-KR")}원
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadExpenseSource}
            disabled={downloading || allData.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
            title="회계: 수입지출처 일괄등록 양식 (기명, 중복 제거)"
          >
            <Download className="h-4 w-4" />
            {downloading ? "..." : "수입지출처 XLS"}
          </button>
          <button
            onClick={handleDownloadNamedIncome}
            disabled={downloading || allData.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
            title="회계: 수입내역 일괄등록 양식 (기명)"
          >
            <Download className="h-4 w-4" />
            {downloading ? "..." : "수입내역(기명) XLS"}
          </button>
          <button
            onClick={handleDownloadAnonIncome}
            disabled={downloading || allData.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
            title="회계: 익명수입자 일괄등록 양식 (Sheet2에 실명 백업 포함)"
          >
            <Download className="h-4 w-4" />
            {downloading ? "..." : "익명수입자 XLS"}
          </button>
          <button
            onClick={handleDownloadAll}
            disabled={downloading || allData.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40"
            title="3종 양식 일괄 다운로드"
          >
            <Package className="h-4 w-4" />
            {downloading ? "..." : "일괄 다운로드"}
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={downloading || allData.length === 0}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40"
            title="백업/검수용 CSV"
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

      {/* 필터 바 */}
      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          {/* 날짜 범위 */}
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-gray-500">입금일 시작</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-gray-500">입금일 종료</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
          </div>

          {/* 기명/익명 3-way */}
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-gray-500">유형</label>
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-0.5 text-sm">
              {(["all", "named", "anon"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAnonFilter(v)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    anonFilter === v
                      ? "bg-rose-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {v === "all" ? "전체" : v === "named" ? "기명" : "익명"}
                </button>
              ))}
            </div>
          </div>

          {/* 텍스트 검색 */}
          <div className="relative min-w-[240px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">검색</label>
            <Search className="pointer-events-none absolute left-3 top-[34px] h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이름, 전화번호, 이메일, 주소"
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-9 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-[34px] -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="검색어 지우기"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 필터 초기화 */}
          {(dateFrom || dateTo || anonFilter !== "all" || searchQuery) && (
            <button
              type="button"
              onClick={resetFilters}
              className="self-end rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* 선택 상태 바 */}
      {selectedCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-l-4 border-rose-500 bg-rose-50 px-4 py-3">
          <div className="text-sm text-gray-700">
            <span className="font-bold text-rose-700">선택 {selectedCount}건</span>
            <span className="ml-2 text-xs text-gray-500">
              (기명 {selectedNamedCount} · 익명 {selectedAnonCount})
            </span>
            <span className="mx-2 text-gray-300">·</span>
            <span className="font-bold text-rose-700">
              {selectedAmount.toLocaleString("ko-KR")}원
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportSelectedNamed}
              disabled={downloading || selectedNamedCount === 0}
              className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
              title="회계: 수입내역 일괄등록 양식 (기명, 선택 항목)"
            >
              <FileDown className="h-4 w-4" />
              {downloading ? "..." : `수입내역(기명) XLS${selectedNamedCount > 0 ? ` · ${selectedNamedCount}` : ""}`}
            </button>
            <button
              type="button"
              onClick={handleExportSelectedAnon}
              disabled={downloading || selectedAnonCount === 0}
              className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
              title="회계: 익명수입자 일괄등록 양식 (Sheet2 실명 백업 포함, 선택 항목)"
            >
              <FileDown className="h-4 w-4" />
              {downloading ? "..." : `익명수입자 XLS${selectedAnonCount > 0 ? ` · ${selectedAnonCount}` : ""}`}
            </button>
            <button
              type="button"
              onClick={handleExportSelectedAll}
              disabled={downloading}
              className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              title="선택 항목을 기명/익명 두 양식으로 일괄 다운로드"
            >
              <Package className="h-4 w-4" />
              {downloading ? "..." : "일괄"}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              disabled={downloading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed"
            >
              <XCircle className="h-4 w-4" />
              선택 해제
            </button>
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-xs font-semibold uppercase text-gray-500">
              <th className="w-10 px-3 py-3">
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  checked={headerCheckState === "all"}
                  disabled={filtered.length === 0}
                  onChange={toggleAllFiltered}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 text-rose-600 focus:ring-rose-500 disabled:cursor-not-allowed"
                  aria-label="필터된 전체 선택"
                />
              </th>
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
            {items.map((d) => {
              const isSelected = selectedIds.has(d.id);
              return (
              <tr
                key={d.id}
                className={isSelected ? "bg-rose-50 hover:bg-rose-100" : "hover:bg-gray-50"}
              >
                <td className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(d.id)}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                    aria-label={`${d.donor_name} 선택`}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800">
                  <div className="flex items-center gap-1.5">
                    {d.donor_name}
                    {isAnonymousDonation(d) && (
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
              );
            })}
            {loading && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-gray-400">
                  불러오는 중...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-red-400">
                  데이터를 불러오지 못했습니다. 새로고침 해주세요.
                </td>
              </tr>
            )}
            {!loading && !error && items.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-gray-400">
                  {hasActiveFilter
                    ? "조건에 맞는 후원자가 없습니다."
                    : "아직 후원 정보가 없습니다."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(safePage - 1)}
            disabled={safePage <= 1}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm disabled:opacity-30"
          >
            이전
          </button>
          <span className="text-sm text-gray-500">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage(safePage + 1)}
            disabled={safePage >= totalPages}
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
                      onClick={() => setAnonymousMode(false)}
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
                      onClick={() => setAnonymousMode(true)}
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

                {/* 이름 (익명도 입력 받음) */}
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

                {/* 주민등록번호 (익명 시 sentinel 자동 표시) */}
                <div className={`col-span-2 sm:col-span-1 ${form.is_anonymous ? "opacity-60" : ""}`}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    주민등록번호
                    {form.is_anonymous && (
                      <span className="ml-1 text-xs text-gray-400">(익명 자동 처리)</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={form.is_anonymous ? ANONYMOUS_RESIDENT_ID : form.resident_id}
                    onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
                    disabled={form.is_anonymous}
                    readOnly={form.is_anonymous}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
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
