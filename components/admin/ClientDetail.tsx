"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn";
import { ClientAnalytics } from "@/components/admin/ClientAnalytics";
import { ClientCheckinHistory } from "@/components/admin/ClientCheckinHistory";
import { TrainerNoteEditor } from "@/components/admin/TrainerNoteEditor";
import { WorkoutBuilder } from "@/components/admin/WorkoutBuilder";
import { groupWorkoutBlocks } from "@/lib/workouts";

type ExerciseItem = {
  id: string;
  label: string;
  blockName?: string;
  exerciseName?: string;
  prescription?: string;
  notes?: string;
  sortOrder: number;
  videoUrl?: string | null;
};

type ClientDetailProps = {
  client: {
    id: string;
    name: string;
    username: string;
    trainerDietNote: string | null;
    trainerDietNoteHtml?: string | null;
    exerciseItems: ExerciseItem[];
    checklistHistory?: {
      date: string;
      totalItems: number;
      completedItems: number;
      completionPct: number;
    }[];
  };
  isHQ?: boolean;
};

type HistoryItem = {
  label: string;
  blockName?: string;
  exerciseName?: string;
  prescription?: string;
  notes?: string;
  sortOrder: number;
  checked: boolean;
  videoUrl: string | null;
};

type ActiveView = "builder" | "notes" | "history";

export function ClientDetail({ client, isHQ = false }: ClientDetailProps) {
  const router = useRouter();
  const [downloadingUndertaking, setDownloadingUndertaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const history = client.checklistHistory ?? [];
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTitle, setHistoryTitle] = useState("");
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("builder");

  const historyBlocks = useMemo(() => groupWorkoutBlocks(historyItems), [historyItems]);

  const openHistoryDay = async (date: string) => {
    setHistoryLoading(true);
    setHistoryItems([]);
    setHistoryTitle(date);
    setHistoryOpen(true);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}/history?date=${encodeURIComponent(date)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to load history");
      }
      const data = await res.json();
      setHistoryItems(data.items || []);
      setHistoryTitle(date);
    } catch (err: any) {
      setError(err.message || "Unable to load history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const downloadUndertaking = async () => {
    setDownloadingUndertaking(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/undertaking/download", {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to download undertaking.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `BRUTAL-Undertaking-${client.name.replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Unable to download undertaking.");
    } finally {
      setDownloadingUndertaking(false);
    }
  };

  const navItems = [
    { id: "clients", label: "Clients", onClick: () => router.push(isHQ ? "/hq" : "/admin") },
    { id: "builder", label: "Workout Builder", onClick: () => setActiveView("builder") },
    { id: "notes", label: "Trainer Notes", onClick: () => setActiveView("notes") },
    { id: "history", label: "History / Logs", onClick: () => setActiveView("history") },
  ] as const;

  const summaryCards = [
    { label: "Workout blocks", value: String(groupWorkoutBlocks(client.exerciseItems).length) },
    { label: "Exercises", value: String(client.exerciseItems.length) },
    { label: "History days", value: String(history.length) },
  ];

  return (
    <div className="space-y-10 md:space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Trainer Dashboard</p>
          <h1 className="text-[clamp(2rem,8vw,2.8rem)] font-semibold md:text-4xl">{client.name}</h1>
          <p className="text-sm text-white/50">@{client.username}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {isHQ ? (
            <button
              onClick={downloadUndertaking}
              disabled={downloadingUndertaking}
              className={cn(
                "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60",
                downloadingUndertaking && "hover:bg-white"
              )}
            >
              {downloadingUndertaking ? "Downloading..." : "Download Undertaking"}
            </button>
          ) : null}
          <button
            onClick={() => router.push(isHQ ? "/hq" : "/admin")}
            className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.02] px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
          >
            Back
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:flex sm:flex-wrap">
        {navItems.map((item) => {
          const isActive = item.id === activeView;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className={cn(
                "inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-medium transition",
                isActive
                  ? "border-amber-300/50 bg-amber-300/10 text-amber-100 shadow-[0_0_24px_rgba(255,214,102,0.12)]"
                  : "border-white/12 bg-white/[0.03] text-white/75 hover:bg-white/[0.06]"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-5 backdrop-blur-xl shadow-[0_0_60px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/45">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {activeView === "builder" ? (
        <WorkoutBuilder clientId={client.id} initialItems={client.exerciseItems} />
      ) : null}

      {activeView === "notes" ? (
        <TrainerNoteEditor
          clientId={client.id}
          initialNote={client.trainerDietNote}
          initialNoteHtml={client.trainerDietNoteHtml}
        />
      ) : null}

      {activeView === "history" ? (
        <div className="space-y-8">
          <ClientCheckinHistory clientId={client.id} isHQ={isHQ} />

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm md:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Logs</p>
                <h2 className="text-xl font-semibold">Past 30 days workout history</h2>
              </div>
              <span className="text-sm text-white/60">{history.length} days</span>
            </div>

            {history.length === 0 ? (
              <p className="mt-5 text-sm text-white/60">No checklist history found.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {history.map((day) => {
                  const dateObj = new Date(day.date);
                  const label = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <div
                      key={day.date}
                      className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
                    >
                      <div className="flex flex-col gap-1 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-semibold">{label}</span>
                        <span className="text-white/60">
                          {day.completedItems}/{day.totalItems} completed
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-white transition-all"
                          style={{ width: `${day.completionPct}%` }}
                        />
                      </div>
                      <div className="mt-3 flex flex-col gap-2 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
                        <span>{day.completionPct}%</span>
                        <button
                          type="button"
                          onClick={() => openHistoryDay(day.date)}
                          className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <ClientAnalytics clientId={client.id} />
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {historyOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 px-0 md:items-center md:px-4">
          <div className="max-h-[92svh] w-full overflow-y-auto rounded-t-[24px] border border-white/15 bg-[#0b0e14] p-4 shadow-2xl sm:p-5 md:max-h-[90vh] md:max-w-3xl md:rounded-2xl md:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/50">Workout History</p>
                <h3 className="text-lg font-semibold text-white sm:text-xl">{historyTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryOpen(false)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/80 hover:bg-white/[0.06]"
              >
                Close
              </button>
            </div>
            {historyLoading ? (
              <p className="text-sm text-white/60">Loading...</p>
            ) : historyItems.length === 0 ? (
              <p className="text-sm text-white/60">No items for this day.</p>
            ) : (
              <div className="space-y-5">
                {historyBlocks.map((block) => (
                  <div key={block.id} className="space-y-3">
                    <h4 className="text-base font-semibold text-white">{block.name}</h4>
                    <div className="space-y-3">
                      {block.exercises.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
                        >
                          <div>
                          <p className="text-sm leading-relaxed text-white/90 break-words">
                              {item.exerciseName || item.label}
                              {item.prescription ? <span className="text-white/60"> — {item.prescription}</span> : null}
                            </p>
                            {item.notes ? <p className="mt-1 text-xs text-white/60">{item.notes}</p> : null}
                            {item.videoUrl ? (
                              <a
                                className="mt-2 inline-block text-xs text-amber-300 hover:underline"
                                href={item.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Video
                              </a>
                            ) : null}
                          </div>
                          <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-white/70">
                            {item.checked ? "Completed" : "Pending"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
