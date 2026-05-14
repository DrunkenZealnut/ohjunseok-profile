import { BarChart3, FileSignature, XCircle, Hospital } from "lucide-react";
import type { KeyNumber } from "@/data/child-hospital";

interface Props {
  numbers: KeyNumber[];
}

const ICON_MAP = {
  FileSignature,
  XCircle,
  Hospital,
} as const;

const ACCENT_MAP = {
  red: {
    value: "text-party-red",
    badge: "bg-red-50 text-party-red",
  },
  "sky-900": {
    value: "text-sky-900",
    badge: "bg-sky-100 text-sky-800",
  },
  "sky-600": {
    value: "text-sky-600",
    badge: "bg-sky-50 text-sky-600",
  },
} as const;

export default function KeyNumbers({ numbers }: Props) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-2 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-sky-600" />
        <h2 className="text-xl font-black text-sky-900 md:text-2xl">
          숫자가 말하는 현실
        </h2>
      </div>
      <p className="mb-6 text-sm text-sky-700/80">
        주민이 직접 모은 서명, 그리고 동대문구의 현실.
      </p>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {numbers.map((n) => {
          const Icon = ICON_MAP[n.icon];
          const accent = ACCENT_MAP[n.accent];

          return (
            <li
              key={n.id}
              className="rounded-xl border border-sky-100 bg-sky-50/40 p-5 text-center"
            >
              <span
                className={`mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full ${accent.badge}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className={`text-4xl font-black leading-none ${accent.value}`}>
                {n.value}
                <span className="ml-1 text-base font-bold">{n.unit}</span>
              </p>
              <p className="mt-3 text-sm font-medium text-sky-800">{n.label}</p>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-center text-xs text-sky-700/70">
        성북·성동·중랑구 등 인근 자치구는 모두 1곳 이상 운영 중입니다.
      </p>
    </section>
  );
}
