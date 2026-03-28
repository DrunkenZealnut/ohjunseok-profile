import { NextRequest, NextResponse } from "next/server";
import { createToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "잘못된 비밀번호입니다" }, { status: 401 });
  }

  const token = createToken();
  return NextResponse.json({ token });
}
