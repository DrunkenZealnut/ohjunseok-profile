---
template: design
version: 1.0
description: 익명 후원자 등록 시 생년월일 19111111 기본 처리 및 이름 입력 허용 (Design)
feature: anonymous-donor-default-birthdate
date: 2026-05-15
author: zealnutkim
project: Ohjunseok 선거사무소
status: Draft
plan: docs/01-plan/features/anonymous-donor-default-birthdate.plan.md
---

# 익명 후원자 기본 생년월일 처리 (anonymous-donor-default-birthdate) Design Document

> **Plan 참조**: `docs/01-plan/features/anonymous-donor-default-birthdate.plan.md`

---

## 1. Architecture Overview

### 1.1 변경 영역 한눈에 보기

```
┌──────────────────────────────────────────────────────────────────────┐
│  사용자 진입                                                            │
│  ┌──────────────────────────┐   ┌──────────────────────────────┐    │
│  │ /donate (공개)             │   │ /admin/donations (관리자)      │    │
│  │  - isAnonymous toggle 신규  │   │  - 익명 탭에서 이름 활성화      │    │
│  │  - 익명 시 주민번호 hidden    │   │  - 익명 시 주민번호 자동 채움    │    │
│  └──────────┬───────────────┘   └──────────────┬───────────────┘    │
│             │ supabase.from('donations').insert │                       │
│             └─────────────┬───────────────────┘                       │
│                           ▼                                              │
│              ┌────────────────────────┐                                  │
│              │ donations 테이블          │                                  │
│              │  - resident_id NOT NULL │                                  │
│              │  - 익명: '1911111-1111111'│                                 │
│              └─────────────┬───────────┘                                 │
│                            ▼                                              │
│              ┌──────────────────────────────────────────────────┐       │
│              │ donation-export.ts                                │       │
│              │  - ANONYMOUS_RESIDENT_ID, ANONYMOUS_BIRTH 상수     │       │
│              │  - toAnonIncomeXlsx: 빈 값도 19111111로 정규화     │       │
│              └──────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 핵심 원칙

1. **단일 sentinel 출처**: `donation-export.ts`에 상수를 export하여 admin/donate 양쪽이 import해서 사용
2. **DB 일관성**: 신규 익명 데이터는 `resident_id = '1911111-1111111'`로 저장 (NOT NULL 제약 자연스럽게 충족)
3. **하위 호환**: 기존 빈 `resident_id` 데이터는 export 시점에 정규화 → 마이그레이션 회피
4. **UX 차별화**: 공개 폼은 단순함 우선(필드 hide), 관리자 폼은 정보 인식 우선(opacity-40 비활성화)

---

## 2. Data Model

### 2.1 donations 테이블 (변경 없음)

```sql
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name TEXT NOT NULL,
  resident_id TEXT NOT NULL,        -- 익명: '1911111-1111111'
  phone TEXT NOT NULL,              -- 익명: '00000000000' (placeholder)
  postal_code TEXT,
  address TEXT NOT NULL,            -- 익명: '(익명)' (placeholder)
  detail_address TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  email TEXT,
  amount INTEGER NOT NULL,
  deposit_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**NOT NULL 제약 충족 방안 (익명 후원자)**:

| 컬럼 | 신규 익명 저장 값 | 비고 |
|------|------------------|------|
| `donor_name` | 사용자 입력값 | 익명도 이름은 받음 (FR-01) |
| `resident_id` | `'1911111-1111111'` | 상수 `ANONYMOUS_RESIDENT_ID` |
| `phone` | `'00000000000'` | 상수 `ANONYMOUS_PHONE` (placeholder) |
| `address` | `'(익명)'` | 상수 `ANONYMOUS_ADDRESS` (placeholder) |
| `postal_code` | `null` | nullable |
| `detail_address` | `null` | nullable |
| `email` | `null` | nullable |

> **결정**: phone/address도 NOT NULL이므로 빈 문자열보다 명시적 placeholder 사용. 회계 export(`toAnonIncomeXlsx`)는 어차피 빈 값으로 출력하므로 영향 없음.

### 2.2 마이그레이션 SQL

**작성하지 않음.** 기존 데이터는 export 시점 정규화로 처리. 단, 향후 필요 시 다음 SQL을 수동 실행 가능:

