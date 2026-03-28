import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SMTP_HOST,
  port: Number(process.env.MAIL_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_SMTP_USERNAME,
    pass: process.env.MAIL_SMTP_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    let subject = "";
    let html = "";

    if (type === "survey") {
      const { location, issueTypes, detail, name, phone } = body;
      subject = `[설문] 횡단보도 개선 의견 접수 - ${location}`;
      html = `
        <h2>횡단보도 개선 주민 의견이 접수되었습니다</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;width:120px;">위치</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${location}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">불편 유형</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${issueTypes.join(", ")}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">상세 의견</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${detail || "(없음)"}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">이름</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${name || "(미입력)"}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">전화번호</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${phone || "(미입력)"}</td>
          </tr>
        </table>
      `;
    } else if (type === "cheer") {
      const { message, name } = body;
      subject = `[응원] 새로운 응원 메시지가 도착했습니다`;
      html = `
        <h2>새로운 응원 메시지가 도착했습니다</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;width:120px;">보낸 분</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${name || "익명"}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">메시지</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${message}</td>
          </tr>
        </table>
      `;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
