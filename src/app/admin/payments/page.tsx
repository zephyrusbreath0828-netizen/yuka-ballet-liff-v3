"use client";

import { useEffect, useState } from "react";
import { Card, PageTitle, InputField, PrimaryButton, SelectField } from "@/components/common";
import { EmptyState, Loading, Toast, useToast } from "@/components/ui";
import {
  createPayment,
  listAllPayments,
  listUsers,
  setPaymentStatus,
  deletePayment,
  formatDateTime,
} from "@/lib/firestore";
import { PAYMENT_STATUS_LABELS, type AppUser, type Payment } from "@/lib/types";

export default function AdminPaymentsPage() {
  const { state, show } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [saving, setSaving] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const refresh = async () => {
    const [u, p] = await Promise.all([listUsers(), listAllPayments()]);
    setUsers(u);
    setPayments(p);
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

  if (loading) return <Loading />;

  const onSubmit = async () => {
    const target = users.find((u) => u.uid === targetUserId);
    if (!target) {
      show("error", "対象の生徒を選択してください");
      return;
    }
    if (!title.trim()) {
      show("error", "項目名を入力してください");
      return;
    }
    const n = Number(amount);
    if (!amount || Number.isNaN(n) || n <= 0) {
      show("error", "金額を入力してください");
      return;
    }
    setSaving(true);
    try {
      await createPayment({
        userId: target.uid,
        displayName: target.displayName,
        memberNumber: target.memberNumber,
        title: title.trim(),
        amount: n,
        dueDate: null,
      });
      setTitle("");
      setAmount("");
      show("success", "集金を登録しました");
      await refresh();
    } catch {
      show("error", "登録に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (p: Payment) => {
    await setPaymentStatus(p.paymentId, p.status === "paid" ? "unpaid" : "paid");
    await refresh();
  };

  return (
    <div className="space-y-4">
      <PageTitle>集金管理</PageTitle>

      <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-bold">新規集金</p>
        <SelectField
          label="対象の生徒"
          value={targetUserId}
          onChange={setTargetUserId}
          options={[
            { value: "", label: "選択してください" },
            ...users.map((u) => ({
              value: u.uid,
              label: `${u.displayName}（${u.memberNumber || "会員番号未登録"}）`,
            })),
          ]}
        />
        <InputField label="項目名" value={title} onChange={setTitle} placeholder="例: 9月月謝" required />
        <InputField label="金額（円）" value={amount} onChange={setAmount} type="number" required />
        <PrimaryButton onClick={onSubmit} disabled={saving}>
          {saving ? "登録中…" : "登録する"}
        </PrimaryButton>
      </div>

      {payments.length === 0 ? (
        <EmptyState label="集金データはまだありません" />
      ) : (
        payments.map((p) => (
          <Card key={p.paymentId} className="flex items-center justify-between">
            <div>
              <p className="font-bold">{p.title}</p>
              <p className="text-xs text-gray-500">
                {p.displayName}（{p.memberNumber || "会員番号未登録"}）
              </p>
              <p className="text-xs text-gray-400">作成: {formatDateTime(p.createdAt)}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-lg font-bold">¥{p.amount.toLocaleString()}</p>
              <button
                type="button"
                onClick={() => onToggle(p)}
                className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                  p.status === "paid"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {PAYMENT_STATUS_LABELS[p.status]}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deletePayment(p.paymentId);
                  await refresh();
                }}
                className="text-[10px] text-gray-400 underline"
              >
                削除
              </button>
            </div>
          </Card>
        ))
      )}
      <Toast state={state} />
    </div>
  );
}
