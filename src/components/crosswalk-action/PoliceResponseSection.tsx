import { ShieldCheck, Clock, Calendar } from "lucide-react";
import type { PoliceResponseSection as ResponseData } from "@/data/crosswalk-police-response";

interface Props {
  response: ResponseData;
}

function formatKoreanDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

export default function PoliceResponseSection({ response }: Props) {
  const isEmpty = response.isPending || response.items.length === 0;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-sky-600" />
        <h2 className="text-xl font-black text-sky-900 md:text-2xl">
          동대문경찰서 답변
        </h2>
      </div>
      <p className="mb-6 text-sm text-sky-700/80">
        {formatKoreanDate(response.meetingDate)} 면담 ·{" "}
        <span className="font-medium text-sky-800">{response.responderRole}</span>
      </p>

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/50 px-6 py-12 text-center">
          <Clock className="mx-auto mb-4 h-10 w-10 text-sky-400" />
          <p className="text-base font-bold text-sky-800">
            답변 내용을 정리하고 있습니다
          </p>
          <p className="mt-2 text-sm text-sky-600">
            곧 이 자리에 동대문경찰서로부터 받은 답변이 업데이트됩니다.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {response.intro && (
            <p className="leading-relaxed text-sky-800">{response.intro}</p>
          )}

          <div className="space-y-4">
            {response.items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border-l-4 border-sky-400 bg-sky-50/60 px-5 py-4"
              >
                {item.heading && (
                  <h3 className="mb-2 text-base font-bold text-sky-900">
                    {item.heading}
                  </h3>
                )}
                <p className="whitespace-pre-line text-sm leading-relaxed text-sky-800">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          {response.followUp && (
            <div className="flex items-start gap-3 rounded-xl bg-amber-50 px-5 py-4">
              <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-sm font-medium leading-relaxed text-amber-900">
                {response.followUp}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
