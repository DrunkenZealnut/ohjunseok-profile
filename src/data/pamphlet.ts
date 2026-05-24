// 공식 책자형 선거공보물(8p) 콘텐츠 단일 출처.
// 등록 정보(기호·이름·생년월일·학력·정당)는 공보물 본문과 자구 일치를 유지해야 함.
// Source: data/오준석 책자형 선거공보(8p)_점자공보물.pdf (2026-05-19 선관위 등록)

export interface Candidate {
  number: 5;
  party: "진보당";
  name: string;
  nameHanja: string;
  birthDate: string;
  age: number;
  gender: "남";
  occupation: string;
  education: string;
  district: string;
  slogan: string;
  sloganSubline: string;
  photo: { src: string; alt: string };
}

export interface StatementHighlight {
  signatures: number;
  topic: string;
}

export interface Statement {
  headline: string;
  bodies: readonly string[];
  highlighted: { text: string; highlight: StatementHighlight };
  cta: string;
}

export type PledgeCategoryId = "child" | "together" | "transit";
export type PledgeAccentColor = "sky" | "amber" | "emerald";
export type PledgeIconId = "Baby" | "Users" | "Route";

export interface Pledge {
  id: string;
  title: string;
  note?: string;
}

export interface PledgeCategory {
  id: PledgeCategoryId;
  number: 1 | 2 | 3;
  title: string;
  description: string;
  accentColor: PledgeAccentColor;
  icon: PledgeIconId;
  pledges: Pledge[];
}

export interface Achievement {
  id: string;
  date: string;
  location: string;
  title: string;
  summary: string;
  metric?: { value: string; label: string };
  image: { src: string; alt: string };
  href?: string;
}

export interface CareerItem {
  status: "현" | "전";
  title: string;
}

export const CANDIDATE: Candidate = {
  number: 5,
  party: "진보당",
  name: "오준석",
  nameHanja: "吳俊碩",
  birthDate: "1985.2.28",
  age: 41,
  gender: "남",
  occupation: "정당인",
  education: "경희대학교 경제학과 졸업",
  district: "동대문구 라선거구(이문1·2동)",
  slogan: "우리 동네 육아 해결사!",
  sloganSubline: "아이 셋,",
  photo: {
    src: "/ohjunseok-2026.jpg",
    alt: "오준석 진보당 동대문구의원 후보 (기호 5번)",
  },
};

export const STATEMENT: Statement = {
  headline: "세 아이를 키우며\n이문동을 다시 보게 됐습니다",
  bodies: [
    "아이가 아픈 밤, 부모의 마음도 함께 앓습니다.",
    "정치는 거창한 것이 아니라 주민의 삶 가까이에 있어야 한다고 믿습니다.",
  ],
  highlighted: {
    text: "야간·주말에도 마음 놓고 진료받을 수 있도록 달빛어린이병원 유치를 위해 주민 3,025명의 서명을 모아 전달했습니다.",
    highlight: { signatures: 3025, topic: "달빛어린이병원" },
  },
  cta: "이문동 주민들의 목소리를 가장 가까이에서 듣고, 끝까지 해결하는 구의원이 되겠습니다.",
};

