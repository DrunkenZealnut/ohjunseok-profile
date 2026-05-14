// 달빛어린이병원 캠페인 페이지 데이터
// Design: docs/02-design/features/child-hospital.design.md

import type { TimelineItem } from "./crosswalk-police-response";

export interface KeyNumber {
  id: string;
  value: string;
  unit: string;
  label: string;
  accent: "red" | "sky-900" | "sky-600";
  icon: "FileSignature" | "XCircle" | "Hospital";
}

export interface PhotoAsset {
  src: string;
  alt: string;
  caption: string;
  date: string;
  width: number;
  height: number;
}

export interface NextStepItem {
  id: string;
  title: string;
  description: string;
  icon: "Stethoscope" | "Coins" | "Megaphone";
}

export const KEY_NUMBERS: KeyNumber[] = [
  {
    id: "signatures",
    value: "3,025",
    unit: "명",
    label: "동대문구 주민 서명",
    accent: "red",
    icon: "FileSignature",
  },
  {
    id: "ddm",
    value: "0",
    unit: "개소",
    label: "동대문구 달빛어린이병원",
    accent: "sky-900",
    icon: "XCircle",
  },
  {
    id: "nation",
    value: "121",
    unit: "개소",
    label: "전국 운영 중 (2026년)",
    accent: "sky-600",
    icon: "Hospital",
  },
];

export const DELIVERY_PHOTO: PhotoAsset = {
  src: "/child-hospital/signature-delivery.jpg",
  alt: "오준석 진보당 동대문구 지역위원장이 '달빛어린이병원 설치 · 3,025개 주민서명 동대문구청전달' 박스를 동대문구청에 전달하는 모습",
  caption:
    "오준석 진보당 동대문구 지역위원장이 주민 3,025명의 서명을 동대문구청에 전달하고 있다.",
  date: "2026-04-21",
  width: 1280,
  height: 853,
};

export const CAMPAIGN_PHOTO: PhotoAsset = {
  src: "/child-hospital/street-campaign.jpg",
  alt: "이문동 거리 서명 부스에서 진보당 조끼를 입은 활동가가 어린 자녀와 함께 온 부모에게 달빛어린이병원 캠페인을 설명하는 모습",
  caption:
    "거리 서명 부스에서 같은 고민을 하는 동대문 부모들이 직접 발걸음을 멈췄습니다.",
  date: "2026-04",
  width: 3231,
  height: 2187,
};

export const CAMPAIGN_TIMELINE: TimelineItem[] = [
  {
    date: "2026.02",
    label: "달빛어린이병원 추진본부 설립",
    status: "done",
    description: "진보당 동대문구 지역위원회 주도 · 공동본부장 김택연",
  },
  {
    date: "2026.02 ~ 04",
    label: "주민 서명운동 전개",
    status: "done",
    description: "이문동·답십리·전농동 거리에서 3,025명 서명 수집",
  },
  {
    date: "2026.04.21",
    label: "동대문구청 앞 기자회견 + 서명 전달",
    status: "done",
    description: "주민 3,025명의 서명을 동대문구청에 공식 전달",
  },
  {
    date: "다음 단계",
    label: "구의회 진입 후 추진",
    status: "planned",
    description: "참여 병원 발굴 · 재정 지원 확대 · 구청 적극 행정 요구",
  },
];

export const NEXT_STEPS: NextStepItem[] = [
  {
    id: "find-hospital",
    title: "참여 병원 발굴",
    description:
      "동대문구 소아과 의원과 직접 협의해 야간·휴일 운영 인센티브를 안내합니다.",
    icon: "Stethoscope",
  },
  {
    id: "budget",
    title: "재정 지원 확대",
    description:
      "시·구비 운영비 보조금을 예산안에 반영하도록 의회에서 요구합니다.",
    icon: "Coins",
  },
  {
    id: "admin",
    title: "구청 적극 행정",
    description:
      "보건소 차원의 안내·홍보와 미참여 사유 정기 보고 의무화를 추진합니다.",
    icon: "Megaphone",
  },
];

export const ARTICLE_LINK = {
  url: "https://www.ngonews.kr/news/articleView.html?idxno=228739",
  label: "관련 기사: NGO News (2026-04-21)",
} as const;
