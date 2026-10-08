"use client";

import { useUser } from "@/lib/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/components/ui";

/** 入口: ログイン済みなら権限に応じて各画面へリダイレクト */
export default function RootPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.role === "admin") router.replace("/admin");
    else if (user.role === "teacher") router.replace("/teacher");
    else router.replace("/home");
  }, [user, loading, router]);

  if (loading || !user) return <Loading />;
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
