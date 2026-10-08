"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/lib/user-context";
import { Card, PageTitle, PrimaryButton } from "@/components/common";
import { EmptyState, Loading, Toast, useToast } from "@/components/ui";
import {
  listLessonsAfterNow,
  listReservationsByUser,
  reserveLesson,
  cancelReservation,
  formatDateTime,
} from "@/lib/firestore";
import type { Lesson, LessonReservation } from "@/lib/types";

export default function SchedulePage() {
  const { user } = useUser();
  const { state, show } = useToast();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reservations, setReservations] = useState<LessonReservation[]>([]);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [l, r] = await Promise.all([
      listLessonsAfterNow(),
      listReservationsByUser(user.uid),
    ]);
    setLessons(l);
    setReservations(r);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [user, refresh]);

  if (loading || !user) return <Loading />;

  const reservedLessonIds = new Set(reservations.map((r) => r.lessonId));

  const onReserve = async (lesson: Lesson) => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await reserveLesson(lesson, user);
      if (result === "ok") {
        show("success", "予約しました");
      } else if (result === "full") {
        show("error", "満席です");
      } else {
        show("error", "予約に失敗しました");
      }
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const onCancel = async (r: LessonReservation) => {
    if (busy) return;
    setBusy(true);
    try {
      await cancelReservation(r);
      show("success", "キャンセルしました");
      await refresh();
    } catch {
      show("error", "キャンセルに失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageTitle>予定確認</PageTitle>
      {lessons.length === 0 ? (
        <EmptyState label="予定されているレッスンはありません" />
      ) : (
        lessons.map((lesson) => {
          const full = lesson.reservedCount >= lesson.capacity;
          const reserved = reservedLessonIds.has(lesson.lessonId);
          return (
            <Card key={lesson.lessonId}>
              <p className="text-xs text-gray-500">{formatDateTime(lesson.startAt)}〜{formatDateTime(lesson.endAt)}</p>
              <p className="font-bold">{lesson.title}</p>
              <p className="mt-0.5 text-xs text-gray-600">
                {lesson.className} / 講師: {lesson.teacherName}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {lesson.reservedCount}/{lesson.capacity}名
              </p>
              <div className="mt-3">
                {reserved ? (
                  <PrimaryButton onClick={() => onCancel(reservations.find((r) => r.lessonId === lesson.lessonId)!)} disabled={busy} className="!bg-gray-200 !text-gray-700">
                    予約をキャンセル
                  </PrimaryButton>
                ) : full ? (
                  <div className="rounded-xl bg-gray-100 py-3 text-center text-sm font-bold text-gray-500">
                    満席です
                  </div>
                ) : (
                  <PrimaryButton onClick={() => onReserve(lesson)} disabled={busy}>
                    予約する
                  </PrimaryButton>
                )}
              </div>
            </Card>
          );
        })
      )}
      <Toast state={state} />
    </div>
  );
}
