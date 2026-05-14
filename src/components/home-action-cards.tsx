import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomeActionCards() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-10 md:py-14">
      <h2 className="mb-6 text-xl font-black text-sky-900 md:text-2xl">
        최근 활동
      </h2>

      <Link
        href="/child-hospital"
        className="group block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="md:flex">
          <div className="relative aspect-[3/2] w-full md:aspect-auto md:w-1/2">
            <Image
              src="/child-hospital/signature-delivery.jpg"
              alt="동대문구청에 주민 3,025명 서명을 전달하는 오준석 후보"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="p-6 md:w-1/2 md:p-8">
            <p className="mb-2 text-xs font-bold text-party-red">
              2026.04.21 · 동대문구청
            </p>
            <h3 className="mb-3 text-lg font-black leading-snug text-sky-900 md:text-xl">
              주민 3,025명과 함께한 달빛어린이병원 요구
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-sky-700">
              동대문구는 달빛어린이병원 0개. 야간·휴일 소아 진료 공백을 메우기
              위한 활동 기록과 다음 단계 약속.
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-sky-600 transition group-hover:gap-2">
              자세히 보기
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
