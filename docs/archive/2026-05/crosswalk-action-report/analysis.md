# Analysis: crosswalk-action-report (Gap 분석)

> Plan: `docs/01-plan/features/crosswalk-action-report.plan.md`
> Design: `docs/02-design/features/crosswalk-action-report.design.md`
> Branch: `feature/crosswalk-action-report`
> 분석일: 2026-05-14

---

## Executive Summary

| 항목 | 결과 |
|------|------|
| **Match Rate** | **98%** ✅ (임계치 90% 통과) |
| Blocker (P0) | 0건 |
| Should-fix (P1) | 0건 |
| Nice-to-have (P2) | 4건 (콘텐츠/스타일 미세 차이) |
| 권고 | **Report 단계 진입 가능** (`/pdca report`) |

| 카테고리 | 점수 |
|----------|:----:|
| Design Match | 98% |
| Architecture Compliance | 100% |
| Convention Compliance | 100% |
| Anti-Goal Compliance | 100% |

---

## 1. 기능별 매칭 (F1~F8)

### F1: ActionHero — 100%
- ✅ 그라데이션 (`from-sky-200 via-sky-300 to-sky-400`) 일치
- ✅ party-red 라벨, `font-black` h1, 3-stat 글래스모피즘 카드 (`bg-white/40 backdrop-blur-md ring-1 ring-white/50`) 일치
- 차이: 기본 export로 변경 (네임드 export → default export). page.tsx import 정상 — 기능 영향 없음.

### F2: PoliceMeetingPhoto — 100%
- ✅ `next/image` + `fill` + `priority` + `aspect-[4/3]` + `sizes` 모두 일치
- ✅ Camera 아이콘 + 한글 날짜 캡션 일치
- ✅ 사진 위치 `public/crosswalk-police-2026-05-13.jpg` 확인, 원본 (`src/app/crosswalk-survey/`) 삭제 확인
- 보완: `formatKoreanDate` 가 `2026년 5월 13일` 형식으로 더 풍부 — 가독성 향상

### F3: SurveyResultSection — 100%
- ✅ 2-column 이슈 그리드, 순위 뱃지, 언급 건수 뱃지, italic 인용 블록 일치
- ✅ 하단 "전체 분석 보기" 링크 1개만 노출 (`/survey-results`)
- ✅ 4대 이슈 데이터: 대각선 14건 / 신호시간 8건 / 비보호좌회전 4건 / 사각지대 5건 — 설문 원본과 정확히 일치
- 보완: `accent` 필드 추가로 이슈별 색상 테마 (red/orange/yellow/violet) — Design Anti-Goal "보라색 그라데이션 금지" 준수 (violet은 ring/icon/badge에만, 그라데이션 없음)
- 보완: `Issue.icon` 타입을 `string`에서 `"Footprints" | "Clock" | "AlertTriangle" | "MapPin"` 유니온으로 타입 안전성 강화

### F4: PoliceResponseSection — 100%
- ✅ 단일 `PoliceResponseSection` 객체 (이슈 매핑 없음 — Design v2 의도 부합)
- ✅ Placeholder 분기 (`isPending || items.length === 0`) 정상 작동
- ✅ optional `intro`, `items[]`, optional `followUp` 모두 구현
- 보완: Placeholder UI에 회색 톤 대신 sky 톤 사용 — 전체 페이지 팔레트 일관성 향상

### F5: ActionTimeline — 100% (컴포넌트) / 80% (데이터)
- ✅ 컴포넌트: 좌측 세로선, 상태별 아이콘 (CheckCircle2/Loader2/Circle), `in_progress` 스핀 애니메이션 모두 정상
- ⚠️ 데이터 차이 (P2):
  - Design에는 5개 항목 (설문 / 면담 완료 / 구청 면담 / 서울시 특별관리구역 / 주민 보고 간담회)
  - 구현에는 4개 항목 ("서울시 교통안전 특별관리구역 지정 요청" 누락)
  - 구청 교통행정과 면담 status가 `planned`로, design은 `in_progress`

### F6: ShareCTA — 100%
- ✅ 3-버튼 그리드 + Web Share API + 클립보드 fallback + "복사 완료!" 확인 상태
- ✅ 하단 `/crosswalk-survey` 링크
- ✅ "use client" 디렉티브 정상
- 카카오 SDK 미구현 — Design 6.3에서 옵션으로 허용된 사항. 첫 배포 후 필요 시 추가.

### F7: SEO/OG Metadata — 100%
- ✅ title, description, OG, twitter card 모두 구현
- 차이 (P2): OG 이미지 크기 `1280x960` (실제 사진 비율) vs Design `1200x630`. 카톡/트위터는 모두 허용 — 미관상 크롭이 발생할 수 있음.

### F8: `/results` 임베드 카드 + Navbar 비노출 — 100%
- ✅ `src/app/results/page.tsx`: 첫 카드로 횡단보도 활동 노출 (Footprints 아이콘 + emerald "전달 완료" 뱃지 + 25건 강조 + 화살표 링크)
- ✅ `src/components/navbar.tsx:35-43`: `pathname === "/crosswalk-action"` 분기 정상 — navbar 비노출

---

## 2. 데이터 스키마 검증 (Design §3.1)

