"use client";

import { useState } from "react";
import { useUser } from "@/lib/user-context";
import { CameraCapture, PageTitle } from "@/components/common";
import { Toast, useToast } from "@/components/ui";
import { scanQrCode } from "@/lib/liff";

/** QR出席: LIFFのQRスキャナーまたはカメラ起動で読み取る */
export default function QrPage() {
  const { user } = useUser();
  const { state, show } = useToast();
  const [scanning, setScanning] = useState(false);

  const onScan = async () => {
    setScanning(true);
    try {
      const value = await scanQrCode();
      if (value) {
        // QRに埋め込まれたレッスンIDを愛知に読み取る実装（デモでは表示のみ）
        show("success", `読み取り成功: ${value}`);
      } else {
        show("error", "読み取りに失敗しました");
      }
    } catch (e) {
      show("error", e instanceof Error ? e.message : "読み取りエラー");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageTitle>QR出席</PageTitle>
      <div className="rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-sm">
        <p className="font-bold">出席方法</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>スタジオに設置されたQRコードを読み取る</li>
          <li>講師に出席を確認してもらう</li>
        </ol>
        {user && (
          <p className="mt-3 text-xs text-gray-500">
            {user.displayName}（会員番号 {user.memberNumber || "未登録"}）
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onScan}
        disabled={scanning}
        className="w-full rounded-xl bg-gray-900 py-3 font-bold text-white disabled:bg-gray-300"
      >
        {scanning ? "起動中…" : "QRコードをスキャンする"}
      </button>
      <CameraCapture
        onCapture={(file) => {
          // 撮影した画像は講師確認用にそのまま提示する（簡易実装）
          show("success", "画像を取得しました。講師にご提示ください。");
          void file;
        }}
      />
      <Toast state={state} />
    </div>
  );
}
