"use client";

import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loading, SectionTitle } from "@/components/ui";
import { formatDateLabel } from "@/lib/format";
import { fetchLessons } from "@/lib/repository";
import { groupLessonsByDate, upcomingLessons } from "@/lib/functions";
import { LEVEL_LABEL, type Lesson } from "@/lib/types";

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const list = await fetchLessons();
        if (alive) setLessons(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const visible = showPast ? lessons : upcomingLessons(lessons);
  const grouped = groupLessonsByDate(visible);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle title="レッスンスケジュール" />
        <button
          type="button"
          onClick={() => setShowPast((v) => !v)}
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
            showPast
              ? "border-brand-500 bg-brand-500 text-white"
              : "border-brand-200 bg-white text-ink-700"
          }`}
        >
          {showPast ? "過去も表示中" : "今後のみ"}
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : grouped.length === 0 ? (
        <EmptyState message="表示できるレッスンがありません。" />
      ) : (
        grouped.map(([date, items]) => (
          <section key={date}>
            <h3 className="mb-2 text-[11px] font-semibold text-brand-600">
              {formatDateLabel(date)}
            </h3>
            <ul className="space-y-2">
              {items.map((l) => (
                <li key={l.id}>
                  <Card>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-ink-900">{l.title}</p>
                        <p className="mt-0.5 text-[11px] font-medium text-brand-600">
                          {l.startTime}〜{l.endTime}
                        </p>
                        <p className="text-[11px] text-ink-500">
                          {l.studio}｜{l.teacherName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge tone="brand">{LEVEL_LABEL[l.level]}</Badge>
                        <span className="text-[10px] text-ink-500">
                          {l.studentIds.length}/{l.capacity}名
                        </span>
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
