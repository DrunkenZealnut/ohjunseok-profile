"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Send, AlertTriangle, Heart } from "lucide-react";


interface FormData {
  name: string;
  residentId1: string;
  residentId2: string;
  phone: string;
  address: string;
  amount: string;
  depositDate: string;
}

export default function DonatePage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    residentId1: "",
    residentId2: "",
    phone: "",
    address: "",
    amount: "",
    depositDate: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

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
      address: form.address.trim(),
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

      {/* Donation Form */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto -mt-8 max-w-2xl rounded-2xl bg-white px-6 py-10 shadow-xl md:px-10"
      >
        {/* 이름 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              1
            </span>
            이름
            <span className="text-party-red">*</span>
          </legend>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="홍길동"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* 주민등록번호 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              2
            </span>
            주민등록번호
            <span className="text-party-red">*</span>
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

        {/* 전화번호 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              3
            </span>
            전화번호
            <span className="text-party-red">*</span>
          </legend>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: formatPhone(e.target.value) })
            }
            placeholder="010-1234-5678"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* 주소 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              4
            </span>
            주소
            <span className="text-party-red">*</span>
          </legend>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="서울시 동대문구 이문동 123-45"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* 후원금 금액 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              5
            </span>
            후원금 금액
            <span className="text-party-red">*</span>
          </legend>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: formatAmount(e.target.value) })
              }
              placeholder="100,000"
              className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 pr-10 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sky-400">
              원
            </span>
          </div>
        </fieldset>

        {/* 입금일자 */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              6
            </span>
            후원금 입금일자
            <span className="text-party-red">*</span>
          </legend>
          <input
            type="date"
            value={form.depositDate}
            onChange={(e) =>
              setForm({ ...form, depositDate: e.target.value })
            }
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
