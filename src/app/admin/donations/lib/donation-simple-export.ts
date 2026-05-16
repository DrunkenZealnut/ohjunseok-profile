import * as XLSX from "xlsx";
import { isAnonymousDonation, type Donation } from "./donation-export";

const HEADERS = [
  "이름",
  "기명여부",
  "주민등록번호",
  "전화번호",
  "이메일",
  "우편번호",
  "기본주소",
  "상세주소",
  "금액",
  "입금일",
  "접수일",
] as const;

function rowOf(d: Donation): (string | number)[] {
  return [
    d.donor_name,
    isAnonymousDonation(d) ? "익명" : "기명",
    d.resident_id,
    d.phone,
    d.email ?? "",
    d.postal_code ?? "",
    d.address ?? "",
    d.detail_address ?? "",
    d.amount,
    d.deposit_date.slice(0, 10),
    d.created_at.slice(0, 10),
  ];
}

function sanitizeCell(v: string | number): string {
  const s = String(v ?? "");
  return /^[=+\-@\t]/.test(s) ? `\t${s}` : s;
}

function csvEscape(v: string | number): string {
  const s = sanitizeCell(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toSelectedCsv(rows: Donation[]): string {
  const lines = rows.map((d) => rowOf(d).map(csvEscape).join(","));
  return "﻿" + [HEADERS.join(","), ...lines].join("\n");
}

export function toSelectedXlsx(rows: Donation[]): ArrayBuffer {
  const aoa: (string | number)[][] = [
    [...HEADERS],
    ...rows.map(rowOf),
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "후원자_선택");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return buf as ArrayBuffer;
}

export function buildSelectedFileName(ext: "csv" | "xlsx"): string {
  const ymd = new Date().toISOString().slice(0, 10);
  return `후원자_선택_${ymd}.${ext}`;
}
