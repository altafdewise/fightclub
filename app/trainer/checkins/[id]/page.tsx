import { getAdminSession, getHQSession } from "@/lib/auth";
import { getClientCheckinHistory } from "@/lib/checkins";
import { query } from "@/lib/db";
import { CheckinReply } from "@/components/trainer/CheckinReply";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function TrainerCheckinDetail({ params }: { params: { id: string } }) {
  const adminSession = await getAdminSession();
  const hqSession = await getHQSession();
  if (!adminSession?.admin && !hqSession?.hq) {
    redirect("/trainer/login");
  }

  const history = await getClientCheckinHistory(params.id);
  if (!history.length) {
    notFound();
  }

  const latest = history[0];

  // Verify assignment unless HQ
  if (!hqSession?.hq) {
    const assignment = await query<{ trainer_id: string }>(
      `SELECT trainer_id FROM client_trainer_assignments WHERE client_id = $1 LIMIT 1`,
      [params.id]
    );
    const trainerId = assignment.rows[0]?.trainer_id;
    if (trainerId && trainerId !== adminSession?.admin?.id) {
      redirect("/trainer/checkins");
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/trainer/checkins" className="text-sm text-white/60 hover:text-white">← Back to check-ins</Link>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Latest Check-in</p>
        <p className="text-lg font-semibold text-white">{new Date(latest.created_at).toLocaleDateString()}</p>
        <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
          <span>Weight: {latest.weight ?? "-"}</span>
          <span>Energy: {latest.energy_level ?? "-"}</span>
          <span>Sleep: {latest.sleep_quality ?? "-"}</span>
          <span>Workout: {latest.workout_adherence ?? "-"}</span>
          <span>Diet: {latest.diet_adherence ?? "-"}</span>
        </div>
        {latest.notes && <p className="text-sm text-white/70">Notes: {latest.notes}</p>}
      </div>

      {!latest.trainer_feedback && <CheckinReply checkinId={latest.id} disabled={false} />}

      <div className="space-y-3">
        <p className="text-sm text-white/60">History</p>
        {history.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/80">{new Date(item.created_at).toLocaleDateString()}</p>
              <p className="text-xs text-white/50">{item.trainer_feedback ? "Reviewed" : "Awaiting review"}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/70">
              <span>Weight: {item.weight ?? "-"}</span>
              <span>Energy: {item.energy_level ?? "-"}</span>
              <span>Sleep: {item.sleep_quality ?? "-"}</span>
              <span>Workout: {item.workout_adherence ?? "-"}</span>
              <span>Diet: {item.diet_adherence ?? "-"}</span>
            </div>
            {item.notes && <p className="text-xs text-white/70">Notes: {item.notes}</p>}
            {item.trainer_feedback && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                <p className="uppercase tracking-[0.15em] text-white/50">Feedback</p>
                <p className="mt-1 whitespace-pre-wrap">{item.trainer_feedback}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
