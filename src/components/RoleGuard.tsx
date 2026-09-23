"use client";

import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL, type Role } from "@/lib/types";
import { EmptyState } from "./ui";

/** ロール別の閲覧制御。権限がない場合は案内を表示する。 */
export default function RoleGuard({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { role, ready } = useAuth();

  if (!ready) return null;

  if (!allow.includes(role)) {
    return (
      <EmptyState
        message={`この画面は${allow.map((r) => ROLE_LABEL[r]).join("・")}専用です。現在のロールは「${ROLE_LABEL[role]}」です。設定画面からロールを切り替えられます。`}
      />
    );
  }

  return <>{children}</>;
}
