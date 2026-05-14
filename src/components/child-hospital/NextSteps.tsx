import { Target, Stethoscope, Coins, Megaphone } from "lucide-react";
import type { NextStepItem } from "@/data/child-hospital";

interface Props {
  items: NextStepItem[];
}

const ICON_MAP = {
  Stethoscope,
  Coins,
  Megaphone,
} as const;

export default function NextSteps({ items }: Props) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-2 flex items-center gap-2">
        <Target className="h-5 w-5 text-sky-600" />
        <h2 className="text-xl font-black text-sky-900 md:text-2xl">
          구의원이 되면 약속드립니다
        </h2>
      </div>
      <p className="mb-6 text-sm text-sky-700/80">
        주민이 모아준 3,025개의 서명이 가리킨 다음 단계입니다.
      </p>

      <ul className="space-y-4">
        {items.map((item, i) => {
          const Icon = ICON_MAP[item.icon];
          return (
            <li
              key={item.id}
              className="flex gap-4 rounded-xl border border-sky-100 bg-sky-50/40 p-4 md:p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                <Icon className="h-5 w-5 text-sky-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-sky-500">{`약속 ${i + 1}`}</p>
                <p className="mt-1 text-base font-bold text-sky-900">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-sky-700/80">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
