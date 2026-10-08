"use client";

import { useEffect, useState } from "react";
import { Card, PageTitle, PrimaryButton, SelectField } from "@/components/common";
import { EmptyState, Loading, Toast, useToast } from "@/components/ui";
import { listUsers, updateUserRole, formatDateTime } from "@/lib/firestore";
import type { AppUser, Role } from "@/lib/types";

const ROLE_LABELS: Record<Role, string> = {
  student: "生徒・保護者",
  teacher: "講師",
  admin: "管理者",
};

export default function AdminStudentsPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AppUser[]>([]);
  const { state, show } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setUsers(await listUsers());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onRoleChange = async (uid: string, role: Role) => {
    await updateUserRole(uid, role);
    setUsers((prev) =>
      prev.map((u) => (u.uid === uid ? { ...u, role } : u))
    );
    show("success", "権限を更新しました");
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageTitle>生徒一覧</PageTitle>
      {users.length === 0 ? (
        <EmptyState label="ユーザーがまだいません" />
      ) : (
        users.map((u) => (
          <Card key={u.uid}>
            <div className="flex items-center gap-3">
              {u.pictureUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={u.pictureUrl}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ballet-100">
                  🩰
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold">{u.displayName}</p>
                <p className="text-xs text-gray-500">
                  会員番号: {u.memberNumber || "未登録"} / {u.className || "クラス未登録"}
                </p>
                <p className="text-xs text-gray-400">
                  最終ログイン: {formatDateTime(u.lastLoginAt)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <SelectField
                label="権限"
                value={u.role}
                onChange={(v) => onRoleChange(u.uid, v as Role)}
                options={(Object.keys(ROLE_LABELS) as Role[]).map((r) => ({
                  value: r,
                  label: ROLE_LABELS[r],
                }))}
              />
            </div>
          </Card>
        ))
      )}
      <PrimaryButton onClick={() => window.location.reload()}>再読み込み</PrimaryButton>
      <Toast state={state} />
    </div>
  );
}
