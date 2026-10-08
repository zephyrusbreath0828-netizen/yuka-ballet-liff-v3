"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/common";
import { EmptyState, Loading } from "@/components/ui";
import { listLessons, formatDateTime } from "@/lib/firestore";
import type { Lesson } from "@/lib/types";

/** 出席管理: レッスン一覧から参加者一覧（出席状態変更）へ飛ぶ */
export default function AdminAttendancePage() {
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
      <h1 className="text-lg font-bold">出席管理</h1>
      <p className="text-xs text-gray-500">レッスンを選択して出席状態を管理できます。</p>
      {lessons.length === 0 ? (
        <EmptyState label="レッスンがまだありません" />
      ) : (
        lessons.map((l) => (
          <Card key={l.lessonId}>
            <p className="text-xs text-gray-500">{formatDateTime(l.startAt)}</p>
            <p className="font-bold">{l.title}</p>
            <p className="text-xs text-gray-600">
              {l.className} / 予約 {l.reservedCount}名
            </p>
            <a
              href={`/admin/lessons/${l.lessonId}`}
              className="mt-2 block rounded-xl bg-gray-900 py-2 text-center text-sm font-bold text-white"
            >
              出席を管理する
            </a>
          </Card>
        ))
      )}
    </div>
  );
}
