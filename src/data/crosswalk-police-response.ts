// 횡단보도 설문 → 동대문경찰서 면담 결과 데이터
// Design: docs/02-design/features/crosswalk-action-report.design.md

export interface Issue {
  id: string;
  rank: number;
  title: string;
  mentionCount: number;
  icon: "Footprints" | "Clock" | "AlertTriangle" | "MapPin";
  accent: "red" | "orange" | "yellow" | "violet";
  citationQuote: string;
}

export interface PoliceResponseItem {
  heading?: string;
  body: string;
}

export interface PoliceResponseSection {
  responderRole: string;
  meetingDate: string;
  intro?: string;
  items: PoliceResponseItem[];
  followUp?: string;
  isPending: boolean;
}

export interface MeetingPhoto {
  src: string;
  alt: string;
  caption: string;
  date: string;
  width: number;
  height: number;
}

export interface TimelineItem {
  date: string;
  label: string;
  status: "done" | "in_progress" | "planned";
  description?: string;
}

export const SUMMARY_STATS = {
  totalResponses: 25,
  coreIssues: 4,
  meetingCount: 1,
} as const;

export const ISSUES: Issue[] = [
  {
    id: "diagonal_crosswalk",
    rank: 1,
    title: "대각선 횡단보도 필요",
    mentionCount: 14,
    icon: "Footprints",
    accent: "red",
    citationQuote: "동시신호면 외대 정문 앞처럼 대각선 횡단보도 그려주세요",
  },
  {
    id: "signal_time",
    rank: 2,
    title: "보행 신호 시간 부족",
    mentionCount: 8,
    icon: "Clock",
    accent: "orange",
    citationQuote:
      "보행신호가 너무 짧아 영유아, 어린이와 함께 건널 때 위험합니다",
  },
  {
    id: "unprotected_left",
    rank: 3,
    title: "비보호 좌회전 위험",
    mentionCount: 4,
    icon: "AlertTriangle",
    accent: "yellow",
    citationQuote:
      "좌회전 차량이 많은데 직진 차량은 매일 위험을 감수하고 있습니다",
  },
  {
    id: "blind_spot",
    rank: 4,
    title: "횡단보도 사각지대",
    mentionCount: 5,
    icon: "MapPin",
    accent: "violet",
    citationQuote: "빽다방 앞으로 건너다니는 사람이 있어 위험합니다",
  },
];

export const MEETING_PHOTOS: MeetingPhoto[] = [
  {
    src: "/crosswalk-police-2026-05-13.jpg",
    alt: "동대문경찰서 면담 장면 — 오준석 후보가 주민 설문 결과를 설명하는 모습",
    caption:
      "주민이 모아주신 25건의 설문 결과를 들고 동대문경찰서를 직접 찾아 횡단보도 개선 방안을 논의했습니다.",
    date: "2026-05-13",
    width: 1280,
    height: 960,
  },
];

// ⚠️ 답변 내용은 후보(사용자) 입력 대기.
// items 채우고 isPending: false 로 변경하면 자동 노출됩니다.
export const POLICE_RESPONSE: PoliceResponseSection = {
  responderRole: "동대문경찰서 교통과 담당자",
  meetingDate: "2026-05-13",
  intro: "",
  items: [],
  followUp: "",
  isPending: true,
};

export const TIMELINE: TimelineItem[] = [
  {
    date: "2026.04 ~ 05",
    label: "주민 설문 수집",
    status: "done",
    description: "이문로34길·이문로천장산로 사거리 25건 응답",
  },
  {
    date: "2026.05.13",
    label: "동대문경찰서 면담",
    status: "done",
    description: "설문 결과를 직접 전달하고 개선안 논의",
  },
  {
    date: "예정",
    label: "동대문구청 교통행정과 면담",
    status: "planned",
    description: "관할 이관 사항 협의",
  },
  {
    date: "예정",
    label: "주민 결과 보고 간담회",
    status: "planned",
    description: "면담 결과를 주민과 공유하고 다음 행동 계획",
  },
];
