import { requireClient } from "@/lib/auth";
import { getClientCheckinHistory } from "@/lib/checkins";

export default async function CheckinHistoryPage() {
  const client = await requireClient();
  const history = await getClientCheckinHistory(client.id);

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const latest = history[0];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 pb-12 pt-6">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-white/45">Weekly Coaching</p>
        <h1 className="text-3xl font-semibold">Check-in history</h1>
        <p className="text-sm text-white/60">Your weekly reflections, notes, and coach replies in one place.</p>
        <div className="mx-auto h-px w-16 rounded-full bg-white/10" />
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center shadow-[0_0_60px_-12px_rgba(255,255,255,0.1)]">
          <p className="text-lg font-semibold">No check-ins yet</p>
          <p className="mt-2 text-sm text-white/60">Start with your first weekly reflection to see your journey here.</p>
          <a
            href="/portal/checkin"
            className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black shadow hover:bg-white/90"
          >
            Complete this week’s check-in
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_60px_-12px_rgba(255,255,255,0.08)]">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.16em] text-white/50">Latest</p>
                <p className="text-base font-semibold text-white">Last submitted {formatDate(latest.created_at)}</p>
              </div>
              <a
                href="/portal/checkin"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow hover:bg-white/90"
              >
                Submit new check-in
              </a>
            </div>
          </div>

          <div className="relative space-y-6">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" aria-hidden />
            {history.map((item) => {
              const hasFeedback = Boolean(item.trainer_feedback);
              return (
                <div key={item.id} className="relative pl-10">
                  <span className="absolute left-0 top-3 h-5 w-5 rounded-full border-2 border-white/40 bg-white/[0.08] shadow-[0_0_0_4px_rgba(255,255,255,0.04)]" aria-hidden />

                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-5 shadow-[0_0_60px_-14px_rgba(255,255,255,0.12)] space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-white/50">Week of</p>
                        <p className="text-lg font-semibold text-white">{formatDate(item.created_at)}</p>
                      </div>
                      <div className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/80">
                        {hasFeedback ? "Coach replied" : "Awaiting feedback"}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 space-y-2">
                        <p className="text-xs uppercase tracking-[0.12em] text-white/50">Body</p>
                        <div className="text-sm text-white/80">Weight: {item.weight ?? "-"}</div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 space-y-2">
                        <p className="text-xs uppercase tracking-[0.12em] text-white/50">Recovery</p>
                        <div className="text-sm text-white/80 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs">Energy: {item.energy_level ?? "-"}</span>
                          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs">Sleep: {item.sleep_quality ?? "-"}</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 space-y-2">
                        <p className="text-xs uppercase tracking-[0.12em] text-white/50">Adherence</p>
                        <div className="text-sm text-white/80 flex flex-wrap gap-2">
                          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs">Workout: {item.workout_adherence ?? "-"}</span>
                          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs">Diet: {item.diet_adherence ?? "-"}</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 space-y-2">
                        <p className="text-xs uppercase tracking-[0.12em] text-white/50">Status</p>
                        <div className="text-sm text-white/80">{hasFeedback ? "Reviewed" : "Pending coach review"}</div>
                        {item.trainer_replied_at && (
                          <p className="text-[11px] text-white/50">Replied {formatDateTime(item.trainer_replied_at)}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-xs uppercase tracking-[0.12em] text-white/50">Message to coach</p>
                        <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap">{item.notes || "(No message provided)"}</p>
                      </div>

                      {hasFeedback ? (
                        <div className="rounded-xl border border-emerald-200/30 bg-emerald-200/10 p-3">
                          <p className="text-xs uppercase tracking-[0.12em] text-emerald-100">Coach reply</p>
                          <p className="mt-2 text-sm text-emerald-50 whitespace-pre-wrap">{item.trainer_feedback}</p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/60">
                          Awaiting coach feedback
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