export const PLEDGE_CATEGORIES: PledgeCategory[] = [
  {
    id: "child",
    number: 1,
    title: "아이 키우기 좋은 이문동",
    description: "야간·주말 진료, 안전 통학로, 돌봄 인프라.",
    accentColor: "sky",
    icon: "Baby",
    pledges: [
      { id: "child-1", title: "야간·주말 달빛어린이병원 추진" },
      {
        id: "child-2",
        title: "어린이 문화공간 설치",
        note: "공공실내놀이터, 장난감도서관",
      },
      { id: "child-3", title: "어린이 통학로 옐로우카펫 설치" },
      { id: "child-4", title: "동별 우리동네키움센터 설치" },
      { id: "child-5", title: "여성 청소년 생리대 무상지원" },
      { id: "child-6", title: "이문초 인근 공사 안전 점검" },
      { id: "child-7", title: "디지털성범죄지원센터 설치" },
    ],
  },
  {
    id: "together",
    number: 2,
    title: "함께 사는 이문동",
    description: "청년·어르신·소상공인을 두루 살피는 생활 정책.",
    accentColor: "amber",
    icon: "Users",
    pledges: [
      { id: "together-1", title: "청년 마음 상담 센터" },
      {
        id: "together-2",
        title: "모두의 1층 경사로 설치",
        note: "휠체어·유아차 통행",
      },
      { id: "together-3", title: "전·월세 사기 예방 및 지원" },
      {
        id: "together-4",
        title: "반려동물 놀이터 조성",
        note: "이화교 앞",
      },
      { id: "together-5", title: "상권활성화 위한 골목형 상점가 지정" },
      { id: "together-6", title: "신이문역 루프스퀘어 주민공간으로 개선" },
      { id: "together-7", title: "어르신 돌봄 주치의" },
      { id: "together-8", title: "대상포진 예방접종 지원" },
    ],
  },
  {
    id: "transit",
    number: 3,
    title: "다니기 좋은 이문동",
    description: "역세권·도로·보행 환경을 주민 시선으로.",
    accentColor: "emerald",
    icon: "Route",
    pledges: [
      { id: "transit-1", title: "신규 아파트 인근 신호 및 횡단보도 개선" },
      { id: "transit-2", title: "외대앞역 신규 출구 추진" },
      { id: "transit-3", title: "신이문역 공사 조속 추진" },
      { id: "transit-4", title: "이문2동 싱크홀 피해자 제대로 보상" },
      { id: "transit-5", title: "출퇴근 불편 버스노선 개선" },
      { id: "transit-6", title: "신이문역 인근 토끼굴 보행로 개선" },
      {
        id: "transit-7",
        title: "동부간선도로 지하화 재검토 및 산책로 대안 마련",
      },
    ],
  },
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "child-hospital",
    date: "2026.04.21",
    location: "동대문구청",
    title: "주민 3,025명과 함께한 달빛어린이병원 요구",
    summary:
      "동대문구는 달빛어린이병원 0개. 야간·휴일 소아 진료 공백을 메우기 위한 활동 기록과 다음 단계 약속.",
    metric: { value: "3,025", label: "명 서명" },
    image: {
      src: "/child-hospital/signature-delivery.jpg",
      alt: "동대문구청에 주민 3,025명 서명을 전달하는 오준석 후보",
    },
    href: "/child-hospital",
  },
  {
    id: "oedae-station",
    date: "2025.10.23",
    location: "외대앞역",
    title: "주민 3,307명과 함께한 외대앞역·신이문역 개선",
    summary:
      "지하철 계단 앞에서 망설이던 어르신·유아차·휠체어 이용자를 위해 모은 서명. 외대앞역 신규 출구 검토 및 신이문역 공사 조속 추진 답변을 이끌어냈습니다.",
    metric: { value: "3,307", label: "명 서명" },
    image: {
      src: "/pamphlet/oedae-station.jpg",
      alt: "외대앞역 앞에서 국가철도공단 관계자와 면담하는 오준석 후보",
    },
  },
  {
    id: "crosswalk-action",
    date: "2026.05.13",
    location: "동대문 경찰서",
    title: "신규 아파트 인근 사거리 신호 개선 협의",
    summary:
      "동대문 경찰서와 신규 아파트 인근 사거리 신호 개선을 논의. 작은 불편도 '별일 아니다' 하고 지나치지 않습니다.",
    image: {
      src: "/crosswalk-police-2026-05-13.jpg",
      alt: "동대문 경찰서에서 신호 개선을 논의하는 오준석 후보",
    },
    href: "/crosswalk-action",
  },
];

export const CAREER_HIGHLIGHTS: CareerItem[] = [
  { status: "현", title: "진보당 동대문 달빛어린이병원 추진 운동본부장" },
  {
    status: "현",
    title: "진보당 외대역·신이문역 승강장 엘리베이터 설치 운동본부장",
  },
  { status: "현", title: "청량초 학교운영위원회 위원장" },
  { status: "현", title: "디자인기업 몽땅 대표" },
  { status: "전", title: "21대 대선 이재명 선대위 주민소통본부 공동본부장" },
  { status: "현", title: "대통령 직속 민주평통 자문위원" },
];
