import { NextRequest, NextResponse } from "next/server";

const EPOST_API_ENDPOINT = process.env.EPOST_API_ENDPOINT ?? "";
const EPOST_API_KEY = process.env.EPOST_API_KEY ?? "";

function extractAllTagValues(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "g");
  const values: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    values.push(match[1].trim());
  }
  return values;
}

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json(
      { error: "검색어를 2자 이상 입력해주세요." },
      { status: 400 }
    );
  }

  if (!EPOST_API_ENDPOINT || !EPOST_API_KEY) {
    return NextResponse.json(
      { error: "우체국 API가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const url =
      `${EPOST_API_ENDPOINT}` +
      `?ServiceKey=${encodeURIComponent(EPOST_API_KEY)}` +
      `&searchSe=dong` +
      `&srchwrd=${encodeURIComponent(q)}` +
      `&countPerPage=10&currentPage=1`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error("[postal] Epost API HTTP error:", res.status);
      return NextResponse.json(
        { error: "우체국 API 오류가 발생했습니다." },
        { status: 502 }
      );
    }

    const xml = await res.text();
    const zipNos = extractAllTagValues(xml, "zipNo");
    const rnAdresses = extractAllTagValues(xml, "rnAdres");
    const lnmAdresses = extractAllTagValues(xml, "lnmAdres");

    const results = zipNos.map((zipNo, i) => ({
      zipNo,
      rnAdres: rnAdresses[i] ?? "",
      lnmAdres: lnmAdresses[i] ?? "",
    }));

    return NextResponse.json({ results });
  } catch (err) {
    console.error("[postal] fetch error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
