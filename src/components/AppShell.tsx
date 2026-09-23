"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL } from "@/lib/types";
import BottomNav from "./BottomNav";

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-brand-600 text-white",
  teacher: "bg-indigo-500 text-white",
  parent: "bg-emerald-500 text-white",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { role, profile, lineProfile, demoMode, notice } = useAuth();
  const displayName = profile?.displayName ?? lineProfile?.displayName ?? "ゲスト";
  const pictureUrl = profile?.pictureUrl ?? lineProfile?.pictureUrl;

  return (
    <div className="mx-auto flex min-h-dvh max-w-app flex-col bg-[var(--background)]">
      <header className="safe-top sticky top-0 z-30 border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-lg">
              🩰
            </span>
            <span className="leading-tight">
              <span className="block text-[15px] font-semibold tracking-tight text-ink-900">
                YUKA Ballet Art
              </span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-brand-500">
                LINE Mini App
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                ROLE_BADGE[role] ?? "bg-ink-100 text-ink-700"
              }`}
            >
              {ROLE_LABEL[role]}
            </span>
            <Link href="/settings" aria-label="設定">
              {pictureUrl ? (
                <Image
                  src={pictureUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 rounded-full border border-brand-100 object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm">
                  👤
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {notice ? (
        <p className="mx-4 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-800">
          {notice}
        </p>
      ) : null}

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <BottomNav />

      {demoMode ? (
        <span className="fixed bottom-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink-900/80 px-3 py-1 text-[10px] font-medium text-white">
          デモモード
        </span>
      ) : null}
    </div>
  );
}