```sql
-- (옵션, 미실행) 기존 익명 데이터의 빈 resident_id를 sentinel로 통일
UPDATE public.donations
SET resident_id = '1911111-1111111'
WHERE is_anonymous = true
  AND (resident_id IS NULL OR resident_id = '' OR LENGTH(REPLACE(resident_id, '-', '')) < 13);
```

---

## 3. Module Design

### 3.1 `src/app/admin/donations/lib/donation-export.ts` (수정)

#### 3.1.1 신규 상수 export

```typescript
// 익명 후원자 sentinel 값 — DB 저장 및 회계 export 정규화에 사용
export const ANONYMOUS_RESIDENT_ID = "1911111-1111111";
export const ANONYMOUS_BIRTH = "19111111";
export const ANONYMOUS_PHONE = "00000000000";
export const ANONYMOUS_ADDRESS = "(익명)";
```

#### 3.1.2 `ridToBirth` 보강

기존 함수는 그대로 유지하되, 익명 sentinel 입력에도 자연스럽게 `19111111` 반환됨을 단위 검증.

```typescript
// 검증: ridToBirth("1911111-1111111") === "19111111" ✅
//       (digits = "1911111111111", front = "191111", gen = "1" → "19" + "191111")
```

> **주의**: `digits("1911111-1111111") = "1911111111111"` (13자리). `front = "191111"`, `gen = "1"`, `century = "19"` → 결과 `"19191111"`. **이건 19111111이 아닌 19191111이 됨!**
>
> **해결**: sentinel을 `'111111-1111111'`로 변경하면 `digits = "1111111111111"`, `front = "111111"`, `gen = "1"`, `century = "19"` → `"19111111"` ✅
>
> **최종 sentinel**: `ANONYMOUS_RESIDENT_ID = "111111-1111111"` (13자리, 모두 1)

**상수 재정의**:
```typescript
export const ANONYMOUS_RESIDENT_ID = "111111-1111111";  // ridToBirth → "19111111"
export const ANONYMOUS_BIRTH = "19111111";
```

#### 3.1.3 `toAnonIncomeXlsx` 정규화

```typescript
export async function toAnonIncomeXlsx(donors: Donation[]): Promise<ArrayBuffer> {
  const meta = TEMPLATE_META.anonIncome;
  const anon = donors.filter((d) => d.is_anonymous);
  if (anon.length === 0) throw new Error("NO_DATA");

  const mainRows: Row[] = anon.map((d) => [
    "수입",
    "익명후원금",
    formatDateDot(d.deposit_date),
    "후원",
    "익명",
    ANONYMOUS_BIRTH,                  // ← (변경) 빈 문자열 → 19111111로 통일
    "",                               // 우편번호
    "",                               // 주소
    "",                               // 상세주소
    "",                               // 직업
    "",                               // 전화번호
    d.amount,
    "N",
    "익명",
    "개인",
    "",
  ]);
  // backupRows는 기존 그대로 (이름 백업)
  // ...
}
```

> **변경점**: 6번째 컬럼(생년월일) 자리를 빈 문자열 `""`에서 `ANONYMOUS_BIRTH`로 변경.

### 3.2 `src/app/admin/donations/page.tsx` (수정)

#### 3.2.1 import 추가

```typescript
import {
  toExpenseSourceXlsx,
  toNamedIncomeXlsx,
  toAnonIncomeXlsx,
  buildFileName,
  ANONYMOUS_RESIDENT_ID,
  ANONYMOUS_PHONE,
  ANONYMOUS_ADDRESS,
  type Donation,
} from "./lib/donation-export";
```

#### 3.2.2 익명 토글 핸들러 분리

기존:
```typescript
onClick={() => setForm({ ...form, is_anonymous: true })}
```

변경:
```typescript
onClick={() => setAnonymousMode(true)}
onClick={() => setAnonymousMode(false)}

function setAnonymousMode(anon: boolean) {
  if (anon) {
    setForm((f) => ({
      ...f,
      is_anonymous: true,
      // 이름은 사용자 입력값 유지
      resident_id: ANONYMOUS_RESIDENT_ID,
      phone: "",          // 익명에서는 입력 받지 않음
      email: "",
      postal_code: "",
      address: "",
      detail_address: "",
    }));
  } else {
    setForm((f) => ({
      ...f,
      is_anonymous: false,
      resident_id: "",   // 사용자가 다시 입력
    }));
  }
}
```

