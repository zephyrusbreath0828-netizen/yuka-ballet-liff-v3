"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/common";
import { EmptyState, Loading } from "@/components/ui";
import {
  getLesson,
  listReservationsByLesson,
  setAttendanceStatus,
  formatDateTime,
} from "@/lib/firestore";
import { ATTENDANCE_LABELS, type Lesson, type LessonReservation, type AttendanceStatus } from "@/lib/types";

/** レッスン詳細: 参加者一覧（氏名・会員番号・クラス・予約日時・出席状態）＋参加人数・残席数 */
export default function LessonDetailPage() {
  const params = useParams();
  const lessonId = typeof params.lessonId === "string" ? params.lessonId : "";
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [reservations, setReservations] = useState<LessonReservation[]>([]);

  useEffect(() => {
    if (!lessonId) return;
    (async () => {
      try {
        const [l, r] = await Promise.all([
          getLesson(lessonId),
          listReservationsByLesson(lessonId),
        ]);
        setLesson(l);
        setReservations(r);
      } finally {
        setLoading(false);
      }
    })();
  }, [lessonId]);

  const onStatusChange = async (reservationId: string, status: AttendanceStatus) => {
    await setAttendanceStatus(reservationId, status);
    setReservations((prev) =>
      prev.map((r) => (r.reservationId === reservationId ? { ...r, attendanceStatus: status } : r))
    );
  };

  if (loading) return <Loading />;
  if (!lesson) return <EmptyState label="レッスンが見つかりません" />;

  const remaining = lesson.capacity - lesson.reservedCount;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">レッスン詳細</h1>
      <Card>
        <p className="text-xs text-gray-500">
          {formatDateTime(lesson.startAt)}〜{formatDateTime(lesson.endAt)}
        </p>
        <p className="text-lg font-bold">{lesson.title}</p>
        <p className="mt-0.5 text-sm text-gray-600">
          {lesson.className} / 講師: {lesson.teacherName}
        </p>
        <div className="mt-3 flex gap-3">
          <div className="flex-1 rounded-xl bg-ballet-50 p-3 text-center">
            <p className="text-xs text-ballet-700">参加人数</p>
            <p className="text-xl font-bold text-ballet-800">{lesson.reservedCount}名</p>
          </div>
          <div className="flex-1 rounded-xl bg-gray-100 p-3 text-center">
            <p className="text-xs text-gray-600">残席数</p>
            <p className="text-xl font-bold text-gray-800">{remaining}名</p>
          </div>
        </div>
      </Card>

      <h2 className="text-sm font-bold text-gray-800">参加者一覧</h2>
      {reservations.length === 0 ? (
        <EmptyState label="予約はまだありません" />
      ) : (
        reservations.map((r) => (
          <Card key={r.reservationId}>
            <p className="font-bold">{r.displayName}</p>
            <dl className="mt-1 space-y-0.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <dt>会員番号</dt>
                <dd className="font-bold">{r.memberNumber || "未登録"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>クラス</dt>
                <dd className="font-bold">{lesson.className}</dd>
              </div>
              <div className="flex justify-between">
                <dt>予約日時</dt>
                <dd>{formatDateTime(r.reservedAt)}</dd>
              </div>
            </dl>
            <div className="mt-2 flex gap-2">
              {(["reserved", "attended", "absent"] as AttendanceStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStatusChange(r.reservationId, s)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold ${
                    r.attendanceStatus === s
                      ? "bg-ballet-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {ATTENDANCE_LABELS[s]}
                </button>
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
