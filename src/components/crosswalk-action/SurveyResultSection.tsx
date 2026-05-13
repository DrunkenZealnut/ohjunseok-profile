import Link from "next/link";
import {
  BarChart3,
  ArrowRight,
  Footprints,
  Clock,
  AlertTriangle,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import type { Issue } from "@/data/crosswalk-police-response";

const ICON_MAP: Record<Issue["icon"], LucideIcon> = {
  Footprints,
  Clock,
  AlertTriangle,
  MapPin,
};

const ACCENT: Record<
  Issue["accent"],
  { ring: string; iconBg: string; iconText: string; badge: string; quote: string }
> = {
  red: {
    ring: "ring-red-100",
    iconBg: "bg-red-50",
    iconText: "text-red-500",
    badge: "bg-red-100 text-red-700",
    quote: "border-red-200",
  },
  orange: {
    ring: "ring-orange-100",
    iconBg: "bg-orange-50",
    iconText: "text-orange-500",
    badge: "bg-orange-100 text-orange-700",
    quote: "border-orange-200",
  },
  yellow: {
    ring: "ring-yellow-100",
    iconBg: "bg-yellow-50",
    iconText: "text-yellow-600",
    badge: "bg-yellow-100 text-yellow-700",
    quote: "border-yellow-200",
  },
  violet: {
    ring: "ring-violet-100",
    iconBg: "bg-violet-50",
    iconText: "text-violet-500",
    badge: "bg-violet-100 text-violet-700",
    quote: "border-violet-200",
  },
};

interface Props {
  issues: Issue[];
  totalResponses: number;
}

export default function SurveyResultSection({ issues, totalResponses }: Props) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-2 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-sky-600" />
        <h2 className="text-xl font-black text-sky-900 md:text-2xl">
          설문 결과 요약
        </h2>
      </div>
      <p className="mb-6 text-sm text-sky-700/80">
        주민 <strong className="text-sky-900">{totalResponses}건</strong>의
        응답을 분석한 핵심 이슈 4가지입니다.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>

      <div className="mt-6 border-t border-sky-100 pt-5 text-center">
        <Link
          href="/survey-results"
          className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-5 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
        >
          전체 분석 보기 (전문가 소견 포함)
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function IssueCard({ issue }: { issue: Issue }) {
  const Icon = ICON_MAP[issue.icon];
  const a = ACCENT[issue.accent];

  return (
    <article
      className={`rounded-xl bg-white p-5 ring-1 ${a.ring} transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.iconBg}`}>
            <Icon className={`h-5 w-5 ${a.iconText}`} />
          </div>
          <span className="text-xs font-bold text-sky-400">
            #{issue.rank}
          </span>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${a.badge}`}
        >
          {issue.mentionCount}건 언급
        </span>
      </div>
      <h3 className="mb-3 text-base font-bold text-sky-900">{issue.title}</h3>
      <blockquote
        className={`rounded-lg border-l-4 ${a.quote} bg-gray-50 px-3 py-2`}
      >
        <p className="text-sm leading-relaxed text-gray-600">
          &ldquo;{issue.citationQuote}&rdquo;
        </p>
      </blockquote>
    </article>
  );
}
