"use client";

import { useState } from "react";
import { Card, EmptyState, SectionTitle } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import RoleSwitcher from "@/components/RoleSwitcher";
import { missingFirebaseKeys } from "@/lib/env";
import { ROLE_LABEL } from "@/lib/types";

export default function SettingsPage() {
  const { role, profile, lineProfile, mode, demoMode, error, signInWithLine, signOutUser } =
    useAuth();
  const [busy, setBusy] = useState(false);
  const missing = missingFirebaseKeys();

  return (
    <div className="space-y-5">
      <SectionTitle title="設定・アカウント" />

      <Card>
        <p className="text-[12px] font-semibold text-ink-900">ログイン状態</p>
        <dl className="mt-2 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <dt className="text-ink-500">モード</dt>
            <dd className="font-medium text-ink-900">
              {demoMode ? "デモ（Firebase 未設定）" : mode}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">ロール</dt>
            <dd className="font-medium text-ink-900">{ROLE_LABEL[role]}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">表示名</dt>
            <dd className="font-medium text-ink-900">
              {profile?.displayName ?? lineProfile?.displayName ?? "ゲスト"}
            </dd>
          </div>
          {profile?.uid ? (
            <div className="flex justify-between gap-3">
              <dt className="text-ink-500">UID</dt>
              <dd className="truncate font-medium text-ink-900">{profile.uid}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-3 flex gap-2">
          {!demoMode ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void signInWithLine().finally(() => setBusy(false));
              }}
              className="flex-1 rounded-xl bg-brand-500 py-2.5 text-[12px] font-semibold text-white disabled:bg-brand-200"
            >
              LINE で再ログイン
            </button>
          ) : null}
          {!demoMode && profile ? (
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="flex-1 rounded-xl border border-brand-300 py-2.5 text-[12px] font-semibold text-brand-600"
            >
              ログアウト
            </button>
          ) : null}
        </div>
      </Card>

      {error ? (
        <Card className="border-rose-200 bg-rose-50">
          <p className="text-[11px] leading-relaxed text-rose-700">{error}</p>
        </Card>
      ) : null}

      <RoleSwitcher />

      {missing.length > 0 ? (
        <Card>
          <p className="text-[12px] font-semibold text-ink-900">未設定の環境変数</p>
          <ul className="mt-2 space-y-1">
            {missing.map((key) => (
              <li key={key} className="font-mono text-[10px] text-ink-500">
                {key}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[10px] leading-relaxed text-ink-500">
            Vercel の Environment Variables、またはローカルの .env.local に設定してください。
            設定後は再デプロイ（または dev サーバーの再起動）が必要です。
          </p>
        </Card>
      ) : (
        <EmptyState message="すべての環境変数が設定されています。" />
      )}

      <Card>
        <p className="text-[12px] font-semibold text-ink-900">YUKA Ballet Art</p>
        <p className="mt-1 text-[10px] leading-relaxed text-ink-500">
          LINE ミニアプリ版 v1.0.0｜Next.js 15（App Router）・TypeScript・Tailwind CSS・Firebase v11・LIFF SDK
        </p>
      </Card>
    </div>
  );
}
