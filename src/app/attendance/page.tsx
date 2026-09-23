"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Card, EmptyState, Loading, SectionTitle } from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { formatDateLabel } from "@/lib/format";
import {
  fetchAttendanceByLesson,
  fetchLessons,
  fetchStudents,
  saveAttendance,
  type AttendanceInput,
} from "@/lib/repository";
import { upcomingLessons } from "@/lib/functions";
import {
  STATUS_LABEL,
  type AttendanceStatus,
  type Lesson,
  type Student,
} from "@/lib/types";

const STATUSES: AttendanceStatus[] = ["present", "late", "absent", "excused"];

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  present: "border-emerald-400 bg-emerald-500 text-white",
  late: "border-amber-400 bg-amber-500 text-white",
  absent: "border-rose-400 bg-rose-500 text-white",
  excused: "border-slate-400 bg-slate-500 text-white",
};

export default function AttendancePage() {
  const { role, profile } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [lessonId, setLessonId] = useState<string>("");
  const [draft, setDraft] = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canEdit = role === "admin" || role === "teacher";

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const [l, s] = await Promise.all([fetchLessons(), fetchStudents()]);
        if (!alive) return;
        setLessons(l);
        setStudents(s);
        const first = upcomingLessons(l)[0] ?? l[0];
        if (first) setLessonId(first.id);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const lesson = useMemo(
    () => lessons.find((l) => l.id === lessonId) ?? null,
    [lessons, lessonId],
  );

  const roster = useMemo(
    () => (lesson ? students.filter((s) => lesson.studentIds.includes(s.id)) : []),
    [lesson, students],
  );

  useEffect(() => {
    if (!lessonId) return;
    let alive = true;
    void (async () => {
      const records = await fetchAttendanceByLesson(lessonId);
      if (!alive) return;
      const map: Record<string, AttendanceStatus> = {};
      for (const r of records) map[r.studentId] = r.status;
      setSaved(map);
      setDraft(map);
    })();
    return () => {
      alive = false;
    };
  }, [lessonId]);

  const dirty = useMemo(
    () =>
      roster.some((s) => {
        const next = draft[s.id];
        const prev = saved[s.id];
        return next !== undefined && next !== prev;
      }),
    [roster, draft, saved],
  );

  async function handleSave() {
    if (!lesson || !canEdit) return;
    setSaving(true);
    setMessage(null);
    try {
      const records: AttendanceInput[] = roster
        .filter((s) => draft[s.id])
        .map((s) => ({
          lessonId: lesson.id,
          lessonDate: lesson.date,
          lessonTitle: lesson.title,
          studentId: s.id,
          studentName: s.name,
          status: draft[s.id],
          recordedBy: profile?.displayName ?? "講師",
        }));
      await saveAttendance(records);
      setSaved(draft);
      setMessage(`${records.length}件の出欠を保存しました。`);
    } catch (e) {
      setMessage(
        e instanceof Error ? `保存に失敗しました: ${e.message}` : "保存に失敗しました。",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading />;

  const recorded = roster.filter((s) => saved[s.id]).length;

  return (
    <div className="space-y-4">
      <SectionTitle title="出欠管理" />

      <Card>
        <label className="text-[11px] font-semibold text-ink-700">レッスンを選択</label>
        <select
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-brand-400"
        >
          {lessons.length === 0 ? <option value="">レッスンがありません</option> : null}
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {formatDateLabel(l.date)} {l.startTime} {l.title}
            </option>
          ))}
        </select>

        {lesson ? (
          <p className="mt-2 text-[11px] text-ink-500">
            {lesson.studio}｜担当 {lesson.teacherName}｜記録済み {recorded}/{roster.length}名
          </p>
        ) : null}
      </Card>

      {!canEdit ? (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-[11px] leading-relaxed text-amber-800">
            出欠の登録は管理者・講師のみ可能です。現在のロールは「{role}」のため閲覧のみとなります。
          </p>
        </Card>
      ) : null}

      {roster.length === 0 ? (
        <EmptyState message="このレッスンには受講者が登録されていません。" />
      ) : (
        <ul className="space-y-2">
          {roster.map((s) => (
            <li key={s.id}>
              <Card className="py-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-semibold text-ink-900">{s.name}</p>
                    <p className="text-[10px] text-ink-500">{s.nameKana}</p>
                  </div>
                  {saved[s.id] ? (
                    <Badge tone="green">{STATUS_LABEL[saved[s.id]]} 保存済</Badge>
                  ) : (
                    <Badge tone="slate">未記録</Badge>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {STATUSES.map((status) => {
                    const active = draft[s.id] === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setDraft((prev) => ({ ...prev, [s.id]: status }))}
                        className={`rounded-xl border px-1 py-2 text-[11px] font-semibold transition disabled:opacity-50 ${
                          active
                            ? STATUS_STYLE[status]
                            : "border-brand-200 bg-white text-ink-700"
                        }`}
                      >
                        {STATUS_LABEL[status]}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {canEdit && roster.length > 0 ? (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !dirty}
          className="w-full rounded-xl2 bg-brand-500 py-3 text-[13px] font-semibold text-white shadow-card transition disabled:bg-brand-200"
        >
          {saving ? "保存中…" : dirty ? "出欠を保存" : "変更はありません"}
        </button>
      ) : null}

      {message ? (
        <p className="text-center text-[11px] font-medium text-brand-600">{message}</p>
      ) : null}
    </div>
  );
}
