"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loading, SectionTitle } from "@/components/ui";
import { formatDateLabel } from "@/lib/format";
import { fetchAttendanceByLesson, fetchLesson, fetchStudents } from "@/lib/repository";
import {
  LEVEL_LABEL,
  STATUS_LABEL,
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

export default function LessonDetail({ lessonId }: { lessonId: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [l, s, a] = await Promise.all([
          fetchLesson(lessonId),
          fetchStudents(),
          fetchAttendanceByLesson(lessonId),
        ]);
        if (!alive) return;
        setLesson(l);
        setStudents(s);
        setRecords(a);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lessonId]);

  if (loading) return <Loading />;
  if (!lesson) {
    return (
      <div className="space-y-3">
        <EmptyState message="レッスンが見つかりませんでした。" />
        <Link href="/lessons" className="block text-center text-[12px] font-semibold text-brand-600">
          ← スケジュールに戻る
        </Link>
      </div>
    );
  }

  const roster = students.filter((s) => lesson.studentIds.includes(s.id));
  const recordOf = (studentId: string) =>
    records.find((r) => r.studentId === studentId) ?? null;

  return (
    <div className="space-y-5">
      <Link href="/lessons" className="text-[11px] font-semibold text-brand-600">
        ← スケジュール
      </Link>

      <Card>
        <Badge tone="brand">{LEVEL_LABEL[lesson.level]}</Badge>
        <h1 className="mt-2 text-base font-semibold text-ink-900">{lesson.title}</h1>
        <p className="mt-1 text-[12px] font-medium text-brand-600">
          {formatDateLabel(lesson.date)} {lesson.startTime}〜{lesson.endTime}
        </p>
        <p className="text-[11px] text-ink-500">
          {lesson.studio}｜担当：{lesson.teacherName}
        </p>
        <p className="mt-2 text-[11px] text-ink-500">
          定員 {lesson.capacity}名 ／ 受講者 {lesson.studentIds.length}名
        </p>
      </Card>

      <section>
        <SectionTitle title="受講者と出欠" />
        {roster.length === 0 ? (
          <EmptyState message="受講者が登録されていません。" />
        ) : (
          <ul className="space-y-2">
            {roster.map((s) => {
              const record = recordOf(s.id);
              return (
                <li key={s.id}>
                  <Link href={`/students/${s.id}`}>
                    <Card className="flex items-center justify-between gap-2 py-3">
                      <div>
                        <p className="text-[12px] font-semibold text-ink-900">{s.name}</p>
                        <p className="text-[10px] text-ink-500">{s.nameKana}</p>
                      </div>
                      {record ? (
                        <Badge tone={STATUS_TONE[record.status]}>
                          {STATUS_LABEL[record.status]}
                        </Badge>
                      ) : (
                        <Badge tone="slate">未記録</Badge>
                      )}
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Link
        href="/attendance"
        className="block rounded-xl2 bg-brand-500 py-3 text-center text-[13px] font-semibold text-white shadow-card"
      >
        出欠管理画面へ
      </Link>
    </div>
  );
}
