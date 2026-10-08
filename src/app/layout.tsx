import type { Metadata, Viewport } from "next";
import "./globals.css";
import UserProvider from "@/lib/user-provider";

export const metadata: Metadata = {
  title: "YUKA Ballet Art",
  description: "YUKA Ballet Art バレエ教室 会員・予約管理LINEミニアプリ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {/* LIFF 初期化 → ログイン状態を全画面へ配布（これが無いと loading が true のまま停止する） */}
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