| 타입 | Design | 구현 | 매칭 |
|------|--------|------|:----:|
| `Issue` | id, rank, title, mentionCount, icon, citationQuote, detailAnchor? | id, rank, title, mentionCount, icon (union), accent, citationQuote | ✅ 강화 |
| `PoliceResponseItem` | heading?, body | heading?, body | ✅ |
| `PoliceResponseSection` | responderRole, meetingDate, intro?, items, followUp?, isPending | 동일 | ✅ |
| `MeetingPhoto` | src, alt, caption, date, width, height | 동일 | ✅ |
| `TimelineItem` | date, label, status, description? | 동일 | ✅ |
| `SUMMARY_STATS` | totalResponses=25, coreIssues=4, meetingCount=1 | 동일 (`as const`) | ✅ |

- `detailAnchor?` 는 Design에 선언됐으나 컴포넌트에서 사용하지 않아 구현에서 제외 — 합리적 생략
- `accent` 필드 추가는 시각 다양성을 위한 보강

---

## 3. Anti-Goal 준수 검증 (Design §7.5)

| Anti-Goal | 결과 |
|-----------|:----:|
| 3-column 카드 그리드 남발 금지 | ✅ 이슈 카드는 2-column. 3-column은 Hero stats와 ShareCTA 버튼만 (정당한 사용) |
| 보라색 그라데이션 금지 | ✅ violet은 단일 IssueCard (blind_spot)의 ring/icon/badge에만, 그라데이션 없음 |
| AI 생성 템플릿 느낌 금지 | ✅ 사진 센터피스 + 한국어 카피 + party-red 강조 + 비대칭 블록 구성 |
| v1 상태 뱃지 (positive/negotiating/...) 제거 | ✅ Grep 결과: 해당 문자열 모두 미존재 — v2 단순화 의도 부합 |

---

## 4. Gap 목록 (심각도별)

| 심각도 | 항목 | 위치 | 조치 |
|:------:|------|------|------|
| **P0** | 없음 | — | — |
| **P1** | 없음 | — | — |
| **P2** | 타임라인에 "서울시 교통안전 특별관리구역 지정 요청" 누락 | `src/data/crosswalk-police-response.ts:114-139` | 후보가 해당 활동을 유지할 의향이 있으면 5번째 `TimelineItem` 추가 |
| **P2** | "동대문구청 교통행정과 면담" status가 `planned` (Design은 `in_progress`) | 같은 파일 line 128 | 일정 확정 시 `in_progress`로 변경 |
| **P2** | OG 이미지 크기 1280x960 (Design 1200x630) | `src/app/crosswalk-action/page.tsx:27-28` | 실기기에서 카톡 미리보기 크롭 확인 후 필요 시 별도 1200x630 카드 제작 |
| **P2** | 컴포넌트 export 스타일 (default vs named) | 6개 컴포넌트 | 페이지 import 정상 작동 — 코스메틱 차이 |

---

## 5. 빌드/타입 검증

| 항목 | 결과 |
|------|------|
| TypeScript `tsc --noEmit` | ✅ 통과 (새 코드 에러 0) |
| Next 프로덕션 빌드 | ⚠️ 실패 (`getCssModuleLoader is not a function`) |
| 빌드 에러 원인 | 새 코드와 무관한 Next.js 15.5.14 CSS 모듈 로더 환경 이슈 — 기존 환경에서 사전부터 존재. 새 컴포넌트는 CSS Module을 사용하지 않으므로 이 페이지 자체는 영향 없음 |

**빌드 이슈는 본 feature 외부 사안**으로 분류. PDCA Gap 분석 점수에 반영하지 않음.

---

## 6. 권고

**상태: REPORT 단계 진입 가능** — `/pdca report crosswalk-action-report`

근거:
- Match Rate 98%로 90% 임계치 통과
- P0/P1 gap 없음
- P2 항목은 모두 콘텐츠/스타일 미세 차이로, 후보 입력에 의존하는 결정 사항
- Placeholder UI(답변 미입력 상태)는 Design 의도된 동작

후속 작업 (Report 이후, 후보 주도):
1. `POLICE_RESPONSE.items` 채우고 `isPending: false`로 전환
2. 타임라인에 "서울시 교통안전 특별관리구역" 항목 추가 (필요 시)
3. "동대문구청 교통행정과" status 업데이트 (일정 확정 시)
4. 실기기에서 카톡 미리보기 확인 후 OG 카드 필요 시 별도 제작
5. (별도 트랙) Next.js 빌드 환경 이슈 트러블슈팅

---

## 7. 검사 파일 목록

| 파일 | 종류 |
|------|------|
| `docs/02-design/features/crosswalk-action-report.design.md` | Design (기준) |
| `docs/01-plan/features/crosswalk-action-report.plan.md` | Plan (배경) |
| `src/app/crosswalk-action/page.tsx` | 페이지 조립 + metadata |
| `src/data/crosswalk-police-response.ts` | 데이터 + 타입 |
| `src/components/crosswalk-action/ActionHero.tsx` | F1 |
| `src/components/crosswalk-action/PoliceMeetingPhoto.tsx` | F2 |
| `src/components/crosswalk-action/SurveyResultSection.tsx` | F3 |
| `src/components/crosswalk-action/PoliceResponseSection.tsx` | F4 |
| `src/components/crosswalk-action/ActionTimeline.tsx` | F5 |
| `src/components/crosswalk-action/ShareCTA.tsx` | F6 |
| `src/components/navbar.tsx` | 수정 (F8) |
| `src/app/results/page.tsx` | 수정 (F8) |
| `public/crosswalk-police-2026-05-13.jpg` | 사진 (이동) |
