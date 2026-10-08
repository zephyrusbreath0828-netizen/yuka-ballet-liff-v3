"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common";
import { EmptyState, Loading } from "@/components/ui";
import { listLessons, formatDateTime } from "@/lib/firestore";
import type { Lesson } from "@/lib/types";

/** 講師画面: 担当レッスンの確認と参加者一覧への導線 */
export default function TeacherPage() {
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
    <div className="mx-auto max-w-md px-4 py-4">
      <h1 className="mb-4 text-lg font-bold">講師メニュー</h1>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">レッスン一覧</h2>
      {lessons.length === 0 ? (
        <EmptyState label="レッスンがまだありません" />
      ) : (
        <div className="space-y-2">
          {lessons.map((l) => (
            <Card key={l.lessonId}>
              <p className="text-xs text-gray-500">{formatDateTime(l.startAt)}</p>
              <p className="font-bold">{l.title}</p>
              <p className="text-xs text-gray-600">
                {l.className} / 予約 {l.reservedCount}/{l.capacity}名
              </p>
              <a
                href={`/admin/lessons/${l.lessonId}`}
                className="mt-2 block rounded-xl bg-gray-900 py-2 text-center text-sm font-bold text-white"
              >
                参加者一覧
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
