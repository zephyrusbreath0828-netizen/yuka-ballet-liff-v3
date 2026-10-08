"use client";

import { useEffect, useState } from "react";
import { Card, PageTitle, InputField, TextareaField, PrimaryButton } from "@/components/common";
import { EmptyState, Loading, Toast, useToast } from "@/components/ui";
import {
  createAnnouncement,
  listAnnouncements,
  deleteAnnouncement,
  formatDateTime,
} from "@/lib/firestore";
import { useUser } from "@/lib/user-context";
import type { Announcement } from "@/lib/types";

export default function AdminAnnouncementsPage() {
  const { user } = useUser();
  const { state, show } = useToast();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setAnnouncements(await listAnnouncements());
  };

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !user) return <Loading />;

  const onSubmit = async () => {
    if (!title.trim()) {
      show("error", "タイトルを入力してください");
      return;
    }
    if (!content.trim()) {
      show("error", "本文を入力してください");
      return;
    }
    setSaving(true);
    try {
      await createAnnouncement(title.trim(), content.trim(), user.displayName);
      setTitle("");
      setContent("");
      show("success", "お知らせを公開しました");
      await refresh();
    } catch {
      show("error", "公開に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    await deleteAnnouncement(id);
    show("success", "削除しました");
    await refresh();
  };

  return (
    <div className="space-y-4">
      <PageTitle>お知らせ管理</PageTitle>

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-bold">新規お知らせ</p>
        <InputField label="タイトル" value={title} onChange={setTitle} required />
        <TextareaField label="本文" value={content} onChange={setContent} required />
        <PrimaryButton onClick={onSubmit} disabled={saving}>
          {saving ? "公開中…" : "公開する"}
        </PrimaryButton>
      </div>

      {announcements.length === 0 ? (
        <EmptyState label="お知らせはまだありません" />
      ) : (
        announcements.map((a) => (
          <Card key={a.announcementId}>
            <p className="text-xs text-gray-500">
              {formatDateTime(a.createdAt)} / by {a.publishedBy}
            </p>
            <p className="font-bold">{a.title}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{a.content}</p>
            <button
              type="button"
              onClick={() => onDelete(a.announcementId)}
              className="mt-2 text-xs font-bold text-red-600"
            >
              削除する
            </button>
          </Card>
        ))
      )}
      <Toast state={state} />
    </div>
  );
}
