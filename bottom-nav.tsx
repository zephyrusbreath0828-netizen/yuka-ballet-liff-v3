"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "ホーム", icon: "🏠" },
  { href: "/schedule", label: "予定確認", icon: "📅" },
  { href: "/talk", label: "トーク", icon: "💬" },
  { href: "/payments", label: "集金", icon: "¥" },
];

export default function BottomNav() {
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-gray-600 active:bg-gray-50"
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
      <div className="hidden">
        <Link href="/profile">プロフィール</Link>
        <Link href="/settings">設定</Link>
      </div>
    </nav>
  );
}
