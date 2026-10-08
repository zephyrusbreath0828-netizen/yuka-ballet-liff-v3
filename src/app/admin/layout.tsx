import Link from "next/link";
import { RoleGuard } from "@/components/role-guard";

const MENU = [
  { href: "/admin/students", label: "生徒一覧", icon: "👥" },
  { href: "/admin/lessons", label: "レッスン管理", icon: "🩰" },
  { href: "/admin/attendance", label: "出席管理", icon: "✅" },
  { href: "/admin/announcements", label: "お知らせ管理", icon: "📢" },
  { href: "/admin/payments", label: "集金管理", icon: "💰" },
  { href: "/settings", label: "Firestore接続確認", icon: "🔌" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={["admin"]}>
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <header className="bg-gray-900 px-4 pb-4 pt-6 text-white">
          <p className="text-xs opacity-70">YUKA Ballet Art</p>
          <h1 className="text-lg font-bold">管理者メニュー</h1>
        </header>
        <main className="flex-1 px-4 py-4">{children}</main>
        <footer className="px-4 pb-8">
          <Link href="/" className="block text-center text-xs text-gray-400">
            トップへ戻る
          </Link>
        </footer>
      </div>
    </RoleGuard>
  );
}


