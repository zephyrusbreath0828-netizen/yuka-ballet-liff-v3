import type { Timestamp } from "firebase/firestore";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

/** 今日の日付（YYYY-MM-DD） */
export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** YYYY-MM-DD → M月D日(曜) */
export function formatDateLabel(value: string | undefined): string {
  if (!value) return "未設定";
  const [y, m, d] = value.split("-").map((n) => Number(n));
  if (!y || !m || !d) return value;
  const date = new Date(y, m - 1, d);
  return `${m}月${d}日(${WEEKDAYS[date.getDay()]})`;
}

/** Firestore Timestamp → YYYY/MM/DD */
export function formatTimestamp(value: Timestamp | null | undefined): string {
  if (!value) return "-";
  const date = value.toDate();
  return `${date.getFullYear()}/${`${date.getMonth() + 1}`.padStart(2, "0")}/${`${date.getDate()}`.padStart(2, "0")}`;
}

/** 分を「18:00〜19:30」形式に */
export function formatTimeRange(start: string, end: string): string {
  return `${start}〜${end}`;
}

/** 出席率（0〜100） */
export function attendanceRate(total: number, present: number): number {
  if (total <= 0) return 0;
  return Math.round((present / total) * 100);
}
