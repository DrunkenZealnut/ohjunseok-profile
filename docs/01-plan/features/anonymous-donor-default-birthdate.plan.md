---
template: plan
version: 1.0
description: 익명 후원자 등록 시 생년월일 19111111 기본 처리 및 이름 입력 허용
feature: anonymous-donor-default-birthdate
date: 2026-05-15
author: zealnutkim
project: Ohjunseok 선거사무소
---

# 익명 후원자 기본 생년월일 처리 (anonymous-donor-default-birthdate) Planning Document

> **Summary**: 익명 후원자의 주민등록번호(생년월일)를 `19111111-1111111`로 자동 채워 회계 export 일관성을 확보하고, 익명 탭에서도 이름은 입력받도록 폼을 개선한다.
>
> **Project**: Ohjunseok 선거사무소 사이트
> **Version**: 0.1
> **Author**: zealnutkim (kcsvictory@gmail.com)
> **Date**: 2026-05-15
> **Status**: Draft

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem (문제)** | 현재 익명 후원자는 관리자 등록 모달에서 이름·주민번호·전화·주소 전부가 비활성화되어 빈 값으로 저장된다. 회계 프로그램 export 시 빈 생년월일이 `19111111`로 잡히는 사례가 발견됐고, 익명이라도 "누가 익명을 선택했는지" 식별을 위해 이름은 남겨야 한다. |
| **Solution (해결책)** | 익명 탭에서 (1) 이름 입력은 활성화, (2) 주민번호는 `1911111-1111111` (생년월일 변환 시 `19111111`)로 자동 고정, (3) 전화·이메일·주소는 기존대로 비활성화. 동일한 규칙을 `/donate` 공개 폼과 `/admin/donations` 등록 모달 양쪽에 적용한다. 기존 익명 데이터(주민번호 빈 값)는 별도 마이그레이션 없이 DB에 그대로 두되, export 시 빈 값을 `19111111`로 정규화한다. |
| **Function/UX Effect** | 관리자/후원자가 익명을 선택해도 이름은 그대로 기록되어 백오피스에서 식별 가능. 회계 export(`익명수입자`)는 모든 익명 행에 일관된 `19111111` 생년월일 표기. 공개 폼에서 익명 후원자는 주민번호 입력 부담 제거. |
| **Core Value (핵심가치)** | **회계 일관성 + 익명성의 균형**. 정치자금법상 익명 처리는 허용되지만 회계 양식에는 빈 값이 들어가면 안 되고, 동시에 후원자 본인 식별을 위해 이름까지는 남길 필요가 있다. 두 요구를 단일 규칙으로 통합한다. |

---

## 1. Overview

### 1.1 Purpose

익명 후원자 데이터의 회계 export 일관성을 확보하고, 익명이라도 이름은 기록함으로써 내부 추적/사후 영수증 처리 가능성을 열어둔다.

### 1.2 Background

- 현재 `/admin/donations` 등록 모달에서 익명 토글 시 이름·주민번호·전화·이메일·주소 입력란이 모두 disabled되고 빈 값으로 저장된다 (page.tsx:602~713).
- 회계 export(`donation-export.ts:toAnonIncomeXlsx`)는 익명 행의 생년월일을 빈 문자열로 처리하지만, 회계관리프로그램 import 결과에서는 빈 생년월일이 `19111111`로 표시되는 것을 확인.
- `/donate` 공개 폼은 `isAnonymous` 필드가 form state에 있으나 토글 UI 자체가 없어 항상 기명으로 저장된다 (page.tsx:34, 123).
- 익명이라도 "누가 익명을 선택했는지" 식별을 위해 이름은 남겨야 한다는 운영상 요구.

### 1.3 Related Documents

- `docs/01-plan/features/donation-accounting-export.plan.md` (회계 export 일괄등록 양식)
- `src/app/admin/donations/page.tsx` (관리자 등록 모달, 익명 토글)
- `src/app/donate/page.tsx` (공개 후원 입력 폼)
- `src/app/admin/donations/lib/donation-export.ts` (회계 export, `ridToBirth`)
- 데이터 스키마: `donations` 테이블 (donor_name, resident_id, is_anonymous, ...)

---

## 2. Scope

### 2.1 In Scope

- [ ] **관리자 등록 모달 (admin/donations)**: 익명 탭 선택 시
  - 이름 입력 활성화 (필수)
  - 주민번호 입력 비활성화하고 `1911111-1111111` 자동 채움 (DB에는 `1911111-1111111` 형태 저장 → `ridToBirth`가 `19111111` 반환)
  - 전화·이메일·주소는 기존대로 비활성화
- [ ] **공개 후원 폼 (/donate)**: 기명/익명 토글 UI 추가
  - 익명 선택 시: 이름 입력 활성화, 주민번호 입력 숨김(자동 채움), 전화/주소도 비활성화 또는 숨김
  - 기명 선택 시: 기존 동작 유지
