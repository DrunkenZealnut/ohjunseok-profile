import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ACHIEVEMENTS, type Achievement } from "@/data/pamphlet";

type CardVariant = "feature" | "compact";

export default function HomeActionCards() {
  const [feature, ...rest] = ACHIEVEMENTS;

  return (
    <section className="mx-auto max-w-5xl px-5 py-14">
      <h2 className="mb-6 text-2xl font-black text-sky-900 md:text-3xl">
        최근 활동
      </h2>

      {feature && <AchievementCard achievement={feature} variant="feature" />}

      {rest.length > 0 && (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {rest.map((a) => (
            <li key={a.id}>
              <AchievementCard achievement={a} variant="compact" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const STYLES = {
  feature: {
    container: "overflow-hidden rounded-2xl bg-white shadow-sm",
    linkExtras: "block transition hover:-translate-y-0.5 hover:shadow-md",
    layout: "md:flex",
    imageWrap: "relative aspect-[3/2] w-full md:aspect-auto md:w-1/2",
    body: "p-6 md:w-1/2 md:p-8",
    title: "mb-3 text-lg font-black leading-snug text-sky-900 md:text-xl",
    summary: "mb-4 text-sm leading-relaxed text-sky-700",
    metricValue: "text-2xl font-black text-sky-900",
    metricLabel: "text-sm font-bold text-sky-700",
    imageSizes: "(max-width: 768px) 100vw, 50vw",
  },
  compact: {
    container: "h-full overflow-hidden rounded-2xl bg-white shadow-sm",
    linkExtras:
      "block h-full transition hover:-translate-y-0.5 hover:shadow-md",
    layout: "",
    imageWrap: "relative aspect-[16/9]",
    body: "p-5",
    title: "mb-2 text-base font-black leading-snug text-sky-900",
    summary: "mb-3 text-sm leading-relaxed text-sky-700/90",
    metricValue: "text-xl font-black text-sky-900",
    metricLabel: "text-xs font-bold text-sky-700",
    imageSizes: "(max-width: 768px) 100vw, 50vw",
  },
} as const;

function AchievementCard({
  achievement,
  variant,
}: {
  achievement: Achievement;
  variant: CardVariant;
}) {
  const s = STYLES[variant];

  const inner = (
    <div className={s.layout}>
      <div className={s.imageWrap}>
        <Image
          src={achievement.image.src}
          alt={achievement.image.alt}
          fill
          sizes={s.imageSizes}
          className="object-cover"
        />
      </div>
      <div className={s.body}>
        <p className="mb-2 text-xs font-bold text-party-red">
          {achievement.date} · {achievement.location}
        </p>
        <h3 className={s.title}>{achievement.title}</h3>
        <p className={s.summary}>{achievement.summary}</p>
        {achievement.metric && (
          <p className="mb-3 flex items-baseline gap-1.5">
            <span className={s.metricValue}>{achievement.metric.value}</span>
            <span className={s.metricLabel}>{achievement.metric.label}</span>
          </p>
        )}
        {achievement.href && (
          <span className="inline-flex items-center gap-1 text-sm font-bold text-sky-600 transition group-hover:gap-2">
            자세히 보기
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );

  if (achievement.href) {
    return (
      <Link
        href={achievement.href}
        className={`group ${s.container} ${s.linkExtras}`}
      >
        {inner}
      </Link>
    );
  }

  return <article className={s.container}>{inner}</article>;
}
