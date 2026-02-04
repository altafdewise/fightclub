import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth";
import { calculateDayStats, getStreaks, upsertDaySummary } from "@/lib/portal";
import { todayKey } from "@/lib/date";

export async function POST() {
  const session = await getClientSession();
  if (!session?.client) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const date = todayKey();
    const stats = await calculateDayStats(session.client.id, date);
    await upsertDaySummary(session.client.id, date, stats, { submitted: true });

    const streaks = await getStreaks(session.client.id);

    return NextResponse.json({
      ok: true,
      completion_pct: stats.completionPct,
      is_win_day: stats.isWinDay,
      current_streak: streaks.current,
      best_streak: streaks.best,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to submit day." }, { status: 500 });
  }
}
