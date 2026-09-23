"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loading } from "@/components/ui";
import { formatDateLabel } from "@/lib/format";
import { fetchAnnouncement } from "@/lib/repository";
import { AUDIENCE_LABEL, type Announcement } from "@/lib/types";

export default function AnnouncementDetail({
  announcementId,
}: {
  announcementId: string;
}) {
  const [item, setItem] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const found = await fetchAnnouncement(announcementId);
        if (alive) setItem(found);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [announcementId]);

  if (loading) return <Loading />;
  if (!item) {
    return (
      <div className="space-y-3">
        <EmptyState message="お知らせが見つかりませんでした。" />
        <Link href="/announcements" className="block text-center text-[12px] font-semibold text-brand-600">
          ← お知らせ一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/announcements" className="text-[11px] font-semibold text-brand-600">
        ← お知らせ一覧
      </Link>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {item.pinned ? <Badge tone="rose">重要</Badge> : null}
          <Badge tone="slate">{AUDIENCE_LABEL[item.audience]}</Badge>
          <span className="text-[10px] text-ink-500">
            {formatDateLabel(item.publishedOn)}
          </span>
        </div>
        <h1 className="mt-2 text-base font-semibold leading-snug text-ink-900">
          {item.title}
        </h1>
        <p className="mt-1 text-[10px] text-ink-500">投稿：{item.authorName}</p>
        <div className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-700">
          {item.body}
        </div>
      </Card>
    </div>
  );
}
