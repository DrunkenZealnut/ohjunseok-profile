import Link from "next/link";
import { MessageSquare, Heart, ArrowRight } from "lucide-react";

export default function ShareCta() {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-sky-100 to-sky-200 p-6 text-center md:p-8">
      <h2 className="mb-2 text-xl font-black text-sky-900 md:text-2xl">
        달빛어린이병원, 함께 만들어 갑시다
      </h2>
      <p className="mb-6 text-sm text-sky-800/80">
        의견을 보내주시거나, 후보 활동을 응원해 주세요.
      </p>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/opinions"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5"
        >
          <MessageSquare className="h-4 w-4" />
          의견 보내기
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/donate"
          className="inline-flex items-center gap-2 rounded-xl bg-party-red px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:-translate-y-0.5"
        >
          <Heart className="h-4 w-4" />
          응원하기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
