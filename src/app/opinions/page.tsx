"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Send, AlertTriangle } from "lucide-react";

const CATEGORIES = [
  "교통",
  "안전",
  "환경",
  "복지",
  "교육",
  "기타",
] as const;

interface FormData {
  category: string;
  title: string;
  content: string;
  name: string;
  phone: string;
}

export default function OpinionsPage() {
  const [form, setForm] = useState<FormData>({
    category: "",
    title: "",
    content: "",
    name: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.category) {
      setError("카테고리를 선택해주세요.");
      return;
    }
    if (!form.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!form.content.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    setSubmitting(true);

    const { error: dbError } = await supabase.from("opinions").insert({
      category: form.category,
      title: form.title.trim(),
      content: form.content.trim(),
      name: form.name.trim() || null,
      phone: form.phone.trim() || null,
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
        type: "opinion",
        category: form.category,
        title: form.title.trim(),
        content: form.content.trim(),
        name: form.name.trim() || null,
        phone: form.phone.trim() || null,
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
            소중한 의견 감사합니다!
          </h2>
          <p className="mb-8 leading-relaxed text-sky-700/80">
            주민 여러분의 목소리를 귀담아 듣고
            <br />
            더 나은 이문동을 만들겠습니다.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-block rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5"
          >
            다른 의견 제출하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 pb-20">
      <header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 pt-28 pb-12 text-center">
        <h1 className="text-4xl font-black text-sky-900">주민 의견함</h1>
        <p className="mt-3 text-sky-700">
          이문동의 생활 불편이나 개선 의견을
          <br />
          자유롭게 남겨주세요
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl rounded-2xl bg-white px-6 py-10 shadow-xl md:px-10"
      >
        {/* Category */}
        <fieldset className="mb-6">
          <label className="mb-2 block text-sm font-bold text-sky-800">
            카테고리 <span className="text-party-red">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className={`rounded-xl border-2 py-2 text-sm font-medium transition ${
                  form.category === cat
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-sky-100 text-sky-500 hover:border-sky-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Title */}
        <fieldset className="mb-6">
          <label className="mb-2 block text-sm font-bold text-sky-800">
            제목 <span className="text-party-red">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="의견 제목을 입력해주세요"
            maxLength={50}
            className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* Content */}
        <fieldset className="mb-6">
          <label className="mb-2 block text-sm font-bold text-sky-800">
            내용 <span className="text-party-red">*</span>
          </label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="구체적인 내용을 적어주세요"
            rows={5}
            className="w-full resize-none rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* Contact */}
        <fieldset className="mb-8">
          <label className="mb-2 block text-sm font-bold text-sky-800">
            연락처{" "}
            <span className="text-xs font-normal text-sky-400">
              (선택 — 개선 결과를 안내드립니다)
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="이름"
              className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="전화번호"
              className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
            />
          </div>
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
              의견 제출하기
            </>
          )}
        </button>
      </form>
    </div>
  );
}
