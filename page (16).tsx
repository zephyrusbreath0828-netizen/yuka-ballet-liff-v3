"use client";

import { useUser } from "@/lib/user-context";
import { PageTitle, PrimaryButton } from "@/components/common";
import { openLineTalk } from "@/lib/liff";

/** 画面下ナビ「トーク」: LINE公式アカウントとのトーク画面へ */
export default function TalkPage() {
  const { user } = useUser();
  return (
    <div className="space-y-4">
      <PageTitle>トーク</PageTitle>
      <div className="rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-sm">
        <p className="font-bold">YUKA Ballet Art 公式LINE</p>
        <p className="mt-2">
          レッスンに関するご質問・お問い合わせは公式アカウントのトークからお送りください。
        </p>
        {user && (
          <p className="mt-2 text-xs text-gray-500">
            ご本人様: {user.displayName}（会員番号 {user.memberNumber || "未登録"}）
          </p>
        )}
      </div>
      <PrimaryButton onClick={openLineTalk}>LINEトークを開く</PrimaryButton>
    </div>
  );
}
