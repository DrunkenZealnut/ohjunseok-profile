import Image from "next/image";
import { Camera } from "lucide-react";
import type { MeetingPhoto } from "@/data/crosswalk-police-response";

interface Props {
  photo: MeetingPhoto;
}

function formatKoreanDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export default function PoliceMeetingPhoto({ photo }: Props) {
  return (
    <figure className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="relative aspect-[4/3] w-full bg-sky-100">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
      <figcaption className="border-t border-sky-100 bg-sky-50/60 px-5 py-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-sky-600">
          <Camera className="h-3.5 w-3.5" />
          <span>{formatKoreanDate(photo.date)} · 동대문경찰서</span>
        </div>
        <p className="text-sm leading-relaxed text-sky-800">{photo.caption}</p>
      </figcaption>
    </figure>
  );
}
