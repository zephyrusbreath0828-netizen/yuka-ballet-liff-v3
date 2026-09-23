"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { Badge, Card, EmptyState, Loading, SectionTitle } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { formatDateLabel } from "@/lib/format";
import {
  fetchAnnouncements,
  fetchAttendanceByStudent,
  fetchLessons,
  fetchStudents,
} from "@/lib/repository";
import { upcomingLessons } from "@/lib/functions";
import {
  AUDIENCE_LABEL,
  STATUS_LABEL,
  type Announcement,
  type Attendance,
  type AttendanceStatus,
  type Lesson,
  type Student,
} from "@/lib/types";

const STATUS_TONE: Record<AttendanceStatus, "green" | "rose" | "amber" | "slate"> = {
  present: "green",
  absent: "rose",
  late: "amber",
  excused: "slate",
};

export default function ParentPage() {
  const { profile, lineProfile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const guardianName = profile?.displayName ?? lineProfile?.displayName ?? "";

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [s, l, a] = await Promise.all([
          fetchStudents(),
          fetchLessons(),
          fetchAnnouncements(),
        ]);
        const mine = profile?.studentIds?.length
          ? s.filter((x) => profile.studentIds?.includes(x.id))
          : s;
        const records = (
          await Promise.all(mine.map((x) => fetchAttendanceByStudent(x.id)))
        ).flat();
        if (!alive) return;
        setStudents(mine);
        setLessons(l);
        setAnnouncements(a.filter((x) => x.audience === "all" || x.audience === "parents"));
        setAttendance(records);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [profile?.studentIds]);

  return (
    <RoleGuard allow={["admin", "parent"]}>
      <div className="space-y-4">
        <SectionTitle title="保護者画面" />

        <Card className="bg-brand-50/60">
          <p className="text-[12px] font-semibold text-ink-900">
            {guardianName ? `${guardianName} 様` : "保護者ダッシュボード"}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-500">
            お子さまの出欠・レッスン予定・お知らせを確認できます。
          </p>
        </Card>

        {loading ? (
          <Loading />
        ) : (
          <>
            <section>
              <SectionTitle title="お子さま" />
              {students.length === 0 ? (
                <EmptyState message="お子さまの情報が登録されていません。教室までお問い合わせください。" />
              ) : (
                <ul className="space-y-2">
                  {students.map((s) => {
                    const mine = attendance.filter((a) => a.studentId === s.id);
                    const attended = mine.filter(
                      (a) => a.status === "present" || a.status === "late",
                    ).length;
                    const rate = mine.length === 0 ? 0 : Math.round((attended / mine.length) * 100);
                    return (
                      <li key={s.id}>
                        <Link href={`/students/${s.id}`}>
                          <Card>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[13px] font-semibold text-ink-900">{s.name}</p>
                                <p className="text-[10px] text-ink-500">{s.nameKana}</p>
                              </div>
                              <Badge tone="brand">出席率 {rate}%</Badge>
                            </div>
                            {mine.length > 0 ? (
                              <ul className="mt-2 space-y-1">
                                {mine.slice(0, 3).map((r) => (
                                  <li
                                    key={r.id}
                                    className="flex items-center justify-between text-[11px]"
                                  >
                                    <span className="truncate text-ink-500">
                                      {formatDateLabel(r.lessonDate)} {r.lessonTitle}
                                    </span>
                                    <Badge tone={STATUS_TONE[r.status]}>
                                      {STATUS_LABEL[r.status]}
                                    </Badge>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="mt-2 text-[10px] text-ink-500">出欠記録はまだありません。</p>
                            )}
                          </Card>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <SectionTitle title="今後のレッスン" />
              {upcomingLessons(lessons).length === 0 ? (
                <EmptyState message="予定されているレッスンはありません。" />
              ) : (
                <ul className="space-y-2">
                  {upcomingLessons(lessons).slice(0, 4).map((l) => (
                    <li key={l.id}>
                      <Card className="py-3">
                        <p className="text-[12px] font-semibold text-ink-900">{l.title}</p>
                        <p className="text-[11px] text-brand-600">
                          {formatDateLabel(l.date)} {l.startTime}〜{l.endTime}
                        </p>
                        <p className="text-[10px] text-ink-500">{l.studio}｜{l.teacherName}</p>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <SectionTitle title="保護者向けお知らせ" />
              {announcements.length === 0 ? (
                <EmptyState message="お知らせはありません。" />
              ) : (
                <ul className="space-y-2">
                  {announcements.slice(0, 4).map((a) => (
                    <li key={a.id}>
                      <Link href={`/announcements/${a.id}`}>
                        <Card className="py-3">
                          <div className="flex items-center gap-1.5">
                            {a.pinned ? <Badge tone="rose">重要</Badge> : null}
                            <Badge tone="slate">{AUDIENCE_LABEL[a.audience]}</Badge>
                          </div>
                          <p className="mt-1 text-[12px] font-semibold text-ink-900">
                            {a.title}
                          </p>
                          <p className="text-[10px] text-ink-500">
                            {formatDateLabel(a.publishedOn)}
                          </p>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
