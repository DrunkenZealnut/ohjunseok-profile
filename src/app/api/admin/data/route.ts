import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED_TABLES = ["survey_responses", "cheers", "opinions", "poll_observers", "posts", "donations"];
const DELETABLE_TABLES = ["posts", "cheers", "opinions", "donations"];
const INSERTABLE_TABLES = ["posts", "donations"];

// 테이블별 삽입 허용 필드 (임의 컬럼 주입 방지)
const INSERTABLE_FIELDS: Record<string, string[]> = {
  posts: ["title", "content", "category", "published_at"],
  donations: ["donor_name", "resident_id", "phone", "address", "amount", "deposit_date"],
};

const PAGE_LIMIT_MAX = 100;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function internalError() {
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

function auth(request: NextRequest): boolean {
  const token = getTokenFromRequest(request);
  return !!token && verifyToken(token);
}

function getSearchParams(request: NextRequest) {
  return new URL(request.url).searchParams;
}

// GET: 목록 조회 또는 카운트
export async function GET(request: NextRequest) {
  if (!auth(request)) return unauthorized();

  const searchParams = getSearchParams(request);
  const action = searchParams.get("action");

  // 대시보드 카운트
  if (action === "counts") {
    const counts: Record<string, number> = {};
    for (const table of ALLOWED_TABLES) {
      const { count } = await getSupabaseAdmin()
        .from(table)
        .select("*", { count: "exact", head: true });
      counts[table] = count ?? 0;
    }
    return NextResponse.json(counts);
  }

  // 전체 목록 조회 (CSV 다운로드용)
  if (action === "all") {
    const table = searchParams.get("table");
    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }
    const { data, error } = await getSupabaseAdmin()
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10000);
    if (error) {
      console.error("[admin/data GET all]", error);
      return internalError();
    }
    return NextResponse.json({ data: data ?? [] });
  }

  // 목록 조회
  const table = searchParams.get("table");
  if (!table || !ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20), PAGE_LIMIT_MAX);
  const from = (page - 1) * limit;

  const { data, count } = await getSupabaseAdmin()
    .from(table)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  return NextResponse.json({ data: data ?? [], count: count ?? 0 });
}

// POST: 데이터 생성
export async function POST(request: NextRequest) {
  if (!auth(request)) return unauthorized();

  const body = await request.json();
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { table, data } = body as Record<string, unknown>;
  if (typeof table !== "string") {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (!INSERTABLE_TABLES.includes(table)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 400 });
  }

  // 테이블별 서버사이드 유효성 검사
  if (table === "donations") {
    const d = data as Record<string, unknown>;
    const depositDate = d.deposit_date;
    if (typeof depositDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(depositDate)) {
      return NextResponse.json({ error: "Invalid deposit_date" }, { status: 400 });
    }
    const amount = d.amount;
    if (!Number.isInteger(amount) || (amount as number) <= 0 || (amount as number) >= 1_000_000_000) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
  }

  // 허용된 필드만 추출 (임의 컬럼 주입 방지)
  const allowedFields = INSERTABLE_FIELDS[table] ?? [];
  const sanitized = Object.fromEntries(
    Object.entries(data as Record<string, unknown>).filter(([key]) => allowedFields.includes(key))
  );

  const { data: result, error } = await getSupabaseAdmin().from(table).insert(sanitized).select().single();

  if (error) {
    console.error("[admin/data POST]", error);
    return internalError();
  }
  return NextResponse.json({ data: result });
}

// PUT: 소식 수정
export async function PUT(request: NextRequest) {
  if (!auth(request)) return unauthorized();

  const body = await request.json();
  const { table, id, data } = body;

  if (table !== "posts") {
    return NextResponse.json({ error: "Only posts can be updated" }, { status: 400 });
  }

  // 허용된 필드만 추출 (임의 컬럼 주입 방지)
  const allowedFields = INSERTABLE_FIELDS["posts"] ?? [];
  const sanitized = Object.fromEntries(
    Object.entries(data as Record<string, unknown>).filter(([key]) => allowedFields.includes(key))
  );

  const { data: result, error } = await getSupabaseAdmin()
    .from("posts")
    .update(sanitized)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[admin/data PUT]", error);
    return internalError();
  }
  return NextResponse.json({ data: result });
}

// DELETE: 삭제
export async function DELETE(request: NextRequest) {
  if (!auth(request)) return unauthorized();

  const searchParams = getSearchParams(request);
  const table = searchParams.get("table");
  const id = searchParams.get("id");

  if (!table || !id || !DELETABLE_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table or id" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().from(table).delete().eq("id", id);

  if (error) {
    console.error("[admin/data DELETE]", error);
    return internalError();
  }
  return NextResponse.json({ ok: true });
}