#### 3.2.3 입력 필드 활성화 규칙 변경

| 필드 | 익명 모드 | 기명 모드 | 비고 |
|------|----------|----------|------|
| `donor_name` | 활성 (필수) | 활성 (필수) | **(변경) 익명도 활성화** |
| `resident_id` | 비활성 + 자동값 표시 | 활성 | 익명 시 readonly 표시 |
| `phone` | 비활성 | 활성 | 그대로 |
| `email` | 비활성 | 활성 | 그대로 |
| `postal_code` / `address` / `detail_address` | 비활성 | 활성 | 그대로 |

#### 3.2.4 검증 로직 변경

기존:
```typescript
if (!form.is_anonymous && !form.donor_name.trim()) return setFormError("이름을 입력해주세요.");
```

변경:
```typescript
if (!form.donor_name.trim()) return setFormError("이름을 입력해주세요.");  // 익명도 필수
```

#### 3.2.5 payload 생성

```typescript
const payload = {
  donor_name: form.donor_name.trim(),
  resident_id: form.is_anonymous ? ANONYMOUS_RESIDENT_ID : form.resident_id.trim(),
  phone: form.is_anonymous ? ANONYMOUS_PHONE : form.phone.trim(),
  postal_code: form.is_anonymous ? null : (form.postal_code.trim() || null),
  address: form.is_anonymous ? ANONYMOUS_ADDRESS : form.address.trim(),
  detail_address: form.is_anonymous ? null : (form.detail_address.trim() || null),
  is_anonymous: form.is_anonymous,
  email: form.is_anonymous ? null : (form.email.trim() || null),
  amount: Number(form.amount),
  deposit_date: form.deposit_date,
};
```

#### 3.2.6 이름 필드 라벨 통일

```tsx
<label className="mb-1 block text-sm font-medium text-gray-700">
  이름 <span className="text-rose-500">*</span>
</label>
<input
  type="text"
  value={form.donor_name}
  onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
  // disabled 속성 제거 — 익명도 활성화
  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
  placeholder="홍길동"
/>
```

#### 3.2.7 주민등록번호 필드 (익명 시 sentinel 표시)

```tsx
<div className={`col-span-2 sm:col-span-1 ${form.is_anonymous ? "opacity-60" : ""}`}>
  <label className="mb-1 block text-sm font-medium text-gray-700">
    주민등록번호
    {form.is_anonymous && (
      <span className="ml-1 text-xs text-gray-400">(익명 자동 처리)</span>
    )}
  </label>
  <input
    type="text"
    value={form.is_anonymous ? ANONYMOUS_RESIDENT_ID : form.resident_id}
    onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
    disabled={form.is_anonymous}
    readOnly={form.is_anonymous}
    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 disabled:bg-gray-100 disabled:text-gray-500"
    placeholder="900101-1234567"
  />
</div>
```

### 3.3 `src/app/donate/page.tsx` (수정)

#### 3.3.1 FormData에 isAnonymous 활용 + 토글 UI

```tsx
{/* 0. 기명/익명 선택 (최상단 신규 추가) */}
<fieldset className="mb-8">
  <legend className="mb-3 flex items-center gap-2 text-lg font-bold text-sky-800">
    후원 방식
  </legend>
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => setAnonymousMode(false)}
      className={`flex-1 rounded-xl border-2 px-4 py-3 font-bold transition ${
        !form.isAnonymous
          ? "border-sky-500 bg-sky-50 text-sky-700"
          : "border-sky-200 text-sky-400 hover:bg-sky-50"
      }`}
    >
      기명 후원
    </button>
    <button
      type="button"
      onClick={() => setAnonymousMode(true)}
      className={`flex-1 rounded-xl border-2 px-4 py-3 font-bold transition ${
        form.isAnonymous
          ? "border-sky-500 bg-sky-50 text-sky-700"
          : "border-sky-200 text-sky-400 hover:bg-sky-50"
      }`}
    >
      익명 후원
    </button>
  </div>
  {form.isAnonymous && (
    <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
      ⚠️ 익명 후원은 기부금영수증 발급이 불가합니다. 영수증이 필요하시면 기명 후원을 선택해주세요.
    </p>
  )}
</fieldset>
```

