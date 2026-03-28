"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, Send } from "lucide-react";
import CheerList from "./cheer-list";

export default function Contact() {
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError("");

    const { error: dbError } = await supabase.from("cheers").insert({
      message: message.trim(),
      name: name.trim() || null,
    });

    setSubmitting(false);

    if (dbError) {
      setError("전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
      console.error(dbError);
      return;
    }

    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cheer",
        message: message.trim(),
        name: name.trim() || null,
      }),
    }).catch((err) => console.error("Email notify failed:", err));

    setMessage("");
    setName("");
    setRefreshKey((k) => k + 1);
  }

  return (
    <section className="bg-white px-5 py-20 text-center">
      <h2 className="mb-10 text-3xl font-black text-sky-800 after:mx-auto after:mt-3 after:block after:h-1 after:w-15 after:rounded-full after:bg-sky-500">
        오준석에게 응원 보내기
      </h2>

      <p className="mx-auto mb-10 max-w-lg text-lg leading-loose text-sky-700/80">
        이문동의 변화는 주민 여러분의 관심과 참여에서 시작됩니다.
        <br />
        따뜻한 한마디가 큰 힘이 됩니다.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-md space-y-4"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 (선택사항)"
          className="w-full rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="응원 메시지를 남겨주세요"
          rows={3}
          className="w-full resize-none rounded-xl border-2 border-sky-200 px-4 py-3 text-sky-900 placeholder:text-sky-300 focus:border-sky-500 focus:outline-none"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !message.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 py-4 text-lg font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {submitting ? (
            "보내는 중..."
          ) : (
            <>
              <Send className="h-5 w-5" />
              응원 보내기
            </>
          )}
        </button>
      </form>

      <CheerList refreshKey={refreshKey} />
    </section>
  );
}
