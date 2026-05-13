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

export const POLICE_RESPONSE: PoliceResponseSection = {
  responderRole: "동대문경찰서 교통과 담당자",
  meetingDate: "2026-05-13",
  intro:
    "방문하여 문의하신 민원 내용에 대하여 답변 드리겠습니다. 핵심 사안 두 곳에 대한 답변을 정리합니다.",
  items: [
    {
      heading: "1. 이문로34길 사거리 (이문동아이파크 107동 앞)",
      body: `현재 신호 체계는 4개 현시로 구성되어 있습니다.

① 이문우체국 → 외대 방향 직진·좌회전 동시
② 외대 → 이문우체국 방향 직진·좌회전 동시
③ 라그란데 → 이문우체국 좌회전, 이문아이파크 → 외대 좌회전
④ 3개 횡단보도 동시 보행신호

방문 시 1번·2번 직진좌회전 신호에 횡단보도 보행신호를 한 번씩 더 준다고 설명드렸으나, 안내가 잘못된 점 양해 부탁드립니다.

결론적으로 해당 교차로는 마지막 4현시에 3개 횡단보도가 동시에 보행신호가 켜지는 것으로 현장 확인되었으며, 1번·2번 직진좌회전 신호 시 보행신호를 추가로 부여하는 부분은 서울경찰청 신호 담당과 검토하도록 하겠습니다.

다만 3개 횡단보도 동시 보행신호 외에 양쪽 횡단보도에 한 번씩 더 보행신호를 줄 경우, 우회전 차량의 대기시간이 늘어나 이문로 교통 소통에 영향을 줄 수 있다는 점은 함께 고려가 필요합니다.

추가로 해당 교차로가 비정형 구조이고 한국외대 출판부 차량 진출입로와 횡단보도 설치 장소가 맞닿아 있어 (대각선 횡단보도 추가 설치 등이) 어렵다는 점도 다시 한번 말씀드립니다.`,
    },
    {
      heading: "2. 이문로·천장산로 사거리 (웰츠타워 앞 / 이문우체국 교차로)",
      body: `현재 신호 체계는 다음과 같이 운영 중입니다.

① 이문동사거리 방향 직진·좌회전 동시
② 외대앞 방향 직진·좌회전 동시
③ 양방향 비보호 좌회전

2026년 4월 13일, 서울경찰청에서 해당 사거리를 비보호 좌회전 → 보호 좌회전으로 변경하고 3구 신호등을 4구 신호등으로 변경하도록 이문3구역 조합에 개선 설치를 요청하였습니다.

공사 완료 시점은 조합 측에 문의가 필요해 자세한 답변이 어려우나, 방문 시 안내드린 것처럼 각 현시의 직진좌회전 신호 시 1개의 횡단보도에 보행신호가 들어오는 것으로 심의 완료되었으니 참고 바랍니다.`,
    },
  ],
  followUp:
    "📞 추가 문의는 동대문경찰서 교통과 02-961-4472 로 연락해 주시기 바랍니다.",
  isPending: false,
};

export const TIMELINE: TimelineItem[] = [
  {
    date: "2026.04 ~ 05",
    label: "주민 설문 수집",
    status: "done",
    description: "이문로34길·이문로·천장산로 사거리 25건 응답",
  },
  {
    date: "2026.04.13",
    label: "이문로·천장산로 사거리 신호 개선 심의 완료",
    status: "done",
    description:
      "서울경찰청 — 비보호 → 보호 좌회전 전환 + 3구→4구 신호등 변경, 이문3구역 조합에 설치 요청",
  },
  {
    date: "2026.05.13",
    label: "동대문경찰서 면담",
    status: "done",
    description: "주민 설문 25건 결과를 전달하고 답변 수령",
  },
  {
    date: "진행 중",
    label: "이문로34길 사거리 보행신호 추가 검토",
    status: "in_progress",
    description: "1·2현시 직진좌회전 시 보행신호 부여 — 서울경찰청 신호 담당과 검토",
  },
  {
    date: "진행 중",
    label: "이문3구역 조합 신호등 개선 공사",
    status: "in_progress",
    description: "이문로·천장산로 사거리 4구 신호등 설치 — 공사 일정 조합 측 문의 필요",
  },
  {
    date: "예정",
    label: "동대문구청 교통행정과 면담",
    status: "planned",
    description: "관할 이관 사항 협의 (대각선 횡단보도 등)",
  },
  {
    date: "예정",
    label: "주민 결과 보고 간담회",
    status: "planned",
    description: "면담 결과를 주민과 공유하고 다음 행동 계획",
  },
];
