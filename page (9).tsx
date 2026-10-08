"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/lib/user-context";
import { Card, PageTitle, SectionTitle } from "@/components/common";
import { EmptyState, Greeting, Loading } from "@/components/ui";
import { listAnnouncements, listLessonsAfterNow, listReservationsByUser, formatDateTime } from "@/lib/firestore";
import type { Announcement, Lesson, LessonReservation } from "@/lib/types";

export default function StudentHomePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reservations, setReservations] = useState<LessonReservation[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [a, l, r] = await Promise.all([
          listAnnouncements(),
          listLessonsAfterNow(),
          listReservationsByUser(user.uid),
        ]);
        setAnnouncements(a.slice(0, 3));
        setLessons(l.slice(0, 3));
        setReservations(r);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading || !user) return <Loading />;

  const reservedLessonIds = new Set(reservations.map((r) => r.lessonId));

  return (
    <div className="space-y-6">
      <PageTitle>ホーム</PageTitle>

      {/* ログイン成功の確認（「こんにちは、〇〇さん」） */}
      <Greeting displayName={user.displayName} role={user.role} />

      {/* レッスン予定 */}
      <section>
        <SectionTitle>レッスン予定</SectionTitle>
        {lessons.length === 0 ? (
          <EmptyState label="予定されているレッスンはありません" />
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson) => {
              const full = lesson.reservedCount >= lesson.capacity;
              const reserved = reservedLessonIds.has(lesson.lessonId);
              return (
                <Card key={lesson.lessonId}>
                  <p className="text-xs text-gray-500">{formatDateTime(lesson.startAt)}〜</p>
                  <p className="font-bold">{lesson.title}</p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {lesson.className} / 講師: {lesson.teacherName}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {reserved ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                        予約済み
                      </span>
                    ) : full ? (
                      <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-bold text-gray-500">
                        満席です
                      </span>
                    ) : (
                      <span className="rounded-full bg-ballet-100 px-2.5 py-0.5 text-xs font-bold text-ballet-700">
                        空席あり
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {lesson.reservedCount}/{lesson.capacity}名
                    </span>
                  </div>
                </Card>
              );
            })}
            <Link href="/schedule" className="block text-center text-sm font-bold text-ballet-600">
              予定確認へ →
            </Link>
          </div>
        )}
      </section>

      {/* お知らせ */}
      <section>
        <SectionTitle>お知らせ</SectionTitle>
        {announcements.length === 0 ? (
          <EmptyState label="お知らせはありません" />
        ) : (
          <div className="space-y-2">
            {announcements.map((a) => (
              <Card key={a.announcementId}>
                <p className="text-xs text-gray-500">{formatDateTime(a.createdAt)}</p>
                <p className="font-bold">{a.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{a.content}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* 自分の予約一覧 */}
      <section>
        <SectionTitle>自分の予約一覧</SectionTitle>
        {reservations.length === 0 ? (
          <EmptyState label="予約はありません" />
        ) : (
          <div className="space-y-2">
            {reservations.map((r) => (
              <Card key={r.reservationId}>
                <p className="text-sm font-bold">レッスンID: {r.lessonId}</p>
                <p className="text-xs text-gray-500">予約日時: {formatDateTime(r.reservedAt)}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* QR出席 */}
      <section>
        <SectionTitle>QR出席</SectionTitle>
        <Link
          href="/qr"
          className="block rounded-2xl bg-gray-900 p-4 text-center font-bold text-white"
        >
          QRコードを読み取って出席する
        </Link>
      </section>
    </div>
  );
}
