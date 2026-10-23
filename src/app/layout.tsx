import type { Metadata, Viewport } from "next";
import { Geist_Mono, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";

// 中文字型檔很大，不預先載入，交給瀏覽器依需要的字分段下載
const notoSans = Noto_Sans_TC({
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
  preload: false,
  display: "swap",
});

const notoSerif = Noto_Serif_TC({
  variable: "--font-noto-serif",
  weight: ["600", "900"],
  preload: false,
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "議記 — AI 會議記錄",
  description: "上傳會議錄音，自動產生逐字稿、摘要、重點與待辦事項。",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#14130f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-Hant"
      className={`${notoSans.variable} ${notoSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
