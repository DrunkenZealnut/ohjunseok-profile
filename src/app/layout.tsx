import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Navbar from "@/components/navbar";
import PageTracker from "@/components/page-tracker";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "오준석 | 기호 5번 진보당 이문동 구의원 후보",
  description:
    "우리 동네 육아 해결사! 세 아이를 키우는 아빠, 주민 3,025명과 함께 달빛어린이병원을 요구한 사람. 기호 5번 진보당 오준석.",
  openGraph: {
    title: "오준석 | 기호 5번 진보당 이문동 구의원 후보",
    description: "우리 동네 육아 해결사!",
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
      <body className="min-h-screen">
        <Navbar />
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
