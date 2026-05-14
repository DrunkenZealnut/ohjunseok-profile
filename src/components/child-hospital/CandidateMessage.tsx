import Image from "next/image";
import { Quote, ExternalLink } from "lucide-react";
import { ARTICLE_LINK, type PhotoAsset } from "@/data/child-hospital";

interface Props {
  photo: PhotoAsset;
}

export default function CandidateMessage({ photo }: Props) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
      <div className="mb-4 flex items-center gap-2">
        <Quote className="h-5 w-5 text-sky-600" />
        <h2 className="text-xl font-black text-sky-900 md:text-2xl">
          오준석의 메시지
        </h2>
      </div>

      <figure className="mb-5 overflow-hidden rounded-xl bg-sky-100">
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
        <figcaption className="px-4 py-3 text-xs text-sky-700/80">
          {photo.caption}
        </figcaption>
      </figure>

      <div className="space-y-4 text-base leading-relaxed text-sky-800">
        <p>
          저도 어린 아이를 키우는 아빠입니다. 밤사이 아이가 갑자기 열이 오를
          때, 동네 병원이 모두 문을 닫아 응급실을 찾아 헤맨 적이 한두 번이
          아닙니다. 같은 동대문 부모라면 한 번쯤 겪어본 일이라고 생각합니다.
        </p>
        <p>
          그래서 2026년 2월, 진보당 동대문구 지역위원회는{" "}
          <strong className="text-sky-900">
            달빛어린이병원 추진본부
          </strong>
          를 만들었습니다. 같은 고민을 하는 부모들과 거리에서 서명을 받았고, 4월
          21일{" "}
          <strong className="text-party-red">
            3,025명의 주민 서명을 동대문구청에 직접 전달
          </strong>
          했습니다.
        </p>
        <p>
          서명은 끝이 아니라 시작입니다. 동대문구청이 참여 병원을 적극적으로
          찾고, 재정을 지원하고, 야간·휴일 진료 공백을 메울 때까지 멈추지
          않겠습니다.
        </p>
      </div>

      <a
        href={ARTICLE_LINK.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 transition hover:text-sky-700"
      >
        {ARTICLE_LINK.label}
        <ExternalLink className="h-3 w-3" />
      </a>
    </section>
  );
}
