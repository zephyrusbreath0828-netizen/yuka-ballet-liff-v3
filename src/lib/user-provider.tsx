"use client";

import { useEffect, useState } from "react";
import { AuthContext } from "@/lib/user-context";
import { upsertUserOnLogin } from "@/lib/firestore";
import type { AppUser } from "@/lib/types";

/**
 * LINEログイン連携プロバイダ（クライアントサイド専用）。
 *
 * 処理フロー:
 *   1. NEXT_PUBLIC_LIFF_ID の存在確認（無ければエラー）
 *   2. @line/liff を useEffect 内で dynamic import（SSR に window を触らせない）
 *   3. liff.init()
 *   4. 未ログインなら liff.login() で LINE ログインへ
 *   5. liff.getProfile() で userId / displayName / pictureUrl を取得して user にセット
 *   6. Firebase Web SDK で users/{lineUserId} を非ブロッキング保存
 *   7. 成功・失敗いずれの場合も finally で loading=false（無限ローディングを防止）
 *   8. 失敗時は error をセットし、画面側でエラー表示
 *
 * サーバーAPI（Route Handler 等）は一切使用しない。LIFF → Firebase Web SDK → Firestore のみ。
 */
export default function UserProvider({
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
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          throw new Error(
            "LIFF ID が設定されていません。環境変数 NEXT_PUBLIC_LIFF_ID を確認してください。"
          );
        }

        // window 依存の SDK は動的 import で読み込む（SSR 対策）
        const liff = (await import("@line/liff")).default;
        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const profile = await liff.getProfile();

        const nextUser: AppUser = {
          uid: profile.userId,
          lineUserId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl ?? null,
          role: "student",
          memberNumber: "",
          className: "",
        };

        if (!cancelled) {
          setUser(nextUser);
          setLoading(false);
        }

        // Firestore への保存は画面表示を待たせない（非ブロッキング）
        upsertUserOnLogin({
          userId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl ?? null,
        })
          .then((saved) => {
            if (!cancelled && saved) setUser(saved);
          })
          .catch((e) => {
            // 保存失敗でも画面は表示する（ログイン自体は成功しているため）
            console.error("Firestore へのユーザー保存に失敗しました:", e);
          });
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "LIFFの初期化に失敗しました"
          );
        }
      } finally {
        // 成功・失敗・未ログインのいずれでも必ず loading を解除する
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
