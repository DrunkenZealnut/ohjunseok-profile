"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, Send, AlertTriangle } from "lucide-react";

// 설문 종료 플래그 — false로 바꾸면 다시 활성화
const SURVEY_CLOSED = true;

function SurveyClosedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50 px-5">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-xl">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-sky-500" />
        <h2 className="mb-3 text-2xl font-bold text-sky-800">
          설문이 마감되었습니다
        </h2>
        <p className="mb-8 leading-relaxed text-sky-700/80">
          소중한 의견을 보내주신 모든 분들께 감사드립니다.
          <br />
          수집된 의견은 정책에 반영하겠습니다.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-3 font-bold text-white shadow-lg transition hover:-translate-y-0.5"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

const LOCATION_OPTIONS = [
  {
    id: "imunro34",
    label: "이문로34길 사거리",
    desc: "이문교회앞",
    image: "/map-imunro34.png",
  },
  {
    id: "cheonjangsanro",
    label: "이문로·천장산로 사거리",
    desc: "밝은성모안과 · 빽다방 · 이문센트럴정형외과 근처",
    image: "/map-cheonjangsanro.png",
  },
] as const;

type IssueType =
  | "signal_system"
  | "crosswalk_danger"
  | "signal_timer"
  | "night_lighting"
  | "bench_needed"
  | "other";

const ISSUE_OPTIONS: { value: IssueType; label: string }[] = [
  { value: "signal_system", label: "신호체계에 문제가 있다" },
  { value: "crosswalk_danger", label: "횡단보도 주변이 위험하다" },
  { value: "signal_timer", label: "신호등 타이머가 필요하다" },
  { value: "night_lighting", label: "야간에 조명이 필요하다" },
  { value: "bench_needed", label: "잠시 앉아있을 의자가 필요하다" },
  { value: "other", label: "기타" },
];

interface FormData {
  location: string;
  issueTypes: IssueType[];
  detail: string;
  name: string;
  phone: string;
}

export default function SurveyPage() {
  if (SURVEY_CLOSED) {
    return <SurveyClosedPage />;
  }
  return <SurveyForm />;
}

function SurveyForm() {
  const [form, setForm] = useState<FormData>({
    location: "",
    issueTypes: [],
    detail: "",
    name: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function toggleIssue(type: IssueType) {
    setForm((prev) => ({
      ...prev,
      issueTypes: prev.issueTypes.includes(type)
        ? prev.issueTypes.filter((t) => t !== type)
        : [...prev.issueTypes, type],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.location) {
      setError("불편한 위치를 선택해주세요.");
      return;
    }
    if (form.issueTypes.length === 0) {
      setError("불편 유형을 하나 이상 선택해주세요.");
      return;
    }

    setSubmitting(true);

    const { error: dbError } = await supabase
      .from("survey_responses")
      .insert({
        location: LOCATION_OPTIONS.find((o) => o.id === form.location)?.label ?? form.location,
        issue_types: form.issueTypes,
        detail: form.detail.trim() || null,
        respondent_name: form.name.trim() || null,
        phone: form.phone.trim() || null,
      });

    setSubmitting(false);

    if (dbError) {
      setError("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      console.error(dbError);
      return;
    }

    // 이메일 알림 (실패해도 설문 제출 성공 처리)
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "survey",
        location: LOCATION_OPTIONS.find((o) => o.id === form.location)?.label ?? form.location,
        issueTypes: form.issueTypes.map(
          (t) => ISSUE_OPTIONS.find((o) => o.value === t)?.label ?? t
        ),
        detail: form.detail.trim() || null,
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
            의견을 종합해 동대문경찰서에 전달하고
            <br />
            개선을 위해 힘쓰겠습니다.
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
      {/* Header */}
      <header className="bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 px-5 py-16 text-center">
        <span className="mb-4 inline-block rounded-full bg-party-red px-5 py-1.5 text-sm font-bold text-white">
          진보당 동대문구위원회
        </span>
        <h1 className="mb-3 text-4xl font-black text-sky-900 md:text-5xl">
          바로 이 사거리!
        </h1>
        <p className="mb-2 text-xl font-bold text-sky-800 md:text-2xl">
          불편한 신호등·횡단보도 개선 주민 의견 받습니다
        </p>
        <p className="text-sm text-sky-700 md:text-base">
          의견을 종합해 구청과 경찰서에 전달하고 개선을 위해 힘쓰겠습니다.
        </p>

      </header>

      {/* Survey Form */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto -mt-8 max-w-2xl rounded-2xl bg-white px-6 py-10 shadow-xl md:px-10"
      >
        {/* Q1 - Location (map selection) */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              1
            </span>
            불편한 위치가 어디인가요?
            <span className="text-party-red">*</span>
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {LOCATION_OPTIONS.map(({ id, label, desc, image }) => (
              <label
                key={id}
                className={`cursor-pointer overflow-hidden rounded-2xl border-3 transition ${
                  form.location === id
                    ? "border-sky-500 shadow-lg shadow-sky-500/20"
                    : "border-sky-100 hover:border-sky-200"
                }`}
              >
                <input
                  type="radio"
                  name="location"
                  value={id}
                  checked={form.location === id}
                  onChange={() => setForm({ ...form, location: id })}
                  className="sr-only"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={label}
                  className="aspect-square w-full object-cover bg-sky-50"
                />
                <div className="flex items-center gap-3 p-4">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      form.location === id
                        ? "border-sky-500 bg-sky-500"
                        : "border-sky-300"
                    }`}
                  >
                    {form.location === id && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  <div>
                    <p className={`font-bold ${form.location === id ? "text-sky-700" : "text-sky-800"}`}>
                      {label}
                    </p>
                    <p className="mt-0.5 text-xs text-sky-500">{desc}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Q2 - Issue Types */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              2
            </span>
            어떤 점이 불편하신가요?
            <span className="text-party-red">*</span>
            <span className="text-xs font-normal text-sky-400">
              (복수 선택 가능)
            </span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {ISSUE_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition ${
                  form.issueTypes.includes(value)
                    ? "border-sky-500 bg-sky-50 text-sky-800"
                    : "border-sky-100 text-sky-600 hover:border-sky-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.issueTypes.includes(value)}
                  onChange={() => toggleIssue(value)}
                  className="sr-only"
                />
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 text-xs ${
                    form.issueTypes.includes(value)
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-sky-300"
                  }`}
                >
                  {form.issueTypes.includes(value) && "✓"}
                </span>
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Q3 - Detail */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              3
            </span>
            구체적인 의견을 들려주세요
          </legend>
          <textarea
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
            placeholder="예: 이문사거리 보행자 신호가 너무 짧아서 어르신들이 건너기 어렵습니다."
            rows={4}
            className="w-full resize-none rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
          />
        </fieldset>

        {/* Q4 - Contact (optional) */}
        <fieldset className="mb-8">
          <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">
              4
            </span>
            연락처
            <span className="text-xs font-normal text-sky-400">
              (선택사항 — 개선 결과를 안내드립니다)
            </span>
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
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
              <Send className="h-5 w-5" />
              의견 제출하기
            </>
          )}
        </button>

        <p className="mt-4 text-center text-xs text-sky-400">
          수집된 개인정보는 설문 목적 외에 사용되지 않으며, 개선 완료 후
          폐기됩니다.
        </p>
      </form>
    </div>
  );
}
