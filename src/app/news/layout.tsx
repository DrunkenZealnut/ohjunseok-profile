import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "활동 소식 | 오준석",
  description: "이문동을 위한 오준석 후보의 활동 소식",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
