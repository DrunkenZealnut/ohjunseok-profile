import Image from "next/image";
import { CANDIDATE, CAREER_HIGHLIGHTS } from "@/data/pamphlet";

export default function Profile() {
  return (
    <section
      id="profile"
      className="relative z-10 mx-auto -mt-16 max-w-3xl rounded-2xl bg-white px-6 py-14 shadow-xl md:px-10"
    >
      <h2 className="mb-10 text-center text-3xl font-black text-sky-800 after:mx-auto after:mt-3 after:block after:h-1 after:w-15 after:rounded-full after:bg-sky-500">
        후보 소개
      </h2>

      <div className="grid gap-8 md:grid-cols-[14rem_1fr] md:items-start">
        <div className="mx-auto w-full max-w-[14rem] md:mx-0">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-sky-100">
            <Image
              src={CANDIDATE.photo.src}
              alt={CANDIDATE.photo.alt}
              fill
              sizes="14rem"
              className="object-cover"
            />
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-party-red text-3xl font-black leading-none text-white">
              {CANDIDATE.number}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-party-red">
                기호 {CANDIDATE.number}번
              </p>
              <p className="text-lg font-black text-sky-800">
                {CANDIDATE.party}
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-3xl font-black text-sky-800">
            {CANDIDATE.name}
            <span className="ml-2 align-middle text-base font-medium text-sky-700/70">
              ({CANDIDATE.nameHanja})
            </span>
          </p>

          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-bold text-sky-700/70">생년월일</dt>
            <dd className="text-sky-800">
              {CANDIDATE.birthDate}{" "}
              <span className="text-sky-700/60">({CANDIDATE.age}세)</span>
            </dd>

            <dt className="font-bold text-sky-700/70">학력</dt>
            <dd className="text-sky-800">{CANDIDATE.education}</dd>

            <dt className="font-bold text-sky-700/70">출마 지역</dt>
            <dd className="text-sky-800">{CANDIDATE.district}</dd>

            <dt className="font-bold text-sky-700/70">슬로건</dt>
            <dd className="text-sky-800">{CANDIDATE.slogan}</dd>
          </dl>

          <div className="mt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-sky-500">
              핵심 경력
            </p>
            <ul className="space-y-2">
              {CAREER_HIGHLIGHTS.map((item, i) => (
                <li
                  key={`${item.status}-${i}`}
                  className="flex items-start gap-2 text-sm leading-relaxed text-sky-800"
                >
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-black ${
                      item.status === "현"
                        ? "bg-sky-100 text-sky-700"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
