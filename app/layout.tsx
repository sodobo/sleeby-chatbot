import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "(주)슬리피 AI 고객상담 챗봇",
  description: "디지털 수면/이완 제품 전문 AI 고객상담 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
