import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "오준석 | 진보당 이문동 구의원 후보",
  description:
    "주민과 함께 일해온 사람, 진보당 이문동 구의원 후보 오준석입니다.",
  openGraph: {
    title: "오준석 | 진보당 이문동 구의원 후보",
    description: "주민과 함께 일해온 사람",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
