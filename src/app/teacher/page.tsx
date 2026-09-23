"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { Badge, Card, EmptyState, Loading, SectionTitle } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { formatDateLabel } from "@/lib/format";
import { fetchLessons, fetchStudents } from "@/lib/repository";
import { upcomingLessons } from "@/lib/functions";
import { LEVEL_LABEL, type Lesson, type Student } from "@/lib/types";

export default function TeacherPage() {
  const { profile } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [l, s] = await Promise.all([fetchLessons(), fetchStudents()]);
        if (alive) {
          setLessons(l);
          setStudents(s);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const myName = profile?.displayName ?? "";
  const myLessons = upcomingLessons(lessons).filter(
    (l) => !myName || l.teacherName === myName,
  );
  const shown = myLessons.length > 0 ? myLessons : upcomingLessons(lessons);

  return (
    <RoleGuard allow={["admin", "teacher"]}>
      <div className="space-y-4">
        <SectionTitle title="講師画面" />

        <Card className="bg-brand-50/60">
          <p className="text-[12px] font-semibold text-ink-900">
            {myName ? `${myName} 先生` : "講師ダッシュボード"}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-500">
            担当レッスンの確認と出欠登録ができます。
          </p>
        </Card>

        {loading ? (
          <Loading />
        ) : (
          <>
            <section>
              <SectionTitle title="担当レッスン（今後）" />
              {shown.length === 0 ? (
                <EmptyState message="担当予定のレッスンはありません。" />
              ) : (
                <ul className="space-y-2">
                  {shown.map((l) => {
                    const roster = students.filter((s) => l.studentIds.includes(s.id));
                    return (
                      <li key={l.id}>
                        <Card>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-[13px] font-semibold text-ink-900">
                                {l.title}
                              </p>
                              <p className="mt-0.5 text-[11px] font-medium text-brand-600">
                                {formatDateLabel(l.date)} {l.startTime}〜{l.endTime}
                              </p>
                              <p className="text-[11px] text-ink-500">{l.studio}</p>
                            </div>
                            <Badge tone="brand">{LEVEL_LABEL[l.level]}</Badge>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {roster.map((s) => (
                              <Link key={s.id} href={`/students/${s.id}`}>
                                <span className="rounded-full border border-brand-200 bg-white px-2 py-0.5 text-[10px] text-ink-700">
                                  {s.name}
                                </span>
                              </Link>
                            ))}
                          </div>

                          <div className="mt-3 flex gap-2">
                            <Link
                              href="/attendance"
                              className="flex-1 rounded-xl bg-brand-500 py-2 text-center text-[11px] font-semibold text-white"
                            >
                              出欠を入力
                            </Link>
                            <Link
                              href={`/lessons/${l.id}`}
                              className="flex-1 rounded-xl border border-brand-300 py-2 text-center text-[11px] font-semibold text-brand-600"
                            >
                              詳細
                            </Link>
                          </div>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <SectionTitle title="在籍生徒" />
              <div className="grid grid-cols-2 gap-2">
                {students.slice(0, 6).map((s) => (
                  <Link key={s.id} href={`/students/${s.id}`}>
                    <Card className="py-3 text-center">
                      <p className="text-[12px] font-semibold text-ink-900">{s.name}</p>
                      <p className="text-[10px] text-ink-500">{LEVEL_LABEL[s.level]}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
