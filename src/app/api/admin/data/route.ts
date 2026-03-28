import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ALLOWED_TABLES = ["survey_responses", "cheers", "opinions", "poll_observers", "posts"];
const DELETABLE_TABLES = ["posts", "cheers", "opinions"];

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function auth(request: NextRequest): boolean {
  const token = getTokenFromRequest(request);
  return !!token && verifyToken(token);
}

// GET: 목록 조회 또는 카운트
export async function GET(request: NextRequest) {
  if (!auth(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
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

  // 목록 조회
  const table = searchParams.get("table");
  if (!table || !ALLOWED_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "20");
  const from = (page - 1) * limit;

  const { data, count } = await getSupabaseAdmin()
    .from(table)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + limit - 1);

  return NextResponse.json({ data: data ?? [], count: count ?? 0 });
}

// POST: 소식 작성
export async function POST(request: NextRequest) {
  if (!auth(request)) return unauthorized();

  const body = await request.json();
  const { table, data } = body;

  if (table !== "posts") {
    return NextResponse.json({ error: "Only posts can be created" }, { status: 400 });
  }

  const { data: result, error } = await getSupabaseAdmin().from("posts").insert(data).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const { data: result, error } = await getSupabaseAdmin()
    .from("posts")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: result });
}

// DELETE: 삭제
export async function DELETE(request: NextRequest) {
  if (!auth(request)) return unauthorized();

  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table");
  const id = searchParams.get("id");

  if (!table || !id || !DELETABLE_TABLES.includes(table)) {
    return NextResponse.json({ error: "Invalid table or id" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().from(table).delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
