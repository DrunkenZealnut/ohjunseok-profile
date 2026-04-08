import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("survey_responses")
    .select("id, location, issue_types, detail, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "데이터 조회 실패" }, { status: 500 });
  }

  return NextResponse.json(data);
}
