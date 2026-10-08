"use client";

import Link from "next/link";

const MENU = [
  { href: "/admin/students", label: "生徒一覧", icon: "👥" },
  { href: "/admin/lessons", label: "レッスン管理", icon: "🩰" },
  { href: "/admin/attendance", label: "出席管理", icon: "✅" },
  { href: "/admin/announcements", label: "お知らせ管理", icon: "📢" },
  { href: "/admin/payments", label: "集金管理", icon: "💰" },
  { href: "/settings", label: "Firestore接続確認", icon: "🔌" },
];

export default function AdminPage() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {MENU.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 active:bg-gray-50"
        >
          <span className="text-2xl">{m.icon}</span>
          <p className="mt-2 text-sm font-bold text-gray-800">{m.label}</p>
        </Link>
      ))}
    </div>
  );
}
