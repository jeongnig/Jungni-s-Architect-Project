import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "정니의 건축사 공부 플래너",
  description: "9월 12일 건축사 시험을 위한 개인 공부 플래너",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/[email protected]/dist/web/variable/pretendardvariable.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
