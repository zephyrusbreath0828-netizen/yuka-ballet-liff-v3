"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loading, SectionTitle } from "@/components/ui";
import { formatDateLabel } from "@/lib/format";
import {
  fetchAttendanceByStudent,
  fetchLessons,
  fetchStudent,
  fetchTeachers,
} from "@/lib/repository";
import { summarizeAttendance } from "@/lib/functions";
import {
  LEVEL_LABEL,
  STATUS_LABEL,
  type Attendance,
  type AttendanceStatus,
  type Lesson,
  type Student,
  type Teacher,
} from "@/lib/types";

const STATUS_TONE: Record<AttendanceStatus, "green" | "rose" | "amber" | "slate"> = {
  present: "green",
  absent: "rose",
  late: "amber",
  excused: "slate",
};

export default function StudentDetail({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [s, a, l, t] = await Promise.all([
          fetchStudent(studentId),
          fetchAttendanceByStudent(studentId),
          fetchLessons(),
          fetchTeachers(),
        ]);
        if (!alive) return;
        setStudent(s);
        setRecords(a);
        setLessons(l);
        setTeachers(t);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [studentId]);

  if (loading) return <Loading />;
  if (!student) {
    return (
      <div className="space-y-3">
        <EmptyState message="生徒が見つかりませんでした。" />
        <Link href="/students" className="block text-center text-[12px] font-semibold text-brand-600">
          ← 生徒一覧に戻る
        </Link>
      </div>
    );
  }

  const summary = summarizeAttendance(student, records);
  const enrolled = lessons.filter((l) => l.studentIds.includes(student.id));
  const teacherNames = teachers
    .filter((t) => (student.teacherIds ?? []).includes(t.id))
    .map((t) => t.name);

  return (
    <div className="space-y-5">
      <Link href="/students" className="text-[11px] font-semibold text-brand-600">
        ← 生徒一覧
      </Link>

      <Card>
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl">
            🩰
          </span>
          <div>
            <h1 className="text-base font-semibold text-ink-900">{student.name}</h1>
            <p className="text-[11px] text-ink-500">{student.nameKana}</p>
            <div className="mt-1 flex gap-1.5">
              <Badge tone="brand">{LEVEL_LABEL[student.level]}</Badge>
              {student.active ? <Badge tone="green">在籍中</Badge> : <Badge tone="slate">休会中</Badge>}
            </div>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-y-2 text-[11px]">
          <dt className="text-ink-500">生年月日</dt>
          <dd className="text-right font-medium text-ink-900">
            {student.birthday ? formatDateLabel(student.birthday) : "未登録"}
          </dd>
          <dt className="text-ink-500">担当講師</dt>
          <dd className="text-right font-medium text-ink-900">
            {teacherNames.length > 0 ? teacherNames.join("、") : "未割当"}
          </dd>
          <dt className="text-ink-500">在籍クラス数</dt>
          <dd className="text-right font-medium text-ink-900">{enrolled.length}</dd>
        </dl>

        {student.note ? (
          <p className="mt-3 rounded-xl border border-brand-100 bg-brand-50/50 px-3 py-2 text-[11px] leading-relaxed text-ink-700">
            {student.note}
          </p>
        ) : null}
      </Card>

      <section>
        <SectionTitle title="出欠サマリー" />
        <Card>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] text-ink-500">出席率</p>
              <p className="text-3xl font-bold text-brand-600">{summary.rate}%</p>
            </div>
            <p className="text-[11px] text-ink-500">
              記録 {summary.total}件 / 出席 {summary.present}・遅刻 {summary.late}
            </p>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-50">
            <div
              className="h-full rounded-full bg-brand-500 transition-all"
              style={{ width: `${summary.rate}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {(
              [
                ["出席", summary.present, "green"],
                ["遅刻", summary.late, "amber"],
                ["欠席", summary.absent, "rose"],
                ["公欠", summary.excused, "slate"],
              ] as const
            ).map(([label, value, tone]) => (
              <div key={label} className="rounded-xl border border-brand-100 bg-white px-1 py-2">
                <p className="text-base font-bold text-ink-900">{value}</p>
                <Badge tone={tone}>{label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle title="出欠履歴" />
        {records.length === 0 ? (
          <EmptyState message="出欠記録はまだありません。" />
        ) : (
          <ul className="space-y-2">
            {records.map((r) => (
              <li key={r.id}>
                <Card className="flex items-center justify-between gap-2 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-ink-900">
                      {r.lessonTitle}
                    </p>
                    <p className="text-[10px] text-ink-500">{formatDateLabel(r.lessonDate)}</p>
                    {r.note ? (
                      <p className="mt-0.5 text-[10px] text-ink-500">備考：{r.note}</p>
                    ) : null}
                  </div>
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle title="受講予定クラス" />
        {enrolled.length === 0 ? (
          <EmptyState message="登録されているクラスはありません。" />
        ) : (
          <ul className="space-y-2">
            {enrolled.map((l) => (
              <li key={l.id}>
                <Link href={`/lessons/${l.id}`}>
                  <Card className="flex items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-[12px] font-semibold text-ink-900">{l.title}</p>
                      <p className="text-[10px] text-ink-500">
                        {formatDateLabel(l.date)} {l.startTime}〜{l.endTime}｜{l.studio}
                      </p>
                    </div>
                    <span className="text-[11px] text-brand-600">詳細 ›</span>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
