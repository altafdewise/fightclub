"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";

type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

type ClientTodayProps = {
  name: string;
  note: string;
  items: ChecklistItem[];
  date: string;
};

export function ClientToday({ name, note, items: initialItems, date }: ClientTodayProps) {
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [savingId, setSavingId] = useState<string | null>(null);

  const total = items.length;
  const checkedCount = items.filter((item) => item.checked).length;
  const progress = total > 0 ? Math.round((checkedCount / total) * 100) : 0;

  const toggle = async (item: ChecklistItem) => {
    const nextChecked = !item.checked;
    setSavingId(item.id);
    setItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, checked: nextChecked } : it))
    );

    try {
      const res = await fetch("/api/portal/today/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, checked: nextChecked }),
      });

      if (!res.ok) {
        throw new Error("Unable to update.");
      }
    } catch {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, checked: item.checked } : it))
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal/login");
  };

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Today</p>
          <h1 className="text-3xl md:text-4xl font-semibold">Welcome, {name}.</h1>
          <p className="text-xs text-white/50 mt-2">{date}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push("/portal/history")}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            History
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-4">
        <h2 className="text-xl font-semibold">Trainer Note</h2>
        <p className="text-sm text-white/70 leading-relaxed">
          {note ? note : "No note added yet. Check back soon for your updated guidance."}
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Exercise Checklist</p>
            <h2 className="text-xl font-semibold">Today's work</h2>
          </div>
          <div className="text-sm text-white/60">
            {checkedCount} of {total} completed
          </div>
        </div>

        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-white/70 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {total === 0 ? (
          <p className="text-sm text-white/50">No exercises assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <label
                key={item.id}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border border-white/10 px-4 py-4 cursor-pointer transition hover:bg-white/[0.04]",
                  item.checked && "bg-white/[0.05]"
                )}
              >
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggle(item)}
                  disabled={savingId === item.id}
                  className="h-5 w-5 accent-white"
                />
                <span className="text-sm text-white/90">{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
