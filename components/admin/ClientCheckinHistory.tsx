"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";

type Checkin = {
  id: string;
  weight: number | null;
  energy: number | null;
  sleep: number | null;
  workout_adherence: number | null;
  diet_adherence: number | null;
  notes: string | null;
  trainer_feedback: string | null;
  created_at: string;
};

type ClientCheckinHistoryProps = {
  clientId: string;
  isHQ?: boolean;
};

const ratingBars = (value: number | null, label: string) => {
  if (value === null || Number.isNaN(value)) {
    return (
      <div className="text-sm text-white/50">
        {label}: <span className="text-white/40">Not provided</span>
      </div>
    );
  }

  const filled = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <div className="flex items-center gap-2 text-sm text-white/80">
      <span className="text-white/60 min-w-[84px]">{label}:</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, idx) => (
          <span
            key={idx}
            className={cn(
              "h-2.5 w-3.5 rounded-sm",
              idx < filled ? "bg-white" : "bg-white/15"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-white/60">{filled}/5</span>
    </div>
  );
};

const formatDate = (value: string) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export function ClientCheckinHistory({ clientId, isHQ = false }: ClientCheckinHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});

  const hasData = useMemo(() => checkins.length > 0, [checkins]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/clients/${clientId}/checkins`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload?.message || "Unable to load check-ins");
        }
        const payload = await res.json();
        setCheckins(payload.checkins || []);
      } catch (err: any) {
        setError(err?.message || "Unable to load check-ins");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  const handleSubmitFeedback = async (checkinId: string) => {
    const draft = feedbackDrafts[checkinId]?.trim();
    if (!draft) return;
    setSavingIds((prev) => ({ ...prev, [checkinId]: true }));
    setError(null);
    try {
      const res = await fetch(`/api/admin/checkins/${checkinId}/reply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: draft }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || "Unable to save feedback");
      }
      const payload = await res.json();
      setCheckins((prev) =>
        prev.map((row) =>
          row.id === checkinId
            ? { ...row, trainer_feedback: draft }
            : row
        )
      );
      setFeedbackDrafts((prev) => ({ ...prev, [checkinId]: "" }));
    } catch (err: any) {
      setError(err?.message || "Unable to save feedback");
    } finally {
      setSavingIds((prev) => ({ ...prev, [checkinId]: false }));
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 mt-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-white/50">Weekly Check-Ins</p>
          <p className="text-lg font-semibold text-white">Progress snapshots</p>
        </div>
      </div>

      {loading && <p className="text-sm text-white/60">Loading check-ins...</p>}
      {error && <p className="text-sm text-red-300">{error}</p>}

      {!loading && !error && !hasData && (
        <p className="text-sm text-white/50">No weekly check-ins yet.</p>
      )}

      {!loading && !error && hasData && (
        <div className="space-y-5">
          {checkins.map((checkin) => (
            <div
              key={checkin.id}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">{formatDate(checkin.created_at)}</p>
                  <p className="text-xs text-white/60">Weight: {checkin.weight ?? "—"}</p>
                </div>
                {checkin.trainer_feedback && (
                  <span className="text-[11px] uppercase tracking-[0.14em] text-white/50">Replied</span>
                )}
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {ratingBars(checkin.energy, "Energy")}
                {ratingBars(checkin.sleep, "Sleep")}
                {ratingBars(checkin.workout_adherence, "Workout adherence")}
                {ratingBars(checkin.diet_adherence, "Diet adherence")}
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.14em] text-white/50">Client Notes</p>
                <p className="text-sm text-white/80 whitespace-pre-wrap min-h-[24px]">
                  {checkin.notes ? checkin.notes : "No notes provided."}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.14em] text-white/50">Trainer Feedback</p>
                {checkin.trainer_feedback ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/90">
                    {checkin.trainer_feedback}
                  </div>
                ) : isHQ ? (
                  <p className="text-sm text-white/50">No feedback yet.</p>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={feedbackDrafts[checkin.id] || ""}
                      onChange={(e) =>
                        setFeedbackDrafts((prev) => ({ ...prev, [checkin.id]: e.target.value }))
                      }
                      rows={3}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
                      placeholder="Add feedback for the client"
                      disabled={savingIds[checkin.id]}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSubmitFeedback(checkin.id)}
                        disabled={savingIds[checkin.id] || !(feedbackDrafts[checkin.id]?.trim())}
                        className={cn(
                          "inline-flex items-center justify-center rounded-lg border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black transition",
                          savingIds[checkin.id]
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-white/90"
                        )}
                      >
                        {savingIds[checkin.id] ? "Saving..." : "Submit feedback"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
