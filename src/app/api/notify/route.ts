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
      const { name, amount, depositDate, donorEmail } = body;
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

      // 후원자 이메일이 있으면 감사 메일 발송
      if (donorEmail) {
        const thankYouSubject = "소중한 후원에 감사드립니다 - 오준석 후보";
        const thankYouHtml = `
          <div style="max-width:600px;margin:0 auto;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
            <div style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px;text-align:center;border-radius:12px 12px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:24px;">감사합니다</h1>
            </div>
            <div style="padding:32px;background:#fff;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 12px 12px;">
              <p style="font-size:16px;color:#333;line-height:1.8;margin:0 0 16px;">
                <strong>${name || "후원자"}</strong>님, 안녕하세요.
              </p>
              <p style="font-size:16px;color:#333;line-height:1.8;margin:0 0 16px;">
                오준석 후보에게 보내주신 소중한 후원에 진심으로 감사드립니다.
              </p>
              <table style="border-collapse:collapse;width:100%;margin:20px 0;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 16px;background:#f0f9ff;border:1px solid #bae6fd;font-weight:bold;color:#0369a1;width:120px;">후원 금액</td>
                  <td style="padding:12px 16px;border:1px solid #bae6fd;color:#333;">${Number(amount).toLocaleString("ko-KR")}원</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f0f9ff;border:1px solid #bae6fd;font-weight:bold;color:#0369a1;">입금일자</td>
                  <td style="padding:12px 16px;border:1px solid #bae6fd;color:#333;">${depositDate}</td>
                </tr>
              </table>
              <p style="font-size:16px;color:#333;line-height:1.8;margin:0 0 16px;">
                보내주신 후원금은 더 나은 지역사회를 만들기 위해 소중하게 사용하겠습니다.
                기부금영수증은 확인 후 발급해 드리겠습니다.
              </p>
              <p style="font-size:16px;color:#333;line-height:1.8;margin:0;">
                다시 한번 깊이 감사드립니다.
              </p>
              <div style="margin-top:24px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;">
                <p style="font-size:14px;color:#6b7280;margin:0;">오준석 후보 선거사무소</p>
              </div>
            </div>
          </div>
        `;

        transporter.sendMail({
          from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`,
          to: donorEmail,
          subject: thankYouSubject,
          html: thankYouHtml,
        }).catch((err: unknown) => console.error("Donor thank-you email failed:", err));
      }
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
