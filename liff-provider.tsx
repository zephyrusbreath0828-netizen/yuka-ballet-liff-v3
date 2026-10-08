"use client";

import { useEffect, useState } from "react";
import { AuthContext } from "@/lib/user-context";
import { initLiff, getLiffProfile, isLiffLoggedIn, liffLogin } from "@/lib/liff";
import { upsertUserOnLogin } from "@/lib/firestore";
import type { AppUser } from "@/lib/types";

/**
 * LINEログイン連携（クライアントサイドのみ）。
 *
 * 1. liff.init()
 * 2. liff.isLoggedIn() を確認（未ログインなら liff.login() でリダイレクト）
 * 3. liff.getProfile() で userId / displayName / pictureUrl を取得
 * 4. Firebase Web SDK で users/{lineUserId} へ直接保存
 *
 * サーバーAPI（/api/auth/line 等）は一切使用しない。
 * LIFF SDK は window に依存するため、このプロバイダは dynamic(import, { ssr: false }) で読み込む。
 */
export default function LiffProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initLiff();

        // LINEアプリ外（PCブラウザ等）で開かれた場合はLINEログインへ
        if (!isLiffLoggedIn()) {
          liffLogin();
          return;
        }

        const profile = await getLiffProfile();
        const u = await upsertUserOnLogin(profile);
        if (!cancelled) {
          setUser(u);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "LIFFの初期化に失敗しました"
          );
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {error ? (
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            <p className="font-bold">ログインに失敗しました</p>
            <p className="mt-1 break-all">{error}</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
