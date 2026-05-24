"use client";

import { useState } from "react";
import { Baby, ChevronDown, Route, Users } from "lucide-react";
import {
  PLEDGE_CATEGORIES,
  type PledgeAccentColor,
  type PledgeCategory,
  type PledgeCategoryId,
  type PledgeIconId,
} from "@/data/pamphlet";

const ICONS: Record<PledgeIconId, typeof Baby> = {
  Baby,
  Users,
  Route,
};

const ACCENT_STYLES: Record<
  PledgeAccentColor,
  {
    border: string;
    headerBg: string;
    iconBg: string;
    iconText: string;
    watermark: string;
    bullet: string;
  }
> = {
  sky: {
    border: "border-sky-200",
    headerBg: "bg-sky-50",
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
    watermark: "text-sky-200",
    bullet: "bg-sky-400",
  },
  amber: {
    border: "border-amber-200",
    headerBg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
    watermark: "text-amber-200",
    bullet: "bg-amber-400",
  },
  emerald: {
    border: "border-emerald-200",
    headerBg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    watermark: "text-emerald-200",
    bullet: "bg-emerald-400",
  },
};

const INITIAL_EXPANDED: Record<PledgeCategoryId, boolean> = {
  child: true,
  together: true,
  transit: true,
};

export default function Pledges() {
  const [expanded, setExpanded] =
    useState<Record<PledgeCategoryId, boolean>>(INITIAL_EXPANDED);

  const toggle = (id: PledgeCategoryId) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section id="pledges" className="mx-auto max-w-5xl px-5 py-20">
      <h2 className="mb-3 text-center text-3xl font-black text-sky-800 after:mx-auto after:mt-3 after:block after:h-1 after:w-15 after:rounded-full after:bg-sky-500">
        주요 공약
      </h2>
      <p className="mb-12 text-center text-sm text-sky-700/80 md:text-base">
        공식 책자형 선거공보물 기준 · 3대 카테고리 ·{" "}
        {PLEDGE_CATEGORIES.reduce((n, c) => n + c.pledges.length, 0)}개 공약
      </p>

      <div className="grid gap-6 md:grid-cols-3">
        {PLEDGE_CATEGORIES.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            expanded={expanded[category.id]}
            onToggle={() => toggle(category.id)}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  expanded,
  onToggle,
}: {
  category: PledgeCategory;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = ICONS[category.icon];
  const styles = ACCENT_STYLES[category.accentColor];
  const panelId = `pledges-panel-${category.id}`;

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border ${styles.border} bg-white shadow-sm`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute -right-2 -top-6 text-[8rem] font-black leading-none ${styles.watermark}`}
      >
        {category.number}
      </span>

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className={`flex w-full items-start gap-4 p-6 text-left ${styles.headerBg} md:cursor-default md:pointer-events-none`}
      >
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}
        >
          <Icon className={`h-6 w-6 ${styles.iconText}`} strokeWidth={1.75} />
        </span>
        <span className="flex-1">
          <span className="block text-lg font-black leading-tight text-sky-900">
            {category.title}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-sky-700/80">
            {category.description}
          </span>
        </span>
        <ChevronDown
          aria-hidden
          className={`mt-1 h-5 w-5 shrink-0 text-sky-700 transition-transform md:hidden ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={panelId}
        className={`grid overflow-hidden px-6 transition-[grid-template-rows] duration-300 ease-out md:grid-rows-[1fr] md:pb-6 ${
          expanded ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr] pb-0"
        }`}
      >
        <ul className="min-h-0 space-y-3 overflow-hidden pt-2">
          {category.pledges.map((p) => (
            <li
              key={p.id}
              className="flex items-start gap-3 text-sm leading-relaxed text-sky-800"
            >
              <span
                aria-hidden
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${styles.bullet}`}
              />
              <span>
                <span className="font-medium">{p.title}</span>
                {p.note && (
                  <span className="ml-1 text-xs text-sky-700/70">
                    ({p.note})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