#### 3.3.2 setAnonymousMode 핸들러

```typescript
function setAnonymousMode(anon: boolean) {
  setForm((f) => ({
    ...f,
    isAnonymous: anon,
    ...(anon
      ? { residentId1: "", residentId2: "", phone: "", postalCode: "", address: "", detailAddress: "", email: "" }
      : {}),
  }));
}
```

#### 3.3.3 익명 모드일 때 숨김 처리

| 필드 | 익명 모드 | 기명 모드 |
|------|----------|----------|
| 이름 (1번) | 표시 + 활성 | 표시 + 활성 |
| 주민등록번호 (2번) | **숨김** | 표시 + 활성 |
| 전화번호 (3번) | **숨김** | 표시 + 활성 |
| 이메일 (4번) | **숨김** | 표시 (선택) |
| 주소 (5번) | **숨김** | 표시 + 활성 |
| 후원금 금액 (6번) | 표시 + 활성 | 표시 + 활성 |
| 입금일자 (7번) | 표시 + 활성 | 표시 + 활성 |

```tsx
{!form.isAnonymous && (
  <>
    {/* 2. 주민등록번호 */}
    <fieldset className="mb-8">{/* ... */}</fieldset>
    {/* 3. 전화번호 */}
    <fieldset className="mb-8">{/* ... */}</fieldset>
    {/* 4. 이메일 */}
    <fieldset className="mb-8">{/* ... */}</fieldset>
    {/* 5. 주소 */}
    <fieldset className="mb-8">{/* ... */}</fieldset>
  </>
)}
```

#### 3.3.4 검증 로직 분기

```typescript
if (!form.name.trim()) {
  setError("이름을 입력해주세요.");
  return;
}

if (!form.isAnonymous) {
  if (form.residentId1.length !== 6 || form.residentId2.length !== 7) {
    setError("주민등록번호를 정확히 입력해주세요.");
    return;
  }
  if (form.phone.replace(/\D/g, "").length < 10) {
    setError("전화번호를 정확히 입력해주세요.");
    return;
  }
  if (!form.address.trim()) {
    setError("주소를 입력해주세요.");
    return;
  }
}

if (!form.amount || Number(form.amount.replace(/,/g, "")) <= 0) { /* ... */ }
if (!form.depositDate) { /* ... */ }
```

#### 3.3.5 insert payload

```typescript
import { ANONYMOUS_RESIDENT_ID, ANONYMOUS_PHONE, ANONYMOUS_ADDRESS } from "@/app/admin/donations/lib/donation-export";

const residentId = form.isAnonymous
  ? ANONYMOUS_RESIDENT_ID
  : `${form.residentId1}-${form.residentId2}`;

const { error: dbError } = await supabase.from("donations").insert({
  donor_name: form.name.trim(),
  resident_id: residentId,
  phone: form.isAnonymous ? ANONYMOUS_PHONE : form.phone.trim(),
  postal_code: form.isAnonymous ? null : (form.postalCode.trim() || null),
  address: form.isAnonymous ? ANONYMOUS_ADDRESS : form.address.trim(),
  detail_address: form.isAnonymous ? null : (form.detailAddress.trim() || null),
  email: form.isAnonymous ? null : (form.email.trim() || null),
  is_anonymous: form.isAnonymous,
  amount: amountNumber,
  deposit_date: form.depositDate,
});
```

> **순환 import 회피**: `/donate`가 `admin/donations/lib/`를 직접 import하는 게 부담스러우면 `src/lib/donation-constants.ts`로 상수만 분리. **결정: 단순함 우선 — 직접 import 사용** (admin/donations/lib는 client 안전 모듈이므로 OK)

---

## 4. Component Architecture

### 4.1 컴포넌트 트리 (변경 없음)

```
/donate (page.tsx)
  └── DonatePage (수정: 익명 토글 신규)

/admin/donations (page.tsx)
  └── AdminDonations (수정: 익명 모드 핸들러)
      └── (모달) DonationForm (인라인 JSX)
```

신규 컴포넌트 분리 없음. 변경 분량이 작아 인라인 유지.

---

## 5. State Flow

