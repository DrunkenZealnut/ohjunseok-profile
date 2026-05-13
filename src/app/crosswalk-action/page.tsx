import type { Metadata } from "next";
import ActionHero from "@/components/crosswalk-action/ActionHero";
import PoliceMeetingPhoto from "@/components/crosswalk-action/PoliceMeetingPhoto";
import SurveyResultSection from "@/components/crosswalk-action/SurveyResultSection";
import PoliceResponseSection from "@/components/crosswalk-action/PoliceResponseSection";
import ActionTimeline from "@/components/crosswalk-action/ActionTimeline";
import OpinionsLink from "@/components/crosswalk-action/OpinionsLink";
import {
  ISSUES,
  POLICE_RESPONSE,
  MEETING_PHOTOS,
  TIMELINE,
  SUMMARY_STATS,
} from "@/data/crosswalk-police-response";

export const metadata: Metadata = {
  title: "이문동 횡단보도 25건 의견, 동대문경찰서 전달 완료 — 오준석",
  description:
    "주민 25명이 모은 횡단보도 개선 의견을 동대문경찰서에 직접 전달했습니다. 설문 결과 요약과 경찰서 답변, 다음 단계 일정을 한눈에 확인하세요.",
  openGraph: {
    title: "이문동 횡단보도 의견 25건, 동대문경찰서에 전달했습니다",
    description:
      "주민이 모은 의견을 후보가 직접 전달하고, 답변까지 정리한 활동 결과 보고.",
    images: [
      {
        url: "/crosswalk-police-2026-05-13.jpg",
        width: 1280,
        height: 960,
        alt: "동대문경찰서 면담 장면",
      },
    ],
    type: "article",
  },
  twitter: { card: "summary_large_image" },
};

export default function CrosswalkActionPage() {
  return (
    <main className="min-h-screen bg-sky-50 pb-20">
      <ActionHero />

      <div className="mx-auto max-w-3xl space-y-6 px-5 -mt-10 md:-mt-12">
        <PoliceMeetingPhoto photo={MEETING_PHOTOS[0]} />
        <SurveyResultSection
          issues={ISSUES}
          totalResponses={SUMMARY_STATS.totalResponses}
        />
        <PoliceResponseSection response={POLICE_RESPONSE} />
        <ActionTimeline items={TIMELINE} />
        <OpinionsLink />
      </div>
    </main>
  );
}
