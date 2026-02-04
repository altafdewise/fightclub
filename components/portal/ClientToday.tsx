"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { isSafeHttpUrl } from "@/utils/url";

type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
  videoUrl?: string | null;
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
          <div
            className="h-full bg-white transition-all shadow-[0_0_12px_rgba(255,255,255,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {total === 0 ? (
          <p className="text-sm text-white/50">No exercises assigned yet.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const hasVideo = isSafeHttpUrl(item.videoUrl);
              return (
              <label
                key={item.id}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border border-white/10 px-4 py-4 cursor-pointer transition hover:bg-white/[0.04]",
                  item.checked && "bg-white/[0.05]"
                )}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggle(item)}
                  disabled={savingId === item.id}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "h-5 w-5 rounded-md border flex items-center justify-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60",
                    item.checked ? "bg-white border-white" : "bg-transparent border-white/30"
                  )}
                >
                  <svg
                    viewBox="0 0 16 16"
                    className={cn(
                      "h-3.5 w-3.5 text-black transition",
                      item.checked ? "opacity-100" : "opacity-0"
                    )}
                    aria-hidden="true"
                  >
                    <path
                      d="M12.5 4.5 6.8 10.2 3.5 6.9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-sm text-white/90 truncate">{item.label}</span>
                </div>
                {hasVideo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (item.videoUrl) {
                        window.open(item.videoUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/[0.02] px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/[0.06]"
                  >
                    Video
                  </button>
                )}
              </label>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
