import { describe, it, expect } from "vitest";

// maskResidentId 함수 — donations 페이지에서 주민등록번호 마스킹
function maskResidentId(rid: string) {
  if (!rid || rid.length < 8) return rid;
  return rid.slice(0, 8) + "******";
}

// CSV 유틸 함수 (donations 페이지와 동일)
interface Donation {
  id: string;
  donor_name: string;
  resident_id: string;
  phone: string;
  address: string;
  amount: number;
  deposit_date: string;
  created_at: string;
}

function sanitizeCell(value: string | number): string {
  const str = String(value);
  if (/^[=+\-@\t]/.test(str)) return `\t${str}`;
  return str;
}

function toCSV(rows: Donation[]): string {
  const headers = ["이름", "주민등록번호", "전화번호", "주소", "금액", "입금일", "접수일"];
  const lines = rows.map((d) =>
    [
      sanitizeCell(d.donor_name),
      sanitizeCell(d.resident_id),
      sanitizeCell(d.phone),
      `"${d.address.replace(/"/g, '""')}"`,
      d.amount,
      new Date(d.deposit_date).toLocaleDateString("ko-KR"),
      new Date(d.created_at).toLocaleDateString("ko-KR"),
    ].join(",")
  );
  return "\uFEFF" + [headers.join(","), ...lines].join("\n");
}

describe("maskResidentId", () => {
  it("14자리 주민등록번호를 뒤 6자리 마스킹", () => {
    expect(maskResidentId("900101-1234567")).toBe("900101-1******");
  });

  it("빈 문자열이면 그대로 반환", () => {
    expect(maskResidentId("")).toBe("");
  });

  it("8자 미만이면 그대로 반환", () => {
    expect(maskResidentId("123456")).toBe("123456");
  });

  it("정확히 8자이면 마스킹 적용", () => {
    expect(maskResidentId("12345678")).toBe("12345678******");
  });
});

describe("sanitizeCell", () => {
  it("일반 문자열은 그대로 반환", () => {
    expect(sanitizeCell("홍길동")).toBe("홍길동");
  });

  it("= 로 시작하는 값에 탭 접두 (CSV 인젝션 방지)", () => {
    expect(sanitizeCell("=HYPERLINK(...)")).toBe("\t=HYPERLINK(...)");
  });

  it("+ 로 시작하는 값에 탭 접두", () => {
    expect(sanitizeCell("+82-10-1234")).toBe("\t+82-10-1234");
  });

  it("숫자는 그대로 반환", () => {
    expect(sanitizeCell(50000)).toBe("50000");
  });
});

describe("toCSV", () => {
  const sampleDonation: Donation = {
    id: "1",
    donor_name: "홍길동",
    resident_id: "900101-1234567",
    phone: "010-1234-5678",
    address: "서울시 종로구",
    amount: 50000,
    deposit_date: "2026-01-15",
    created_at: "2026-01-15",
  };

  it("BOM으로 시작 (Excel 한글 호환)", () => {
    const csv = toCSV([sampleDonation]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("첫 행에 한국어 헤더 포함", () => {
    const csv = toCSV([sampleDonation]);
    const firstLine = csv.replace("\uFEFF", "").split("\n")[0];
    expect(firstLine).toBe("이름,주민등록번호,전화번호,주소,금액,입금일,접수일");
  });

  it("빈 배열이면 헤더만 출력", () => {
    const csv = toCSV([]);
    const lines = csv.replace("\uFEFF", "").split("\n");
    expect(lines).toHaveLength(1);
  });

  it("주소에 쉼표 포함시 따옴표로 감쌈", () => {
    const withComma = { ...sampleDonation, address: "서울, 종로" };
    const csv = toCSV([withComma]);
    expect(csv).toContain('"서울, 종로"');
  });

  it("주소의 따옴표는 이중 따옴표로 이스케이프", () => {
    const withQuote = { ...sampleDonation, address: '서울 "강남"' };
    const csv = toCSV([withQuote]);
    expect(csv).toContain('"서울 ""강남"""');
  });
});
