import * as XLSX from "xlsx";
import { TEMPLATE_META, type TemplateMeta } from "./template-meta";

// 익명 후원자 sentinel 값 — DB 저장 및 회계 export 정규화에 사용한다.
// resident_id는 모든 자리가 "1"인 13자리 → ridToBirth 변환 시 "19111111"이 된다.
export const ANONYMOUS_RESIDENT_ID = "111111-1111111";
export const ANONYMOUS_BIRTH = "19111111";
export const ANONYMOUS_PHONE = "00000000000";
export const ANONYMOUS_ADDRESS = "(익명)";

export interface Donation {
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

type CellValue = string | number;
type Row = CellValue[];

function digits(s: string | null | undefined): string {
  return (s ?? "").replace(/\D/g, "");
}

// 주민번호 앞 6자리(생년월일)가 "111111"이면 익명 sentinel로 간주한다.
// is_anonymous 컬럼이 누락/false인 과거 데이터(주민번호만 수동 정리된 케이스)도 익명으로 분류된다.
export function isAnonymousResidentId(rid: string | null | undefined): boolean {
  return digits(rid).slice(0, 6) === "111111";
}

export function isAnonymousDonation(
  d: { is_anonymous?: boolean | null; resident_id?: string | null } | null | undefined,
): boolean {
  if (!d) return false;
  return d.is_anonymous === true || isAnonymousResidentId(d.resident_id);
}

export function ridToBirth(rid: string): string {
  if (!rid) return "";
  const d = digits(rid);
  if (d.length < 7) return "";
  const front = d.slice(0, 6);
  const gen = d[6];
  const century = gen === "3" || gen === "4" ? "20" : "19";
  return century + front;
}

export function formatDateDot(date: string): string {
  return date.slice(0, 10).replace(/-/g, ".");
}

function dedupeKey(d: Donation): string {
  const rid = digits(d.resident_id);
  if (rid.length >= 13) return `RID:${rid}`;
  const phone = digits(d.phone);
  if (phone.length >= 9) return `PHONE:${phone}`;
  return `NAME:${(d.donor_name ?? "").trim()}|ADDR:${d.address ?? ""}`;
}

export function dedupeDonors(donors: Donation[]): Donation[] {
  const map = new Map<string, Donation>();
  const sorted = [...donors].sort((a, b) => a.deposit_date.localeCompare(b.deposit_date));
  for (const d of sorted) {
    map.set(dedupeKey(d), d);
  }
  return Array.from(map.values());
}

async function loadTemplate(url: string): Promise<XLSX.WorkBook> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Template fetch failed (${res.status}): ${url}`);
  }
  const buf = await res.arrayBuffer();
  return XLSX.read(buf, { type: "array" });
}

function appendRowsAt(ws: XLSX.WorkSheet, rows: Row[], startRow: number): void {
  if (rows.length === 0) return;
  XLSX.utils.sheet_add_aoa(ws, rows, { origin: { r: startRow - 1, c: 0 } });
}

function verifyTemplate(wb: XLSX.WorkBook, meta: TemplateMeta): void {
  if (process.env.NODE_ENV === "production") return;
  const ws = wb.Sheets[meta.sheetName];
  if (!ws) {
    console.warn(`[donation-export] sheet "${meta.sheetName}" missing in ${meta.url}`);
    return;
  }
  if (meta.backupSheetName && !wb.Sheets[meta.backupSheetName]) {
    console.warn(`[donation-export] backup sheet "${meta.backupSheetName}" missing in ${meta.url}`);
  }
}

export async function toExpenseSourceXlsx(donors: Donation[]): Promise<ArrayBuffer> {
  const meta = TEMPLATE_META.expenseSource;
  const named = donors.filter((d) => !isAnonymousDonation(d));
  const unique = dedupeDonors(named);
  if (unique.length === 0) {
    throw new Error("NO_DATA");
  }
  const rows: Row[] = unique.map((d) => [
    "개인",
    (d.donor_name ?? "").trim(),
    ridToBirth(d.resident_id),
    "",
    d.postal_code ?? "",
    d.address ?? "",
    d.detail_address ?? "",
    digits(d.phone),
    d.email ?? "",
  ]);
  const wb = await loadTemplate(meta.url);
  verifyTemplate(wb, meta);
  appendRowsAt(wb.Sheets[meta.sheetName], rows, meta.dataStartRow);
  return XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
}

export async function toNamedIncomeXlsx(donors: Donation[]): Promise<ArrayBuffer> {
  const meta = TEMPLATE_META.namedIncome;
  const named = donors.filter((d) => !isAnonymousDonation(d));
  if (named.length === 0) {
    throw new Error("NO_DATA");
  }
  const rows: Row[] = named.map((d) => [
    "수입",
    "기명후원금",
    formatDateDot(d.deposit_date),
    "후원",
    d.donor_name,
    ridToBirth(d.resident_id),
    d.postal_code ?? "",
    d.address ?? "",
    d.detail_address ?? "",
    "",
    digits(d.phone),
    d.amount,
    "Y",
    "",
    "개인",
    d.email ?? "",
  ]);
  const wb = await loadTemplate(meta.url);
  verifyTemplate(wb, meta);
  appendRowsAt(wb.Sheets[meta.sheetName], rows, meta.dataStartRow);
  return XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
}

export async function toAnonIncomeXlsx(donors: Donation[]): Promise<ArrayBuffer> {
  const meta = TEMPLATE_META.anonIncome;
  const anon = donors.filter((d) => isAnonymousDonation(d));
  if (anon.length === 0) {
    throw new Error("NO_DATA");
  }
  const mainRows: Row[] = anon.map((d) => [
    "수입",
    "익명후원금",
    formatDateDot(d.deposit_date),
    "후원",
    "익명",
    ANONYMOUS_BIRTH,
    "",
    "",
    "",
    "",
    "",
    d.amount,
    "N",
    "익명",
    "개인",
    "",
  ]);
  const backupRows: Row[] = anon.map((d) => [
    formatDateDot(d.deposit_date),
    (d.donor_name ?? "").trim() || "(미입력)",
  ]);
  const wb = await loadTemplate(meta.url);
  verifyTemplate(wb, meta);
  appendRowsAt(wb.Sheets[meta.sheetName], mainRows, meta.dataStartRow);
  if (meta.backupSheetName && meta.backupDataStartRow && wb.Sheets[meta.backupSheetName]) {
    appendRowsAt(wb.Sheets[meta.backupSheetName], backupRows, meta.backupDataStartRow);
  }
  return XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
}

export function buildFileName(prefix: string): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${prefix}_${today}.xlsx`;
}
