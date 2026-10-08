"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/lib/user-context";
import { Card, PageTitle } from "@/components/common";
import { EmptyState, Loading } from "@/components/ui";
import { listPaymentsByUser, formatDateTime } from "@/lib/firestore";
import { PAYMENT_STATUS_LABELS, type Payment } from "@/lib/types";

export default function PaymentsPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setPayments(await listPaymentsByUser(user.uid));
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading || !user) return <Loading />;

  const unpaid = payments.filter((p) => p.status === "unpaid");
  const paid = payments.filter((p) => p.status === "paid");

  const Row = ({ p }: { p: Payment }) => (
    <Card className="flex items-center justify-between">
      <div>
        <p className="font-bold">{p.title}</p>
        <p className="text-xs text-gray-500">
          {p.dueDate ? `期限: ${formatDateTime(p.dueDate)}` : "期限なし"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold">¥{p.amount.toLocaleString()}</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
            p.status === "paid"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {PAYMENT_STATUS_LABELS[p.status]}
        </span>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <PageTitle>集金</PageTitle>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-red-600">未払い ({unpaid.length}件)</h2>
        {unpaid.length === 0 ? (
          <EmptyState label="未払いの集金はありません" />
        ) : (
          unpaid.map((p) => <Row key={p.paymentId} p={p} />)
        )}
      </section>
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-emerald-600">支払い済み ({paid.length}件)</h2>
        {paid.length === 0 ? (
          <EmptyState label="支払い済みの記録はありません" />
        ) : (
          paid.map((p) => <Row key={p.paymentId} p={p} />)
        )}
      </section>
    </div>
  );
}