### 5.1 토글 전환 시퀀스 (관리자 모달)

```
사용자 액션               state 변화                                 UI 결과
─────────────            ───────────                                ─────────
[기명] 클릭              → is_anonymous: true                        → 이름 활성, 주민번호 sentinel 표시
                          resident_id: ANONYMOUS_RESIDENT_ID         → phone/email/address 비활성
                          phone/email/address: ""

[익명] 클릭              → is_anonymous: false                       → 이름 활성, 주민번호 빈 값 입력 대기
(다시 기명으로)           resident_id: ""                            → 모든 필드 활성
```

### 5.2 토글 전환 시퀀스 (공개 폼)

```
사용자 액션               state 변화                                 UI 결과
─────────────            ───────────                                ─────────
[기명 후원] (default)    → isAnonymous: false                       → 7개 fieldset 모두 표시
[익명 후원] 클릭          → isAnonymous: true                        → 2,3,4,5번 fieldset 숨김
                          residentId/phone/address/email: ""         → "영수증 불가" 안내 표시
[기명 후원] 클릭          → isAnonymous: false                       → 다시 모두 표시 (값은 빈 상태)
                                                                       (사용자가 새로 입력)
```

---

## 6. Validation Rules

### 6.1 관리자 모달

| 검증 | 조건 | 에러 메시지 |
|------|------|------------|
| 이름 | 익명 여부 무관, 필수 | "이름을 입력해주세요." |
| 금액 | > 0 | "올바른 금액을 입력해주세요." |
| 입금일 | 필수 | "입금일을 입력해주세요." |
| 주민번호 | 기명일 때만 검증 (현재 free-form, 향후 정규식 검증 옵션) | (기존 유지) |

### 6.2 공개 폼 (`/donate`)

| 검증 | 조건 | 에러 메시지 |
|------|------|------------|
| 이름 | 익명 여부 무관, 필수 | "이름을 입력해주세요." |
| 주민번호 (앞 6 + 뒤 7) | 기명일 때만 | "주민등록번호를 정확히 입력해주세요." |
| 전화 (10자리 이상) | 기명일 때만 | "전화번호를 정확히 입력해주세요." |
| 주소 | 기명일 때만 | "주소를 입력해주세요." |
| 금액 | > 0 | "후원금 금액을 입력해주세요." |
| 입금일 | 필수 | "입금일자를 선택해주세요." |

---

## 7. Implementation Order

```
1. donation-export.ts
   ├─ ANONYMOUS_RESIDENT_ID = "111111-1111111" (sentinel 값 검증 포함)
   ├─ ANONYMOUS_BIRTH = "19111111"
   ├─ ANONYMOUS_PHONE = "00000000000"
   ├─ ANONYMOUS_ADDRESS = "(익명)"
   └─ toAnonIncomeXlsx: 빈 값 → ANONYMOUS_BIRTH로 출력 (행 6번째 컬럼)

2. admin/donations/page.tsx
   ├─ import 상수 추가
   ├─ setAnonymousMode 핸들러 분리
   ├─ 익명 토글 onClick 변경 (setAnonymousMode 호출)
   ├─ 이름 필드 disabled 제거 + 라벨에서 조건부 * 제거 (항상 *)
   ├─ 주민번호 필드 익명 시 sentinel 자동 표시 (readOnly)
   ├─ handleSubmit 검증 로직 변경 (이름은 항상 필수)
   └─ payload 생성 시 익명이면 sentinel 채움

3. donate/page.tsx
   ├─ import 상수 추가
   ├─ 0번 fieldset 신규 (기명/익명 토글 + 영수증 불가 안내)
   ├─ setAnonymousMode 핸들러
   ├─ 2,3,4,5번 fieldset을 {!form.isAnonymous && (...)}로 감쌈
   ├─ handleSubmit 검증 분기 (기명일 때만 주민번호/전화/주소 검증)
   └─ insert payload에 sentinel 적용

4. 검증 (수동)
   ├─ admin: 익명 등록 → DB 확인 → 익명수입자 XLS 다운로드 → 19111111 확인
   ├─ /donate: 익명 후원 제출 → DB 확인
   └─ 기존 빈 데이터로 익명수입자 XLS → 19111111 정규화 확인
```

---

## 8. Test Plan

