"use client";

import { useState } from "react";
import { Lock, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("잘못된 비밀번호입니다");
      setLoading(false);
      return;
    }

    const { token } = await res.json();
    sessionStorage.setItem("admin_token", token);
    window.location.href = "/admin";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 text-center">
          <Lock className="mx-auto mb-3 h-12 w-12 text-sky-500" />
          <h1 className="text-xl font-bold text-gray-800">관리자 로그인</h1>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoFocus
          className="mb-4 w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-sky-500 focus:outline-none"
        />

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-xl bg-sky-600 py-3 font-bold text-white transition hover:bg-sky-700 disabled:opacity-50"
        >
          {loading ? "확인 중..." : "로그인"}
        </button>
      </form>
    </div>
  );
}