- [ ] **회계 export 정규화**: `toAnonIncomeXlsx`에서 익명 행의 생년월일이 빈 값이면 `19111111`로 채워 출력 일관성 확보
- [ ] **상수화**: `ANONYMOUS_RESIDENT_ID = "1911111-1111111"`, `ANONYMOUS_BIRTH = "19111111"`을 `donation-export.ts` 또는 별도 상수 파일에 정의해 단일 출처화
- [ ] **이름이 빈 익명 데이터** 처리 정책: 기존 익명 데이터는 빈 이름이 그대로 표시되며 export 시 "익명"으로 출력 (현재 동작 유지)

### 2.2 Out of Scope

- 기존 익명 데이터의 `resident_id` 컬럼 일괄 마이그레이션 (DB UPDATE 스크립트)
  - export 시 정규화로 충분하므로 데이터는 건드리지 않음
- 익명 후원자에 대한 영수증 발급 로직 변경
- `donations` 테이블 스키마 변경 (컬럼 추가/제거 없음)
- 회계 export 다른 양식(수입지출처, 수입내역 기명) 변경 — `donation-accounting-export` plan 범위
- 어드민 테이블 표시 컬럼 변경 (현재 `익명` 뱃지 그대로 유지)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | 요구사항 | 우선순위 | 상태 |
|----|---------|---------|------|
| FR-01 | 관리자 등록 모달 익명 탭 선택 시 이름 입력 필드 활성화, 빈 이름 검증 (필수) | High | Pending |
| FR-02 | 관리자 등록 모달 익명 탭 선택 시 `resident_id`를 `1911111-1111111`로 자동 채움 (입력란은 readonly 또는 숨김) | High | Pending |
| FR-03 | 공개 `/donate` 폼에 기명/익명 토글 UI 추가 (관리자 모달과 동일한 디자인 톤) | High | Pending |
| FR-04 | 공개 폼 익명 선택 시 이름 입력 활성화 + 주민번호/전화/주소 입력 영역 숨김 또는 비활성화 | High | Pending |
| FR-05 | 익명 제출 시 서버로 보내는 payload: `donor_name`(입력값), `resident_id`="1911111-1111111", 나머지 빈 값 또는 placeholder | High | Pending |
| FR-06 | `toAnonIncomeXlsx`에서 익명 행의 생년월일을 항상 `19111111`로 출력 (빈 값 정규화) | High | Pending |
| FR-07 | 상수 `ANONYMOUS_RESIDENT_ID`, `ANONYMOUS_BIRTH`를 한 곳에 정의해 모듈 간 공유 | Medium | Pending |
| FR-08 | 기명 → 익명 토글 전환 시 입력 중이던 주민번호/전화/주소 값을 비우고 익명 기본값 적용 | Medium | Pending |
| FR-09 | 익명 → 기명 토글 전환 시 자동 채워졌던 `1911111-1111111`을 비워 사용자가 다시 입력하도록 함 | Medium | Pending |
| FR-10 | 어드민 테이블에서 익명 행의 주민번호 마스킹 표시는 기존 `maskResidentId` 그대로 (예: `1911111-******`) | Low | Pending |

### 3.2 Non-Functional Requirements

| 카테고리 | 기준 | 측정 방법 |
|----------|------|----------|
| Consistency | 모든 익명 후원자의 export 생년월일은 `19111111`로 단일화 | 회계 export 결과 검수 |
| Backward Compatibility | 기존 익명 데이터(빈 `resident_id`)도 export에서 `19111111`로 정규화 | 기존 데이터로 export 실행 |
| UX | 토글 전환 시 시각적 피드백 명확 (현재 모달의 `opacity-40` 패턴 유지) | 수동 확인 |
| Security | 자동 채움된 더미 주민번호가 일반 후원자 입력값과 혼동되지 않도록 placeholder/안내 문구 표기 | 코드 리뷰 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 관리자 등록 모달에서 익명 탭 선택 → 이름만 입력 가능, 저장 시 `resident_id`가 `1911111-1111111`로 DB에 들어감
- [ ] 공개 `/donate` 폼에 익명 토글이 추가되어 익명 후원 제출 가능
- [ ] 회계 export(`익명수입자 XLS`) 결과의 모든 행 생년월일이 `19111111`
- [ ] 기존 익명 데이터(빈 resident_id)도 동일하게 `19111111`로 export됨
- [ ] 토글 전환 시 입력값 정리 및 자동 채움 동작 검증
- [ ] lint/typecheck 통과
- [ ] 변경된 두 파일(admin/donations/page.tsx, donate/page.tsx, donation-export.ts) 자가 코드 리뷰 1회

### 4.2 Quality Criteria

- [ ] 기존 기명 후원자 등록·수정·삭제 동작 영향 없음
- [ ] 익명 토글 전후 폼 상태 일관성 (값 누수 없음)
- [ ] 회계 export의 다른 양식(`수입지출처`, `기명수입자`) 영향 없음

---

## 5. Risks and Mitigation

