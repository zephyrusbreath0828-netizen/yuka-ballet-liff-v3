"use client";

import { useUser } from "@/lib/user-context";
import { PageTitle } from "@/components/common";
import { Loading } from "@/components/ui";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  student: "生徒・保護者",
  teacher: "講師",
  admin: "管理者",
};

export default function ProfilePage() {
  const { user, loading } = useUser();
  if (loading || !user) return <Loading />;

  return (
    <div className="space-y-4">
      <PageTitle>プロフィール</PageTitle>
      <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
        {user.pictureUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.pictureUrl}
            alt="LINEアイコン"
            className="mx-auto h-20 w-20 rounded-full border-4 border-ballet-200 object-cover"
          />
        ) : (
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ballet-100 text-2xl">
            🩰
          </div>
        )}
        <p className="mt-3 text-lg font-bold">{user.displayName}</p>
        <span className="mt-1 inline-block rounded-full bg-ballet-100 px-3 py-0.5 text-xs font-bold text-ballet-700">
          {ROLE_LABELS[user.role] ?? user.role}
        </span>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <dl className="divide-y divide-gray-100 text-sm">
          <div className="flex justify-between py-2.5">
            <dt className="text-gray-500">会員番号</dt>
            <dd className="font-bold">{user.memberNumber || "未登録"}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-gray-500">所属クラス</dt>
            <dd className="font-bold">{user.className || "未登録"}</dd>
          </div>
        </dl>
      </div>
      <Link href="/settings" className="block rounded-xl bg-gray-100 py-3 text-center text-sm font-bold text-gray-700">
        設定へ
      </Link>
    </div>
  );
}
