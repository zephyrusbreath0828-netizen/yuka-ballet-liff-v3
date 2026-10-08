import type { ReactNode } from "react";
import BottomNav from "@/components/bottom-nav";
import { RoleGuard } from "@/components/role-guard";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard allow={["student", "teacher", "admin"]}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
        <BottomNav />
      </div>
    </RoleGuard>
  );
}
