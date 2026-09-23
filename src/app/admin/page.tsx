"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { Badge, Card, EmptyState, Loading, SectionTitle } from "@/components/ui";
import { formatDateLabel, todayISO } from "@/lib/format";
import {
  createAnnouncement,
  createStudent,
  deleteAnnouncement,
  deleteStudent,
  fetchAnnouncements,
  fetchStats,
  listUsers,
  seedDemoData,
  updateUserRole,
  type DashboardStats,
} from "@/lib/repository";
import { buildAttendanceSummaries, type StudentAttendanceSummary } from "@/lib/functions";
import {
  AUDIENCE_LABEL,
  LEVEL_LABEL,
  ROLE_LABEL,
  type Announcement,
  type Audience,
  type Level,
  type Role,
  type UserProfile,
} from "@/lib/types";

export default function AdminPage() {
  const [tab, setTab] = useState<"overview" | "students" | "announcements" | "users">(
    "overview",
  );
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<StudentAttendanceSummary[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // 生徒登録フォーム
  const [name, setName] = useState("");
  const [nameKana, setNameKana] = useState("");
  const [level, setLevel] = useState<Level>("beginner");

  // お知らせ登録フォーム
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [pinned, setPinned] = useState(false);

  async function reload() {
    const [s, summaries, a, u] = await Promise.all([
      fetchStats(),
      buildAttendanceSummaries(),
      fetchAnnouncements(),
      listUsers(),
    ]);
    setStats(s);
    setStudents(summaries);
    setAnnouncements(a);
    setUsers(u);
  }

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        await reload();
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleCreateStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createStudent({
        name: name.trim(),
        nameKana: nameKana.trim() || name.trim(),
        level,
        active: true,
      });
      setName("");
      setNameKana("");
      setMessage("生徒を登録しました。");
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? `登録に失敗: ${err.message}` : "登録に失敗しました。");
    }
  }

  async function handleCreateAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      await createAnnouncement({
        title: title.trim(),
        body: body.trim(),
        audience,
        pinned,
        authorName: "管理者",
        publishedOn: todayISO(),
      });
      setTitle("");
      setBody("");
      setPinned(false);
      setMessage("お知らせを投稿しました。");
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? `投稿に失敗: ${err.message}` : "投稿に失敗しました。");
    }
  }

  async function handleSeed() {
    try {
      const count = await seedDemoData();
      setMessage(`初期データを ${count} 件投入しました。`);
      await reload();
    } catch (err) {
      setMessage(err instanceof Error ? `投入に失敗: ${err.message}` : "投入に失敗しました。");
    }
  }

  const TABS: Array<[typeof tab, string]> = [
    ["overview", "概要"],
    ["students", "生徒管理"],
    ["announcements", "お知らせ"],
    ["users", "権限"],
  ];

  return (
    <RoleGuard allow={["admin"]}>
      <div className="space-y-4">
        <SectionTitle title="管理者画面" />

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                tab === key
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-brand-200 bg-white text-ink-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {message ? (
          <p className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-[11px] text-brand-700">
            {message}
          </p>
        ) : null}

        {loading ? (
          <Loading />
        ) : tab === "overview" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {[
                ["生徒", stats?.students],
                ["講師", stats?.teachers],
                ["レッスン", stats?.lessons],
                ["お知らせ", stats?.announcements],
              ].map(([label, value]) => (
                <Card key={String(label)} className="text-center">
                  <p className="text-2xl font-bold text-brand-600">{value ?? "-"}</p>
                  <p className="text-[11px] text-ink-500">{label}</p>
                </Card>
              ))}
            </div>

            <Card>
              <p className="text-[12px] font-semibold text-ink-900">初期データ投入</p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                Firestore に講師・生徒・お知らせのサンプルデータを書き込みます（既存データは上書きされません）。
              </p>
              <button
                type="button"
                onClick={handleSeed}
                className="mt-3 w-full rounded-xl border border-brand-300 bg-white py-2.5 text-[12px] font-semibold text-brand-600"
              >
                デモデータを投入する
              </button>
            </Card>

            <Card>
              <p className="text-[12px] font-semibold text-ink-900">出席率ランキング</p>
              <ul className="mt-2 space-y-1.5">
                {students
                  .slice()
                  .sort((a, b) => b.rate - a.rate)
                  .slice(0, 5)
                  .map((s) => (
                    <li key={s.student.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-ink-700">{s.student.name}</span>
                      <span className="font-semibold text-brand-600">
                        {s.rate}%（{s.total}件）
                      </span>
                    </li>
                  ))}
              </ul>
            </Card>
          </div>
        ) : tab === "students" ? (
          <div className="space-y-4">
            <Card>
              <p className="text-[12px] font-semibold text-ink-900">生徒を登録</p>
              <form onSubmit={handleCreateStudent} className="mt-2 space-y-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="氏名（例：山田 さくら）"
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-[13px] outline-none focus:border-brand-400"
                />
                <input
                  value={nameKana}
                  onChange={(e) => setNameKana(e.target.value)}
                  placeholder="ふりがな"
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-[13px] outline-none focus:border-brand-400"
                />
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as Level)}
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-[13px] outline-none focus:border-brand-400"
                >
                  {(Object.keys(LEVEL_LABEL) as Level[]).map((lv) => (
                    <option key={lv} value={lv}>
                      {LEVEL_LABEL[lv]}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-500 py-2.5 text-[12px] font-semibold text-white"
                >
                  登録する
                </button>
              </form>
            </Card>

            <SectionTitle title={`登録済み（${students.length}名）`} />
            {students.length === 0 ? (
              <EmptyState message="生徒が登録されていません。" />
            ) : (
              <ul className="space-y-2">
                {students.map((s) => (
                  <li key={s.student.id}>
                    <Card className="flex items-center justify-between gap-2 py-3">
                      <Link href={`/students/${s.student.id}`} className="min-w-0">
                        <p className="truncate text-[12px] font-semibold text-ink-900">
                          {s.student.name}
                        </p>
                        <p className="text-[10px] text-ink-500">
                          {LEVEL_LABEL[s.student.level]}｜出席率 {s.rate}%
                        </p>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          void (async () => {
                            await deleteStudent(s.student.id);
                            setMessage(`${s.student.name} を削除しました。`);
                            await reload();
                          })();
                        }}
                        className="rounded-full border border-rose-200 px-2.5 py-1 text-[10px] font-semibold text-rose-600"
                      >
                        削除
                      </button>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : tab === "announcements" ? (
          <div className="space-y-4">
            <Card>
              <p className="text-[12px] font-semibold text-ink-900">お知らせを投稿</p>
              <form onSubmit={handleCreateAnnouncement} className="mt-2 space-y-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="タイトル"
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-[13px] outline-none focus:border-brand-400"
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="本文"
                  rows={4}
                  className="w-full rounded-xl border border-brand-200 px-3 py-2.5 text-[13px] outline-none focus:border-brand-400"
                />
                <div className="flex gap-2">
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as Audience)}
                    className="flex-1 rounded-xl border border-brand-200 px-3 py-2.5 text-[13px] outline-none"
                  >
                    {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => (
                      <option key={a} value={a}>
                        {AUDIENCE_LABEL[a]}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1.5 rounded-xl border border-brand-200 px-3 text-[11px] font-medium text-ink-700">
                    <input
                      type="checkbox"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                    />
                    重要
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-brand-500 py-2.5 text-[12px] font-semibold text-white"
                >
                  投稿する
                </button>
              </form>
            </Card>

            <SectionTitle title={`投稿済み（${announcements.length}件）`} />
            {announcements.length === 0 ? (
              <EmptyState message="お知らせはありません。" />
            ) : (
              <ul className="space-y-2">
                {announcements.map((a) => (
                  <li key={a.id}>
                    <Card className="flex items-start justify-between gap-2 py-3">
                      <Link href={`/announcements/${a.id}`} className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          {a.pinned ? <Badge tone="rose">重要</Badge> : null}
                          <Badge tone="slate">{AUDIENCE_LABEL[a.audience]}</Badge>
                        </div>
                        <p className="mt-1 truncate text-[12px] font-semibold text-ink-900">
                          {a.title}
                        </p>
                        <p className="text-[10px] text-ink-500">
                          {formatDateLabel(a.publishedOn)}
                        </p>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          void (async () => {
                            await deleteAnnouncement(a.id);
                            setMessage("お知らせを削除しました。");
                            await reload();
                          })();
                        }}
                        className="rounded-full border border-rose-200 px-2.5 py-1 text-[10px] font-semibold text-rose-600"
                      >
                        削除
                      </button>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <SectionTitle title="利用者の権限" />
            {users.length === 0 ? (
              <EmptyState message="利用者が登録されていません。" />
            ) : (
              <ul className="space-y-2">
                {users.map((u) => (
                  <li key={u.uid}>
                    <Card className="py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[12px] font-semibold text-ink-900">
                            {u.displayName}
                          </p>
                          <p className="text-[10px] text-ink-500">{u.uid}</p>
                        </div>
                        <select
                          value={u.role}
                          onChange={(e) => {
                            const next = e.target.value as Role;
                            void (async () => {
                              await updateUserRole(u.uid, next);
                              setMessage(`${u.displayName} を「${ROLE_LABEL[next]}」に変更しました。`);
                              await reload();
                            })();
                          }}
                          className="rounded-xl border border-brand-200 px-2 py-1.5 text-[11px] outline-none"
                        >
                          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABEL[r]}
                            </option>
                          ))}
                        </select>
                      </div>
                      {u.studentIds?.length ? (
                        <p className="mt-1 text-[10px] text-ink-500">
                          担当生徒：{u.studentIds.length}名
                        </p>
                      ) : null}
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