| 리스크 | 영향 | 발생가능성 | 대응 |
|--------|------|----------|------|
| 더미 주민번호 `1911111-1111111`가 실제 데이터와 충돌 | Low | Very Low | 1911년 11월 11일은 실제 생존 후원자 가능성 사실상 0. 회계 프로그램 통상 sentinel value로 사용 |
| 회계 프로그램이 `19111111` 외 다른 sentinel(예: `19000101`)을 요구 | Medium | Low | Plan 단계에서 회계 담당자에게 한 번 확인. 다르면 상수만 교체하면 되도록 단일 출처 설계 (FR-07) |
| 공개 `/donate` 폼에 익명 토글 추가 시 기부금영수증 발급 안내와 충돌 (영수증은 실명 필요) | High | Medium | 익명 선택 시 "기부금영수증 발급 불가" 안내 문구 노출. Design 단계에서 UX 결정 |
| 기존 익명 데이터의 빈 `donor_name`이 export에서 `(미입력)`으로 표기되는 현재 동작 변경 | Low | Low | `toAnonIncomeXlsx`의 backupRows 로직 그대로 유지 |
| 토글 전환 시 사용자가 입력하던 주민번호 값이 사라져 불만 | Low | Medium | 전환 직전 confirm 표시 또는 토글 옆 주의 문구 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | 특징 | 적합 분야 | 선택 |
|-------|------|----------|:----:|
| **Starter** | 단순 구조 | 정적 사이트 | ☐ |
| **Dynamic** | 기능 단위 모듈, BaaS 연동 | 백엔드 있는 웹앱 | ☑ |
| **Enterprise** | 엄격한 계층 분리, DI | 대규모 시스템 | ☐ |

→ 기존 `admin` + `donate` 모듈 내 작은 UX/로직 변경. 신규 디렉토리 불필요.

### 6.2 Key Architectural Decisions

| 결정 | 옵션 | 선택 | 근거 |
|------|------|------|------|
| 더미 주민번호 저장 위치 | DB / export 시점 변환 | **DB 저장 + export 정규화 둘 다** | 신규 데이터는 DB에 더미값 저장(일관성), 기존 빈 데이터는 export 시 정규화(마이그레이션 회피) |
| 더미 sentinel 값 | `19111111-1111111` / `19000101-0000000` | `1911111-1111111` (생년월일 8자리 = `19111111`) | 사용자 명시 요구 |
| 상수 정의 위치 | 각 컴포넌트 내 / 별도 모듈 | `donation-export.ts`에 export 상수 추가 | 회계 export 로직과 동일 모듈 → 단일 출처 |
| 공개 폼 익명 UI | 토글 / 체크박스 | 관리자 모달과 동일한 토글 디자인 | UX 일관성 |
| 익명 선택 시 비활성화 vs 숨김 | 비활성화(opacity) / 숨김(display:none) | **숨김** (공개 폼) / **비활성화** (관리자) | 공개 폼은 단순함 우선, 관리자는 정보 인식 우선 |

### 6.3 Folder Structure (변경 없음)

```
src/app/donate/
  └── page.tsx                                 # 익명 토글 UI 추가 (수정)

src/app/admin/donations/
  ├── page.tsx                                 # 익명 탭 이름 활성화, 주민번호 자동 채움 (수정)
  └── lib/
      └── donation-export.ts                   # 상수 추가 + toAnonIncomeXlsx 정규화 (수정)
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [x] `CLAUDE.md` / `AGENTS.md` / `.impeccable.md` 존재
- [x] TypeScript + Next.js App Router
- [x] Tailwind CSS + lucide-react 아이콘
- [x] `donations` 테이블 스키마 안정 (resident_id는 string 타입으로 저장)
- [x] `donation-export.ts`의 `ridToBirth` 함수가 13자리 → 8자리 변환 처리

### 7.2 Conventions to Define/Verify

| 카테고리 | 현재 상태 | 정의할 사항 | 우선순위 |
|----------|----------|-----------|:-------:|
| 익명 sentinel 상수 | 없음 | `ANONYMOUS_RESIDENT_ID`, `ANONYMOUS_BIRTH` 정의 | High |
| 익명 영수증 안내 문구 | 없음 | 공개 폼 익명 선택 시 안내 텍스트 | Medium |

### 7.3 Environment Variables Needed

신규 환경변수 불필요.

### 7.4 Pipeline Integration

기존 `donation-accounting-export` plan(do 단계)과 같은 후원 도메인. 작은 보조 기능으로 별도 phase 진입 불필요. donation-accounting-export 작업 마무리 전후 어느 시점에 진행 가능.

---

## 8. Next Steps

1. [ ] 회계 담당자에게 `19111111` sentinel 값 확정 (다르면 상수만 교체)
2. [ ] `/pdca design anonymous-donor-default-birthdate` 실행하여 Design 문서 작성
   - 익명 폼 UI 와이어프레임 (관리자 모달 + 공개 폼)
   - 토글 전환 시 state 처리 명세
   - 기부금영수증 안내 문구 결정
3. [ ] Design 승인 후 `/pdca do anonymous-donor-default-birthdate`로 구현
4. [ ] 회계 export로 검증(기존 + 신규 익명 데이터 모두 `19111111` 출력 확인)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-15 | 초안 작성 — 현 상태 분석, 익명 처리 통일 정책 정의, 5개 핵심 결정 도출 | zealnutkim |
