"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitle, InputField, PrimaryButton, SelectField } from "@/components/common";
import { Toast, useToast } from "@/components/ui";
import { createLesson } from "@/lib/firestore";
import { NOTIFICATION_LABELS, NOTIFICATION_TYPES, type NotificationType } from "@/lib/types";

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** レッスン作成（管理者のみ） */
export default function NewLessonPage() {
  const router = useRouter();
  const { state, show } = useToast();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [capacity, setCapacity] = useState("15");
  const [notificationType, setNotificationType] = useState<NotificationType>("none");

  /** バリデーション（仕様のメッセージを完全再現） */
  const validate = (): string | null => {
    if (!startAt) return "開始日時を入力してください";
    if (!endAt) return "終了日時を入力してください";
    if (new Date(endAt) <= new Date(startAt)) {
      return "終了日時は開始日時より後に設定してください";
    }
    return null;
  };

  const onSubmit = async () => {
    const error = validate();
    if (error) {
      show("error", error);
      return;
    }
    setSaving(true);
    try {
      await createLesson({
        title,
        className,
        teacherName,
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        capacity: Number(capacity) || 0,
        notificationType,
      });
      show("success", "レッスンを作成しました");
      router.push("/admin/lessons");
    } catch (e) {
      show("error", e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageTitle>レッスン作成</PageTitle>
      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <InputField label="レッスン名" value={title} onChange={setTitle} required placeholder="例: クラシックバレエ基礎" />
        <InputField label="クラス名" value={className} onChange={setClassName} required placeholder="例: ジュニアA" />
        <InputField label="開始日時" value={startAt} onChange={setStartAt} type="datetime-local" required />
        <InputField
          label="終了日時"
          value={endAt}
          onChange={setEndAt}
          type="datetime-local"
          required
          min={startAt || toLocalInputValue(new Date())}
        />
        <InputField label="担当講師" value={teacherName} onChange={setTeacherName} required placeholder="例: YUKA" />
        <InputField label="定員" value={capacity} onChange={setCapacity} type="number" required />
        <SelectField
          label="レッスン終了通知"
          value={notificationType}
          onChange={(v) => setNotificationType(v as NotificationType)}
          options={NOTIFICATION_TYPES.map((t) => ({ value: t, label: NOTIFICATION_LABELS[t] }))}
        />
        <PrimaryButton onClick={onSubmit} disabled={saving}>
          {saving ? "保存中…" : "レッスンを作成する"}
        </PrimaryButton>
      </div>
      <Toast state={state} />
    </div>
  );
}
