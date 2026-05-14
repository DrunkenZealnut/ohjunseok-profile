# Changelog

## [2026-05-14] - child-hospital

### Added
- **새 페이지**: `/child-hospital` — 달빛어린이병원 캠페인 종합 페이지
- **컴포넌트 8개**: ChildHospitalHero, DeliveryPhoto, KeyNumbers, WhatIsDalbit, CampaignTimeline, CandidateMessage, NextSteps, ShareCta
- **데이터 모듈**: `src/data/child-hospital.ts` (5가지 상수 + 3가지 타입)
- **활동 카드**: `src/components/home-action-cards.tsx` (메인 페이지 최근 활동 섹션)
- **자산**: `public/child-hospital/signature-delivery.jpg`, `street-campaign.jpg`
- **메뉴**: footer에 "달빛어린이병원" 링크 추가

### Changed
- **footer.tsx**: FOOTER_LINKS에 "달빛어린이병원" 메뉴 1줄 추가
- **page.tsx**: `<HomeActionCards />` 컴포넌트 삽입 (Pledges ~ Contact 사이)

### Fixed
- **사진 매핑**: 원본 사진 2개의 EXIF rotation 보정. 거리 캠페인 사진 180° 회전 적용으로 정상 방향 확보

### Metrics
- **Match Rate**: 99% (기준 90% 통과)
- **새 파일**: 11개
- **수정 파일**: 2개
- **소요 시간**: 1일

