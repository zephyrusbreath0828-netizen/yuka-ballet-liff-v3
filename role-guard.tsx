"use client";

import { useUser } from "@/lib/user-context";
import { Loading } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * 権限ガード: role が許可リストにない場合はリダイレクト。
 * ※ 実際のデータ保護は Firestore セキュリティルールで行う（firestore.rules 参照）。
 */
export function RoleGuard({
  allow,
  children,
}: {
  allow: Array<"student" | "teacher" | "admin">;
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && !allow.includes(user.role)) {
      router.replace("/");
    }
  }, [loading, user, allow, router]);

  if (loading || !user) return <Loading />;
  if (!allow.includes(user.role)) return <Loading label="権限を確認中…" />;
  return <>{children}</>;
}
