import { CheckCircle2, Loader2, Circle, ListChecks } from "lucide-react";
import type { TimelineItem } from "@/data/crosswalk-police-response";

interface Props {
  items: TimelineItem[];
}

const STATUS_CONFIG = {
  done: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    lineColor: "bg-emerald-200",
    labelColor: "text-sky-900",
  },
  in_progress: {
    icon: Loader2,
    iconColor: "text-amber-500",
    lineColor: "bg-amber-200",
    labelColor: "text-sky-900",
  },
  planned: {
    icon: Circle,
    iconColor: "text-gray-300",
    lineColor: "bg-gray-200",
    labelColor: "text-sky-700/70",
  },
} as const;

export default function CampaignTimeline({ items }: Props) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-2 flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-sky-600" />
        <h2 className="text-xl font-black text-sky-900 md:text-2xl">
          추진 과정
        </h2>
      </div>
      <p className="mb-6 text-sm text-sky-700/80">
        추진본부 설립부터 동대문구청 서명 전달까지, 그리고 다음 단계.
      </p>

      <ol className="space-y-0">
        {items.map((item, i) => {
          const cfg = STATUS_CONFIG[item.status];
          const Icon = cfg.icon;
          const isLast = i === items.length - 1;

          return (
            <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <div
                  className={`absolute left-[11px] top-7 h-full w-0.5 ${cfg.lineColor}`}
                  aria-hidden
                />
              )}
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
                <Icon
                  className={`h-6 w-6 ${cfg.iconColor} ${
                    item.status === "in_progress" ? "animate-spin" : ""
                  }`}
                />
              </div>
              <div className="-mt-0.5 flex-1">
                <p className="text-xs font-bold text-sky-500">{item.date}</p>
                <p className={`mt-1 text-base font-bold ${cfg.labelColor}`}>
                  {item.label}
                </p>
                {item.description && (
                  <p className="mt-1 text-sm text-sky-700/70">
                    {item.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
