"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ROLE_LABEL, type Role } from "@/lib/types";

const ROLES: Role[] = ["admin", "teacher", "parent"];

/** デモモード時のロール切替（Firebase モードでは表示されない） */
export default function RoleSwitcher() {
  const { role, setDemoRole, demoMode } = useAuth();
  const [saving, setSaving] = useState(false);

  if (!demoMode) return null;

  return (
    <div>
      <p className="mb-2 text-[12px] font-semibold text-ink-700">ロール切替（デモ）</p>
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            disabled={saving}
            onClick={() => {
              setSaving(true);
              setDemoRole(r);
              setSaving(false);
            }}
            className={`rounded-xl border px-3 py-2 text-[12px] font-semibold transition ${
              role === r
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-brand-200 bg-white text-ink-700"
            }`}
          >
            {ROLE_LABEL[r]}
          </button>
        ))}
      </div>
    </div>
  );
}
