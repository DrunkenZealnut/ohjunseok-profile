import Image from "next/image";
import { CANDIDATE, STATEMENT } from "@/data/pamphlet";

export default function Story() {
  return (
    <section
      id="story"
      className="bg-gradient-to-b from-sky-50 to-white px-5 py-20"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-black leading-tight text-sky-900 md:text-4xl">
          {STATEMENT.headline.split("\n").map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-[18rem_1fr] md:items-start">
          <div className="mx-auto w-full max-w-[18rem] md:mx-0">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-sky-100 shadow-md">
              <Image
                src={CANDIDATE.photo.src}
                alt={CANDIDATE.photo.alt}
                fill
                sizes="18rem"
                className="object-cover"
              />
            </div>
          </div>

          <div className="space-y-5">
            {STATEMENT.bodies.map((text, i) => (
              <p
                key={i}
                className="text-base leading-relaxed text-sky-800 md:text-lg"
              >
                {text}
              </p>
            ))}

            <div className="rounded-2xl border border-sky-200 bg-white/70 p-6 backdrop-blur-sm">
              <p className="text-sm font-bold uppercase tracking-wider text-party-red">
                {STATEMENT.highlighted.highlight.topic}
              </p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-4xl font-black text-sky-900 md:text-5xl">
                  {STATEMENT.highlighted.highlight.signatures.toLocaleString()}
                </span>
                <span className="text-base font-bold text-sky-700">
                  명의 서명
                </span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-sky-700/90">
                {STATEMENT.highlighted.text}
              </p>
            </div>
          </div>
        </div>

        <blockquote className="mt-10 border-l-4 border-party-red bg-white px-5 py-4 text-lg font-bold leading-relaxed text-sky-900 shadow-sm md:text-xl">
          {STATEMENT.cta}
        </blockquote>
      </div>
    </section>
  );
}
