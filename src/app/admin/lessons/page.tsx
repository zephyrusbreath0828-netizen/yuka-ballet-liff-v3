"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, PageTitle } from "@/components/common";
import { EmptyState, Loading } from "@/components/ui";
import { listLessons, formatDateTime } from "@/lib/firestore";
import { NOTIFICATION_LABELS, type Lesson } from "@/lib/types";

export default function AdminLessonsPage() {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLessons(await listLessons());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle>レッスン管理</PageTitle>
      </div>
      <Link
        href="/admin/lessons/new"
        className="block rounded-xl bg-ballet-600 py-3 text-center font-bold text-white"
      >
        ＋ レッスンを作成
      </Link>
      {lessons.length === 0 ? (
        <EmptyState label="レッスンがまだありません" />
      ) : (
        lessons.map((l) => {
          const remaining = l.capacity - l.reservedCount;
          return (
            <Card key={l.lessonId}>
              <p className="text-xs text-gray-500">
                {formatDateTime(l.startAt)}〜{formatDateTime(l.endAt)}
              </p>
              <p className="font-bold">{l.title}</p>
              <p className="mt-0.5 text-xs text-gray-600">
                {l.className} / 講師: {l.teacherName}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                参加人数 {l.reservedCount}名 / 定員 {l.capacity}名（残席 {remaining}名）
              </p>
              <p className="text-xs text-gray-500">
                終了通知: {NOTIFICATION_LABELS[l.notificationType]}
              </p>
              <Link
                href={`/admin/lessons/${l.lessonId}`}
                className="mt-3 block rounded-xl bg-gray-900 py-2.5 text-center text-sm font-bold text-white"
              >
                参加者一覧を見る
              </Link>
            </Card>
          );
        })
      )}
    </div>
  );
}
