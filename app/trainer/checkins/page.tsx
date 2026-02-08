import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import Link from "next/link";

export default async function TrainerCheckinsPage() {
  const admin = await requireAdmin();
  const rows = await query<{
    client_id: string;
    client_name: string;
    last_checkin: string | null;
    has_feedback: boolean;
  }>(
    `WITH latest AS (
       SELECT DISTINCT ON (client_id) client_id, created_at, trainer_feedback
       FROM weekly_checkins
       WHERE trainer_id = $1
       ORDER BY client_id, created_at DESC
     )
     SELECT c.id AS client_id, c.name AS client_name, l.created_at AS last_checkin, (l.trainer_feedback IS NOT NULL) AS has_feedback
     FROM client_trainer_assignments a
     JOIN clients c ON c.id = a.client_id
     LEFT JOIN latest l ON l.client_id = c.id
     WHERE a.trainer_id = $1
     ORDER BY COALESCE(l.created_at, '1970-01-01') DESC`,
    [admin.id]
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Weekly Coaching</p>
        <h1 className="text-3xl font-semibold mt-1">Check-ins</h1>
      </div>
      <div className="space-y-3">
        {rows.rows.map((row) => {
          const status = !row.last_checkin ? "awaiting check-in" : row.has_feedback ? "reviewed" : "awaiting review";
          return (
            <Link
              key={row.client_id}
              href={`/trainer/checkins/${row.client_id}`}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/30"
            >
              <div>
                <p className="text-sm font-semibold text-white">{row.client_name}</p>
                <p className="text-xs text-white/50">
                  Last check-in: {row.last_checkin ? new Date(row.last_checkin).toLocaleDateString() : "None"}
                </p>
              </div>
              <span className="text-xs uppercase tracking-[0.15em] text-white/60">{status}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
