"use client";

type Props = {
  status: {
    canSubmit: boolean;
    daysRemaining: number;
    nextUnlockDate: Date | null;
  };
};

function formatUnlock(date: Date | string | null) {
  if (!date) return null;
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function WeeklyCheckinCard({ status }: Props) {
  const unlockLabel = formatUnlock(status.nextUnlockDate);
  const title = status.canSubmit ? "Weekly Check-In" : "Weekly Check-In Submitted";
  const description = status.canSubmit
    ? "Your coach is waiting for your weekly update."
    : `Your next check-in unlocks in ${status.daysRemaining} day${status.daysRemaining === 1 ? "" : "s"}.`;

  return (
    <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-6 shadow-[0_0_60px_-12px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.16em] text-white/55 font-semibold">Weekly</p>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="text-sm text-white/70">{description}</p>
          {!status.canSubmit && unlockLabel && (
            <p className="text-xs text-white/50">Unlocks on {unlockLabel}</p>
          )}
        </div>
        <div className="rounded-full bg-amber-300/20 px-3 py-1 text-xs font-semibold text-amber-200 border border-amber-200/50">
          {status.canSubmit ? "Ready" : "Locked"}
        </div>
      </div>

      <div className="pt-2">
        {status.canSubmit ? (
          <a
            href="/portal/checkin"
            className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-200 px-4 py-3 text-sm font-semibold text-black shadow-[0_10px_30px_-12px_rgba(255,214,102,0.8)] transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/60"
          >
            Complete Check-In
          </a>
        ) : (
          <a
            href="/portal/checkin/history"
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            View Check-In History
          </a>
        )}
      </div>
    </div>
  );
}
