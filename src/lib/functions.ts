import { fetchAttendance, fetchStudents } from "./repository";
import { todayISO } from "./format";
import type { Attendance, Lesson, Student } from "./types";

/** 生徒ごとの出欠サマリー */
export interface StudentAttendanceSummary {
  student: Student;
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  /** 出席率（％） */
  rate: number;
}

export function summarizeAttendance(
  student: Student,
  records: Attendance[],
): StudentAttendanceSummary {
  const mine = records.filter((r) => r.studentId === student.id);
  const present = mine.filter((r) => r.status === "present").length;
  const late = mine.filter((r) => r.status === "late").length;
  const absent = mine.filter((r) => r.status === "absent").length;
  const excused = mine.filter((r) => r.status === "excused").length;
  const total = mine.length;
  const attended = present + late;
  return {
    student,
    total,
    present,
    late,
    absent,
    excused,
    rate: total === 0 ? 0 : Math.round((attended / total) * 100),
  };
}

/** 出欠記録を生徒単位で集計する */
export async function buildAttendanceSummaries(): Promise<StudentAttendanceSummary[]> {
  const [students, records] = await Promise.all([fetchStudents(), fetchAttendance()]);
  return students.map((student) => summarizeAttendance(student, records));
}

/** 指定日以降のレッスン（昇順） */
export function upcomingLessons(lessons: Lesson[], from = todayISO()): Lesson[] {
  return lessons.filter((l) => l.date >= from).sort((a, b) => a.date.localeCompare(b.date));
}

/** 日付ごとにグルーピング */
export function groupLessonsByDate(lessons: Lesson[]): Array<[string, Lesson[]]> {
  const map = new Map<string, Lesson[]>();
  for (const lesson of lessons) {
    const list = map.get(lesson.date) ?? [];
    list.push(lesson);
    map.set(lesson.date, list);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}
