"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, AlertTriangle, Heart, Search } from "lucide-react";

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string }) => void;
      }) => { open: () => void };
    };
  }
}

interface FormData {
  name: string;
  isAnonymous: boolean;
  residentId1: string;
  residentId2: string;
  phone: string;
  email: string;
  postalCode: string;
  address: string;
  detailAddress: string;
  amount: string;
  depositDate: string;
}

export default function DonatePage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    isAnonymous: false,
    residentId1: "",
    residentId2: "",
    phone: "",
    email: "",
    postalCode: "",
    address: "",
    detailAddress: "",
    amount: "",
    depositDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function openDaumPostcode() {
    const run = () => {
      new window.daum!.Postcode({
        oncomplete(data) {
          setForm((f) => ({
            ...f,
            postalCode: data.zonecode,
            address: data.roadAddress || data.jibunAddress,
            detailAddress: "",
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

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  function formatAmount(value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("ko-KR");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (form.residentId1.length !== 6 || form.residentId2.length !== 7) {
      setError("주민등록번호를 정확히 입력해주세요.");
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("전화번호를 정확히 입력해주세요.");
      return;
    }
    if (!form.address.trim()) {
      setError("주소를 입력해주세요.");
      return;
    }
    if (!form.amount || Number(form.amount.replace(/,/g, "")) <= 0) {
      setError("후원금 금액을 입력해주세요.");
      return;
    }
    if (!form.depositDate) {
      setError("입금일자를 선택해주세요.");
      return;
    }

    setSubmitting(true);

    const residentId = `${form.residentId1}-${form.residentId2}`;
    const amountNumber = Number(form.amount.replace(/,/g, ""));
    const { error: dbError } = await supabase.from("donations").insert({
      donor_name: form.name.trim(),
      resident_id: residentId,
      phone: form.phone.trim(),
      postal_code: form.postalCode.trim() || null,
      address: form.address.trim(),
      detail_address: form.detailAddress.trim() || null,
      email: form.email.trim() || null,
      is_anonymous: form.isAnonymous,
      amount: amountNumber,
      deposit_date: form.depositDate,
    });

    setSubmitting(false);

    if (dbError) {
      setError("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      console.error(dbError);
      return;
    }

    // 이메일 알림 (실패해도 제출 성공 처리)
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "donation",
        name: form.name.trim(),
        amount: amountNumber,
        depositDate: form.depositDate,
      }),
    }).catch((err) => console.error("Email notify failed:", err));

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50 px-5">
        <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xl">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-3 text-2xl font-bold text-sky-800">
            후원금 입금정보가 접수되었습니다!
          </h2>
          <p className="mb-8 leading-relaxed text-sky-700/80">
            소중한 후원에 깊이 감사드립니다.
            <br />
            기부금영수증은 확인 후 발급해 드리겠습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            추가 입력하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 py-16 text-center">
        <h1 className="mb-3 text-4xl font-black text-sky-900 md:text-5xl">
          후원금 입금정보 입력
        </h1>
        <p className="mb-2 text-xl font-bold text-sky-800 md:text-2xl">
          오준석 후보 후원 기부금영수증 발급 안내
        </p>
        <p className="text-sm text-sky-700 md:text-base">
          기부금영수증 발급을 위해 아래 정보를 정확히 입력해주세요.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto -mt-8 max-w-2xl rounded-2xl bg-white px-6 py-10 shadow-xl md:px-10"
      >
        {/* 1. 이름 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              1
            </span>
            이름
            <span className="text-red-500">*</span>
          </legend>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="홍길동"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* 2. 주민등록번호 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              2
            </span>
            주민등록번호
            <span className="text-red-500">*</span>
          </legend>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={form.residentId1}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setForm({ ...form, residentId1: v });
              }}
              placeholder="생년월일 6자리"
              className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-center text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
            />
            <span className="text-2xl font-bold text-sky-300">-</span>
            <input
              type="password"
              inputMode="numeric"
              maxLength={7}
              value={form.residentId2}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 7);
                setForm({ ...form, residentId2: v });
              }}
              placeholder="뒷자리 7자리"
              className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-center text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-sky-400">
            기부금영수증 발급을 위해 필요하며, 안전하게 보호됩니다.
          </p>
        </fieldset>

        {/* 3. 전화번호 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              3
            </span>
            전화번호
            <span className="text-red-500">*</span>
          </legend>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
            placeholder="010-1234-5678"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* 4. 이메일 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              4
            </span>
            이메일
            <span className="ml-1 text-sm font-normal text-sky-400">(선택)</span>
          </legend>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="example@email.com"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* 5. 주소 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              5
            </span>
            주소
            <span className="text-red-500">*</span>
          </legend>

          {/* 우편번호 검색 */}
          <div className="mb-3">
            <button
              type="button"
              onClick={openDaumPostcode}
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 font-bold text-white transition hover:bg-sky-600"
            >
              <Search className="h-4 w-4" />
              주소 검색
            </button>
          </div>

          {/* 우편번호 + 도로명주소 */}
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={form.postalCode}
              onChange={(e) =>
                setForm({
                  ...form,
                  postalCode: e.target.value.replace(/\D/g, "").slice(0, 5),
                })
              }
              placeholder="우편번호"
              maxLength={5}
              className="w-28 rounded-xl border-2 border-sky-200 px-4 py-3 text-center font-mono text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
            />
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="도로명 주소"
              className="flex-1 rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* 상세 주소 */}
          <input
            type="text"
            value={form.detailAddress}
            onChange={(e) => setForm({ ...form, detailAddress: e.target.value })}
            placeholder="상세 주소 (동, 호수 등)"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* 6. 후원금 금액 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              6
            </span>
            후원금 금액
            <span className="text-red-500">*</span>
          </legend>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: formatAmount(e.target.value) })}
              placeholder="100,000"
              className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 pr-10 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sky-400">
              원
            </span>
          </div>
        </fieldset>

        {/* 7. 입금일자 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              7
            </span>
            후원금 입금일자
            <span className="text-red-500">*</span>
          </legend>
          <input
            type="date"
            value={form.depositDate}
            onChange={(e) => setForm({ ...form, depositDate: e.target.value })}
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 py-4 text-lg font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {submitting ? (
            "제출 중..."
          ) : (
            <>
              <Heart className="h-5 w-5" />
              후원정보 제출하기
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-sky-400">
          수집된 개인정보는 기부금영수증 발급 목적으로만 사용되며, 관련 법령에
          따라 안전하게 관리됩니다.
        </p>
      </form>
    </div>
  );
}
