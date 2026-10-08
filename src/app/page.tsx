"use client";

import { useUser } from "@/lib/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/components/ui";

/** 入口: ログイン済みなら権限に応じて各画面へリダイレクト */
export default function RootPage() {
  const { user, loading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    if (user.role === "admin") router.replace("/admin");
    else if (user.role === "teacher") router.replace("/teacher");
    else router.replace("/home");
  }, [user, loading, router]);

  // エラー時: ローディングで止めず、原因を表示する
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl bg-red-50 p-5 text-sm text-red-700">
          <p className="font-bold">ログインに失敗しました</p>
          <p className="mt-2 break-all">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 w-full rounded-xl bg-red-600 py-2.5 font-bold text-white"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <Loading label="LINEにログインしています…" />;

  // 未ログイン（liff.login() によるリダイレクト待ち）
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center text-sm text-gray-500">
        LINEログインへ移動しています…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-lg font-bold">YUKA Ballet Art</p>
      <p className="text-sm text-gray-500">
        メニューから画面を選択してください
      </p>
      <div className="flex gap-2">
        <a
          href="/home"
          className="rounded-full bg-ballet-600 px-5 py-2.5 text-sm font-bold text-white"
        >
          ホーム
        </a>
        <a
          href="/profile"
          className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700"
        >
          プロフィール
        </a>
        <a
          href="/settings"
          className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700"
        >
          設定
        </a>
      </div>
    </div>
  );
}
