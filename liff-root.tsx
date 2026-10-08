"use client";

import dynamic from "next/dynamic";

// LIFF SDK は window 依存のため SSR を無効化して読み込む
const LiffProvider = dynamic(() => import("@/components/liff-provider"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
    </div>
  ),
});

export default function LiffRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LiffProvider>{children}</LiffProvider>;
}
