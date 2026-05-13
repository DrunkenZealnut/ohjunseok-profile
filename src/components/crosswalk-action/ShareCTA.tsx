"use client";

import { useState } from "react";
import Link from "next/link";
import { Share2, Link2, Check, BarChart3, MessageSquare } from "lucide-react";

export default function ShareCTA() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = "이문동 횡단보도 25건 의견, 동대문경찰서 전달 완료";
    const text =
      "주민이 모은 횡단보도 개선 의견을 동대문경찰서에 직접 전달했습니다.";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // 사용자 취소 또는 미지원 — 클립보드 fallback 으로 진행
      }
    }
    await handleCopy();
  }

  async function handleCopy() {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard 실패 시 무시
    }
  }

  return (
    <section className="rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 p-6 text-center md:p-8">
      <h2 className="mb-2 text-xl font-black text-sky-900">
        이웃에게도 알려주세요
      </h2>
      <p className="mb-6 text-sm text-sky-800/80">
        여러분의 한 번의 공유가 안전한 횡단보도를 만듭니다.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/survey-results"
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <BarChart3 className="h-4 w-4" />
          전체 분석 보기
        </Link>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5"
        >
          <Share2 className="h-4 w-4" />
          공유하기
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" />
              복사 완료!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              링크 복사
            </>
          )}
        </button>
      </div>

      <div className="mt-6 border-t border-sky-300/40 pt-5">
        <Link
          href="/crosswalk-survey"
          className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:underline"
        >
          <MessageSquare className="h-4 w-4" />
          아직 의견을 못 주셨나요? 설문 참여하기 →
        </Link>
      </div>
    </section>
  );
}
