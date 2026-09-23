"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/students", label: "生徒", icon: "🩰" },
  { href: "/lessons", label: "予定", icon: "🗓" },
  { href: "/attendance", label: "出欠", icon: "✅" },
  { href: "/announcements", label: "お知らせ", icon: "📣" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-white/95 backdrop-blur">
      <ul className="mx-auto flex max-w-app items-stretch justify-between px-1 pt-1.5">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-medium transition ${
                  active ? "text-brand-600" : "text-ink-500 hover:text-brand-500"
                }`}
              >
                <span
                  className={`text-lg leading-none transition ${
                    active ? "scale-110" : "opacity-70"
                  }`}
                  aria-hidden
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                <span
                  className={`h-0.5 w-5 rounded-full transition ${
                    active ? "bg-brand-500" : "bg-transparent"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
