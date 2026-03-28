"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Send, AlertTriangle } from "lucide-react";

const OBSERVER_TYPES = [
  { value: "투표참관인", label: "투표참관인", desc: "투표일 당일 투표소에서 투표 과정을 참관합니다" },
  { value: "개표참관인", label: "개표참관인", desc: "개표소에서 개표 과정을 참관합니다" },
] as const;

interface FormData {
  name: string;
  phone: string;
  address: string;
  observerType: string[];
  availableDate: string;
  message: string;
}

export default function ObserverPage() {
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    address: "",
    observerType: [],
    availableDate: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function toggleType(type: string) {
    setForm((prev) => ({
      ...prev,
      observerType: prev.observerType.includes(type)
        ? prev.observerType.filter((t) => t !== type)
        : [...prev.observerType, type],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    if (!form.phone.trim()) {
      setError("연락처를 입력해주세요.");
      return;
    }
    if (form.observerType.length === 0) {
      setError("참관 유형을 하나 이상 선택해주세요.");
      return;
    }

    setSubmitting(true);

    const { error: dbError } = await supabase.from("poll_observers").insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim() || null,
      observer_type: form.observerType,
      available_date: form.availableDate.trim() || null,
      message: form.message.trim() || null,
    });

    setSubmitting(false);

    if (dbError) {
      setError("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      console.error(dbError);
      return;
    }

    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "observer",
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || null,
        observerType: form.observerType,
        availableDate: form.availableDate.trim() || null,
        message: form.message.trim() || null,
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
            참관인 신청 감사합니다!
          </h2>
          <p className="mb-8 leading-relaxed text-sky-700/80">
            공정한 선거를 위해 함께해 주셔서
            <br />
            진심으로 감사드립니다.
            <br />
            담당자가 곧 연락드리겠습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      <header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 pt-28 pb-12 text-center">
        <h1 className="text-4xl font-black text-sky-900">
          투개표참관인 신청
        </h1>
        <p className="mt-3 text-sky-700">
          공정한 선거를 함께 지켜주세요!
        </p>
      </header>

      {/* 안내 문구 */}
      <div className="mx-auto mb-8 max-w-2xl rounded-2xl bg-sky-100/50 px-6 py-6 text-center">
        <p className="leading-relaxed text-sky-700">
          투개표참관인은 선거의 공정성을
          <br className="sm:hidden" />
          감시하는 <strong>시민의 권리</strong>입니다.
          <br />
          특별한 자격 없이 <strong>누구나</strong> 신청할 수 있습니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-2xl bg-white px-6 py-10 shadow-xl md:px-10"
      >
        {/* Name */}
        <fieldset className="mb-6">
          <label className="mb-2 block text-sm font-bold text-sky-800">
            이름 <span className="text-party-red">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="이름"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* Phone */}
        <fieldset className="mb-6">
          <label className="mb-2 block text-sm font-bold text-sky-800">
            연락처 <span className="text-party-red">*</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="전화번호"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* Address */}
        <fieldset className="mb-6">
          <label className="mb-2 block text-sm font-bold text-sky-800">
            거주지{" "}
            <span className="text-xs font-normal text-sky-400">(선택)</span>
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="예: 이문1동"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* Observer Type */}
        <fieldset className="mb-6">
          <label className="mb-3 block text-sm font-bold text-sky-800">
            참관 유형 <span className="text-party-red">*</span>
          </label>
          <div className="space-y-3">
            {OBSERVER_TYPES.map(({ value, label, desc }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-4 transition ${
                  form.observerType.includes(value)
                    ? "border-sky-500 bg-sky-50"
                    : "border-sky-100 hover:border-sky-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.observerType.includes(value)}
                  onChange={() => toggleType(value)}
                  className="sr-only"
                />
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs ${
                    form.observerType.includes(value)
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-sky-300"
                  }`}
                >
                  {form.observerType.includes(value) && "✓"}
                </span>
                <div>
                  <p className="font-bold text-sky-800">{label}</p>
                  <p className="mt-0.5 text-xs text-sky-500">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Available Date */}
        <fieldset className="mb-6">
          <label className="mb-2 block text-sm font-bold text-sky-800">
            가능한 시간{" "}
            <span className="text-xs font-normal text-sky-400">(선택)</span>
          </label>
          <input
            type="text"
            value={form.availableDate}
            onChange={(e) =>
              setForm({ ...form, availableDate: e.target.value })
            }
            placeholder="예: 투표일 오전, 종일 가능"
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* Message */}
        <fieldset className="mb-8">
          <label className="mb-2 block text-sm font-bold text-sky-800">
            하고 싶은 말{" "}
            <span className="text-xs font-normal text-sky-400">(선택)</span>
          </label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="참관 경험이 있으시거나 하고 싶은 말씀을 남겨주세요"
            rows={3}
            className="w-full resize-none rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 py-4 text-lg font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {submitting ? (
            "제출 중..."
          ) : (
            <>
              <Send className="h-5 w-5" />
              참관인 신청하기
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-sky-400">
          수집된 개인정보는 참관인 안내 목적 외에 사용되지 않습니다.
        </p>
      </form>
    </div>
  );
}
