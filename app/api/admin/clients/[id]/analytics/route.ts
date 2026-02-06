import { NextResponse } from "next/server";
import { getAdminSession, getHQSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { toDateKey } from "@/lib/date";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminSession = await getAdminSession();
    const hqSession = await getHQSession();

    // Allow both admin and hq sessions to access analytics
    if (!adminSession?.admin && !hqSession?.hq) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: "Missing client id." }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const rangeParam = searchParams.get("range");
    const range = rangeParam === "90" ? 90 : 30;

    const today = new Date();
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - (range - 1));
    const startKey = toDateKey(start);

    const summaryResult = await query<{
      avg_pct: number;
      best_pct: number;
      submitted_days: number;
      win_days: number;
    }>(
      `SELECT
         COALESCE(AVG(completion_pct),0)::int AS avg_pct,
         COALESCE(MAX(completion_pct),0)::int AS best_pct,
         COUNT(*)::int AS submitted_days,
         COALESCE(SUM(CASE WHEN is_win_day THEN 1 ELSE 0 END),0)::int AS win_days
       FROM client_day_summaries
       WHERE client_id = $1 AND is_submitted = true AND date >= $2`,
      [id, startKey]
    );

    let series: { date: string; pct: number }[] = [];

    if (range === 90) {
      const weekly = await query<{ week_start: string; avg_pct: number }>(
        `SELECT date_trunc('week', date)::date AS week_start,
                COALESCE(AVG(completion_pct),0)::int AS avg_pct
         FROM client_day_summaries
         WHERE client_id = $1 AND is_submitted = true AND date >= $2
         GROUP BY week_start
         ORDER BY week_start ASC`,
        [id, startKey]
      );
      series = weekly.rows.map((row) => ({
        date: toDateKey(new Date(row.week_start as unknown as string)),
        pct: row.avg_pct,
      }));
    } else {
      const daily = await query<{ date: string; completion_pct: number }>(
        `SELECT date, completion_pct
         FROM client_day_summaries
         WHERE client_id = $1 AND is_submitted = true AND date >= $2
         ORDER BY date ASC`,
        [id, startKey]
      );
      series = daily.rows.map((row) => ({
        date: toDateKey(new Date(row.date as unknown as string)),
        pct: row.completion_pct,
      }));
    }

    const trendRows = await query<{ completion_pct: number }>(
      `SELECT completion_pct
       FROM client_day_summaries
       WHERE client_id = $1 AND is_submitted = true AND date >= $2
       ORDER BY date DESC
       LIMIT 14`,
      [id, startKey]
    );

    const recent = trendRows.rows.slice(0, 7);
    const prev = trendRows.rows.slice(7, 14);
    const avg = (rows: { completion_pct: number }[]) =>
      rows.length ? rows.reduce((sum, row) => sum + row.completion_pct, 0) / rows.length : 0;

    let trend: "up" | "down" | "flat" | undefined = "flat";
    if (recent.length > 0 && prev.length > 0) {
      const recentAvg = avg(recent);
      const prevAvg = avg(prev);
      if (recentAvg > prevAvg + 1) trend = "up";
      else if (recentAvg < prevAvg - 1) trend = "down";
    } else {
      trend = undefined;
    }

    const summaryRow = summaryResult.rows[0] || {
      avg_pct: 0,
      best_pct: 0,
      submitted_days: 0,
      win_days: 0,
    };

    return NextResponse.json({
      series,
      summary: {
        avgPct: summaryRow.avg_pct || 0,
        winDays: summaryRow.win_days || 0,
        submittedDays: summaryRow.submitted_days || 0,
        bestPct: summaryRow.best_pct || 0,
        trend,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to load analytics." }, { status: 500 });
  }
}
