import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function createTransporter() {
  const host = process.env.MAIL_SMTP_HOST;
  const user = process.env.MAIL_SMTP_USERNAME;
  const pass = process.env.MAIL_SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.error("Missing SMTP env vars:", { host: !!host, user: !!user, pass: !!pass });
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.MAIL_SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
  });
}

export async function POST(request: NextRequest) {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      return NextResponse.json({ error: "SMTP not configured" }, { status: 500 });
    }

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
    } else if (type === "opinion") {
      const { category, title, content, name, phone } = body;
      subject = `[의견] 주민 의견이 접수되었습니다 - ${category}`;
      html = `
        <h2>주민 의견이 접수되었습니다</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;width:120px;">카테고리</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${category}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">제목</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${title}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">내용</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${content}</td>
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
    } else if (type === "donation") {
      const { name, amount, depositDate } = body;
      subject = `[후원] 새로운 후원금 입금정보가 접수되었습니다`;
      html = `
        <h2>새로운 후원금 입금정보가 접수되었습니다</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;width:120px;">후원자</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${name || "익명"}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">금액</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${Number(amount).toLocaleString("ko-KR")}원</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">입금일자</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${depositDate}</td>
          </tr>
        </table>
      `;
    } else if (type === "observer") {
      const { name, phone, address, observerType, availableDate, message } = body;
      subject = `[참관인] 투개표참관인 신청이 접수되었습니다`;
      html = `
        <h2>투개표참관인 신청이 접수되었습니다</h2>
        <table style="border-collapse:collapse;width:100%;max-width:600px;">
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;width:120px;">이름</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">연락처</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${phone}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">거주지</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${address || "(미입력)"}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">참관 유형</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${observerType.join(", ")}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">가능한 시간</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${availableDate || "(미입력)"}</td>
          </tr>
          <tr>
            <td style="padding:8px 12px;border:1px solid #ddd;background:#f5f5f5;font-weight:bold;">메시지</td>
            <td style="padding:8px 12px;border:1px solid #ddd;">${message || "(없음)"}</td>
          </tr>
        </table>
      `;
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const to = type === "donation"
      ? process.env.DONATION_EMAIL || process.env.ADMIN_EMAIL
      : process.env.ADMIN_EMAIL;

    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
