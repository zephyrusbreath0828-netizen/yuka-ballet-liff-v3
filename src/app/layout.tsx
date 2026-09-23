import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth-context";
import AppShell from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "YUKA Ballet Art | LINEミニアプリ",
  description:
    "YUKA Ballet Art の生徒管理・出欠管理・レッスンスケジュール・お知らせをスマホから確認できる LINE ミニアプリです。",
  applicationName: "YUKA Ballet Art",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ec4899",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
