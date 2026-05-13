import Link from "next/link";
import { MessageSquare, ArrowRight } from "lucide-react";

export default function OpinionsLink() {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 p-6 text-center md:p-8">
      <h2 className="mb-2 text-xl font-black text-sky-900">
        다른 의견이나 제안이 있으신가요?
      </h2>
      <p className="mb-6 text-sm text-sky-800/80">
        주민의견 페이지에 직접 의견을 남겨주세요.
      </p>
      <Link
        href="/opinions"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5"
      >
        <MessageSquare className="h-4 w-4" />
        주민의견 페이지로 가기
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
