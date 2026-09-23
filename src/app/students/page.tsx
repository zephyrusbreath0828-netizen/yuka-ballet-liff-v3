"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, Card, EmptyState, Loading, SectionTitle } from "@/components/ui";
import { fetchStudents } from "@/lib/repository";
import { LEVEL_LABEL, type Student } from "@/lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState<"all" | Student["level"]>("all");

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const list = await fetchStudents();
        if (alive) setStudents(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const key = keyword.trim().toLowerCase();
    return students.filter((s) => {
      const matchLevel = level === "all" || s.level === level;
      const matchKey =
        key === "" ||
        s.name.toLowerCase().includes(key) ||
        s.nameKana.toLowerCase().includes(key);
      return matchLevel && matchKey;
    });
  }, [students, keyword, level]);

  return (
    <div className="space-y-4">
      <SectionTitle title={`生徒一覧（${students.length}名）`} />

      <div className="space-y-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="名前・ふりがなで検索"
          className="w-full rounded-xl border border-brand-200 bg-white px-3 py-2.5 text-[13px] outline-none placeholder:text-ink-500/60 focus:border-brand-400"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {(["all", "kids", "beginner", "intermediate", "advanced"] as const).map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setLevel(lv)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                level === lv
                  ? "border-brand-500 bg-brand-500 text-white"
                  : "border-brand-200 bg-white text-ink-700"
              }`}
            >
              {lv === "all" ? "すべて" : LEVEL_LABEL[lv]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState message="条件に一致する生徒が見つかりませんでした。" />
      ) : (
        <ul className="space-y-2">
          {filtered.map((s) => (
            <li key={s.id}>
              <Link href={`/students/${s.id}`}>
                <Card className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-lg">
                      🩰
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-ink-900">{s.name}</p>
                      <p className="text-[10px] text-ink-500">{s.nameKana}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge tone="brand">{LEVEL_LABEL[s.level]}</Badge>
                    {!s.active ? <Badge tone="slate">休会中</Badge> : null}
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
