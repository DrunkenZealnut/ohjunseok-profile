import type { Metadata } from "next";
import ChildHospitalHero from "@/components/child-hospital/ChildHospitalHero";
import DeliveryPhoto from "@/components/child-hospital/DeliveryPhoto";
import KeyNumbers from "@/components/child-hospital/KeyNumbers";
import WhatIsDalbit from "@/components/child-hospital/WhatIsDalbit";
import CampaignTimeline from "@/components/child-hospital/CampaignTimeline";
import CandidateMessage from "@/components/child-hospital/CandidateMessage";
import NextSteps from "@/components/child-hospital/NextSteps";
import ShareCta from "@/components/child-hospital/ShareCta";
import {
  KEY_NUMBERS,
  CAMPAIGN_TIMELINE,
  NEXT_STEPS,
  DELIVERY_PHOTO,
  CAMPAIGN_PHOTO,
} from "@/data/child-hospital";

export const metadata: Metadata = {
  title: "달빛어린이병원, 동대문에도 — 오준석",
  description:
    "동대문구는 달빛어린이병원 0개. 주민 3,025명의 서명을 동대문구청에 전달한 활동 기록과 다음 단계 약속을 정리했습니다.",
  openGraph: {
    title: "주민 3,025명과 함께한 달빛어린이병원 요구",
    description:
      "동대문구 야간·휴일 소아 진료 공백, 부모들이 직접 움직였습니다.",
    images: [
      {
        url: "/child-hospital/signature-delivery.jpg",
        width: 1280,
        height: 853,
        alt: "동대문구청에 주민 3,025명 서명을 전달하는 오준석 후보",
      },
    ],
    type: "article",
  },
  twitter: { card: "summary_large_image" },
};

export default function ChildHospitalPage() {
  return (
    <main className="min-h-screen bg-sky-50 pb-20">
      <ChildHospitalHero />

      <div className="mx-auto -mt-10 max-w-3xl space-y-6 px-5 md:-mt-12">
        <DeliveryPhoto photo={DELIVERY_PHOTO} />
        <KeyNumbers numbers={KEY_NUMBERS} />
        <WhatIsDalbit />
        <CampaignTimeline items={CAMPAIGN_TIMELINE} />
        <CandidateMessage photo={CAMPAIGN_PHOTO} />
        <NextSteps items={NEXT_STEPS} />
        <ShareCta />
      </div>
    </main>
  );
}
