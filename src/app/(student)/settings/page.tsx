"use client";

import { useState } from "react";
import { useUser } from "@/lib/user-context";
import { PageTitle } from "@/components/common";
import { Greeting, Loading } from "@/components/ui";
import { firebaseProjectId } from "@/lib/firebase";
import { writeTestConnection } from "@/lib/firestore";

/** アプリ設定画面: Firestore接続確認機能を含む */
export default function SettingsPage() {
  const { user, loading } = useUser();
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<
    { ok: true; id: string } | { ok: false; error: string } | null
  >(null);

  if (loading || !user) return <Loading />;

  const onTest = async () => {
    setTesting(true);
    setResult(null);
    const res = await writeTestConnection(firebaseProjectId || "(未設定)");
    setResult(res);
    setTesting(false);
  };

  return (
    <div className="space-y-4">
      <PageTitle>設定</PageTitle>

      {/* ログイン成功の確認（「こんにちは、〇〇さん」） */}
      <Greeting displayName={user.displayName} role={user.role} />

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="font-bold">Firestore接続確認</p>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Firebase Project ID</dt>
            <dd className="break-all text-right font-mono text-xs font-bold">
              {firebaseProjectId || "未設定"}
            </dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-gray-500">Firestore Database ID</dt>
            <dd className="break-all text-right font-mono text-xs font-bold">
              (default)
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onTest}
          disabled={testing}
          className="mt-4 w-full rounded-xl bg-gray-900 py-3 font-bold text-white disabled:bg-gray-300"
        >
          {testing ? "テスト中…" : "接続テスト"}
        </button>

        {result && (
          <div
            className={`mt-3 rounded-xl p-3 text-sm ${
              result.ok
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {result.ok ? (
              <>
                <p className="font-bold">Firestore接続成功</p>
                <p className="mt-1 text-xs">
                  ドキュメントID: {result.id}
                </p>
              </>
            ) : (
              <>
                <p className="font-bold">Firestore接続失敗</p>
                <p className="mt-1 break-all text-xs">{result.error}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-4 text-sm shadow-sm">
        <p className="font-bold">アプリについて</p>
        <p className="mt-2 text-gray-500">
          YUKA Ballet Art 会員管理 / バージョン 1.0.0
        </p>
        <p className="mt-1 text-gray-500">LINE Login / LIFF / Firebase</p>
      </div>
    </div>
  );
}