### 8.1 Unit-level (수동 검증)

| 테스트 | 입력 | 기대 결과 |
|--------|------|----------|
| `ridToBirth("111111-1111111")` | sentinel | `"19111111"` |
| `ridToBirth("")` (기존 빈 값) | 빈 문자열 | `""` |
| `ridToBirth("900101-1234567")` (정상 기명) | 13자리 | `"19900101"` |
| `toAnonIncomeXlsx`에 익명 1건 (sentinel 저장) | DB row | mainRow[5] === `"19111111"` |
| `toAnonIncomeXlsx`에 익명 1건 (빈 resident_id, 기존 데이터) | DB row | mainRow[5] === `"19111111"` (정규화) |

### 8.2 Integration-level (수동 검증)

| 시나리오 | 절차 | 기대 |
|----------|------|------|
| 관리자 모달 익명 등록 | "익명" 클릭 → 이름 "홍길동" → 금액/입금일 → 등록 | DB row: `donor_name="홍길동"`, `resident_id="111111-1111111"`, `phone="00000000000"`, `address="(익명)"`, `is_anonymous=true` |
| 관리자 모달 기명/익명 토글 왕복 | 기명에서 phone 입력 → 익명 클릭 → 다시 기명 | phone 입력값이 비워짐, 다시 입력 가능 |
| 공개 폼 익명 후원 | 익명 토글 → 이름/금액/입금일만 입력 → 제출 | 성공 메시지 + DB row 정상 저장 |
| 공개 폼 기명 후원 | 기존 동작 그대로 | 동작 변경 없음 |
| 익명수입자 XLS 다운로드 | 신규 + 기존 익명 데이터 모두 포함 | 모든 행의 6번째 컬럼이 `19111111` |
| 수입지출처 XLS 다운로드 | 익명은 제외 (기존 동작) | 익명 행이 포함되지 않음 |

### 8.3 회계 프로그램 import 검증 (수동)

`익명수입자_2026-05-15.xlsx` 다운로드 → 회계프로그램에 import → 익명 행의 생년월일이 정상 인식되는지 1회 확인.

---

## 9. Edge Cases & Risks

| 케이스 | 동작 | 비고 |
|--------|------|------|
| 익명 토글 후 이름 미입력 | "이름을 입력해주세요." 에러 | FR-01 검증 |
| 익명 → 기명 전환 후 자동 채워진 sentinel이 그대로 저장 | onClick 핸들러에서 `resident_id: ""` 초기화 | FR-09 |
| 기존 빈 `resident_id`로 익명수입자 export | `ridToBirth("") = ""` → 정규화 분기에서 `ANONYMOUS_BIRTH` 채움 | FR-06 |
| 기존 빈 `donor_name`으로 익명 export | `(미입력)` 텍스트 (기존 backupRows 로직 유지) | 동작 변경 없음 |
| 회계 프로그램이 다른 sentinel(`19000101`) 요구 | `ANONYMOUS_BIRTH` 상수만 교체 | 단일 출처 설계 |
| 동시에 두 명 익명 후원 (동일 이름) | 중복 제거 키가 `RID:1111111111111`로 동일 → 1건만 export | 회계상 익명은 합산되어도 무방 (수입내역은 amount만 중요) |

> **중복 제거 케이스 추가 검토**: `dedupeDonors`는 `수입지출처` 양식에서 사용되며, `수입지출처`는 익명을 제외하므로 영향 없음. `수입내역(익명)`은 `dedupeDonors`를 호출하지 않으므로 모든 행이 그대로 출력됨. ✅

---

## 10. Open Questions

1. ☐ 회계 담당자 확인: sentinel 생년월일이 `19111111`이 맞는지, 다른 값(`19000101`) 요구인지?
2. ☐ 공개 폼 익명 후원 시 전화번호도 받을지? (현재 Design은 받지 않음 — 영수증 불가이므로 연락 수단 불필요로 가정)
3. ☐ 기존 익명 데이터의 `donor_name`이 빈 값인 row가 몇 개인지 확인 후 백오피스 일괄 채움이 필요한지?

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-15 | 초안 작성 — 모듈/State/Validation 명세, sentinel 값 검증(`111111-1111111` 확정), 구현 순서 정의 | zealnutkim |
