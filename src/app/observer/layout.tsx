import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "투개표참관인 신청 | 오준석",
  description: "공정한 선거를 함께 지켜주세요",
};

export default function ObserverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
