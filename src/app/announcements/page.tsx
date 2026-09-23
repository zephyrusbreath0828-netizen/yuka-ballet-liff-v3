"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Card, EmptyState, Loading, SectionTitle } from "@/components/ui";
import { formatDateLabel } from "@/lib/format";
import { fetchAnnouncements } from "@/lib/repository";
import { AUDIENCE_LABEL, type Announcement } from "@/lib/types";

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const list = await fetchAnnouncements();
        if (alive) setItems(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <SectionTitle title="お知らせ" />

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <EmptyState message="お知らせはまだありません。" />
      ) : (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a.id}>
              <Link href={`/announcements/${a.id}`}>
                <Card>
                  <div className="flex items-center gap-2">
                    {a.pinned ? <Badge tone="rose">重要</Badge> : null}
                    <Badge tone="slate">{AUDIENCE_LABEL[a.audience]}</Badge>
                    <span className="text-[10px] text-ink-500">
                      {formatDateLabel(a.publishedOn)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] font-semibold text-ink-900">{a.title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink-500">
                    {a.body}
                  </p>
                  <p className="mt-1 text-[10px] text-ink-500">投稿：{a.authorName}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
