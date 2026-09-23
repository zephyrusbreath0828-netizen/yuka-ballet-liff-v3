"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loading, SectionTitle } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { formatDateLabel, todayISO } from "@/lib/format";
import {
  fetchAnnouncements,
  fetchLessons,
  fetchStats,
  type DashboardStats,
} from "@/lib/repository";
import { upcomingLessons } from "@/lib/functions";
import { ROLE_LABEL, type Announcement, type Lesson } from "@/lib/types";

const ROLE_SHORTCUTS: Record<string, Array<{ href: string; label: string; icon: string }>> = {
  admin: [{ href: "/admin", label: "管理者画面", icon: "⚙️" }],
  teacher: [{ href: "/teacher", label: "講師画面", icon: "🎼" }],
  parent: [{ href: "/parent", label: "保護者画面", icon: "👨‍👩‍👧" }],
};

export default function HomePage() {
  const { role, profile, lineProfile, ready } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [s, l, a] = await Promise.all([
          fetchStats(),
          fetchLessons(),
          fetchAnnouncements(),
        ]);
        if (!alive) return;
        setStats(s);
        setLessons(l);
        setAnnouncements(a);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const name = profile?.displayName ?? lineProfile?.displayName ?? "ゲスト";
  const next = upcomingLessons(lessons).slice(0, 3);
  const pinned = announcements.filter((a) => a.pinned).slice(0, 1);
  const latest = announcements.slice(0, 3);

  return (
    <div className="space-y-5">
      <section>
        <p className="text-[11px] text-ink-500">{formatDateLabel(todayISO())}</p>
        <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-ink-900">
          こんにちは、{name} さん
        </h1>
        <p className="mt-0.5 text-[11px] text-ink-500">
          ロール：{ROLE_LABEL[role]}｜YUKA Ballet Art 公式ミニアプリ
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2">
        {[
          { label: "生徒", value: stats?.students, href: "/students", icon: "🩰" },
          { label: "レッスン", value: stats?.lessons, href: "/lessons", icon: "🗓" },
          { label: "お知らせ", value: stats?.announcements, href: "/announcements", icon: "📣" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="flex flex-col items-center gap-0.5 p-3">
              <span className="text-base" aria-hidden>
                {item.icon}
              </span>
              <span className="text-xl font-bold text-brand-600">
                {item.value ?? "-"}
              </span>
              <span className="text-[10px] font-medium text-ink-500">{item.label}</span>
            </Card>
          </Link>
        ))}
      </section>

      <section>
        <SectionTitle title="ロール別メニュー" />
        <div className="grid grid-cols-2 gap-2">
          {[
            ...(ROLE_SHORTCUTS[role] ?? []),
            { href: "/settings", label: "設定・ログイン", icon: "🔧" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="flex items-center gap-2 p-3">
                <span className="text-lg" aria-hidden>
                  {item.icon}
                </span>
                <span className="text-[12px] font-semibold text-ink-700">
                  {item.label}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {pinned.length > 0 ? (
        <section>
          <SectionTitle title="重要なお知らせ" />
          {pinned.map((a) => (
            <Link key={a.id} href={`/announcements/${a.id}`}>
              <Card className="border-brand-300 bg-brand-50/60">
                <div className="mb-1 flex items-center gap-2">
                  <Badge tone="rose">ピン留め</Badge>
                  <span className="text-[10px] text-ink-500">
                    {formatDateLabel(a.publishedOn)}
                  </span>
                </div>
                <p className="text-[13px] font-semibold text-ink-900">{a.title}</p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink-500">
                  {a.body}
                </p>
              </Card>
            </Link>
          ))}
        </section>
      ) : null}

      <section>
        <SectionTitle
          title="次のレッスン"
          action={
            <Link href="/lessons" className="text-[11px] font-semibold text-brand-600">
              すべて見る
            </Link>
          }
        />
        {loading ? (
          <Loading />
        ) : next.length === 0 ? (
          <EmptyState message="予定されているレッスンはありません。" />
        ) : (
          <ul className="space-y-2">
            {next.map((lesson) => (
              <li key={lesson.id}>
                <Link href={`/lessons/${lesson.id}`}>
                  <Card className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-ink-900">
                        {lesson.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-ink-500">
                        {formatDateLabel(lesson.date)} {lesson.startTime}〜{lesson.endTime}
                      </p>
                      <p className="text-[11px] text-ink-500">
                        {lesson.studio}｜{lesson.teacherName}
                      </p>
                    </div>
                    <Badge tone="brand">{lesson.studentIds.length}名</Badge>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle
          title="お知らせ"
          action={
            <Link href="/announcements" className="text-[11px] font-semibold text-brand-600">
              すべて見る
            </Link>
          }
        />
        {loading ? (
          <Loading />
        ) : latest.length === 0 ? (
          <EmptyState message="お知らせはまだありません。" />
        ) : (
          <ul className="space-y-2">
            {latest.map((a) => (
              <li key={a.id}>
                <Link href={`/announcements/${a.id}`}>
                  <Card>
                    <div className="flex items-center gap-2">
                      {a.pinned ? <Badge tone="rose">重要</Badge> : null}
                      <span className="text-[10px] text-ink-500">
                        {formatDateLabel(a.publishedOn)}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] font-semibold text-ink-900">{a.title}</p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!ready ? <p className="text-center text-[10px] text-ink-500">読み込み中…</p> : null}
    </div>
  );
}
