"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copyLink}
      className="inline-flex items-center gap-2 rounded-full border-2 border-sky-200 bg-white px-5 py-2 text-sm font-medium text-sky-600 transition hover:bg-sky-50"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          복사 완료!
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          링크 복사하기
        </>
      )}
    </button>
  );
}
