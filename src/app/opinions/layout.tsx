import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "주민 의견함 | 오준석",
  description: "이문동 생활 개선을 위한 주민 의견을 들려주세요",
};

export default function OpinionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
