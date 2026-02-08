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
    const range = ["7", "30", "90"].includes(rangeParam || "")
      ? Number(rangeParam)
      : 7;

    const summaryResult = await query<{
      avg_pct: number;
      best_pct: number;
      submitted_days: number;
    }>(
      `WITH params AS (
         SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date AS today_local
       )
       SELECT
         COALESCE(AVG(completion_pct),0)::int AS avg_pct,
         COALESCE(MAX(completion_pct),0)::int AS best_pct,
         COUNT(*)::int AS submitted_days
       FROM client_day_summaries
       WHERE client_id = $1
         AND is_submitted = true
         AND created_at >= ((SELECT today_local FROM params) - INTERVAL '${range - 1} days')`,
      [id]
    );

    const seriesResult = await query<{
      date: string;
      completion_pct: number;
    }>(
      `WITH params AS (
         SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date AS today_local, $1::uuid AS cid
       ), day_range AS (
         SELECT generate_series(
           (SELECT today_local FROM params) - INTERVAL '${range - 1} days',
           (SELECT today_local FROM params),
           INTERVAL '1 day'
         )::date AS day
       ), submitted AS (
         SELECT
           DATE(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kolkata') AS day,
           completion_pct
         FROM client_day_summaries
         WHERE client_id = (SELECT cid FROM params)
           AND is_submitted = true
           AND created_at >= ((SELECT today_local FROM params) - INTERVAL '${range - 1} days')
       )
       SELECT d.day AS date, COALESCE(s.completion_pct, 0) AS completion_pct
       FROM day_range d
       LEFT JOIN submitted s ON s.day = d.day
       ORDER BY d.day ASC`,
      [id]
    );

    const series = seriesResult.rows.map((row) => ({
      date: toDateKey(new Date(row.date as unknown as string)),
      pct: row.completion_pct,
    }));

    const trendRows = await query<{ completion_pct: number }>(
      `SELECT completion_pct
       FROM client_day_summaries
       WHERE client_id = $1
         AND is_submitted = true
         AND created_at >= ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '${Math.max(13, range - 1)} days')
       ORDER BY created_at DESC
       LIMIT 14`,
      [id]
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
    };

    return NextResponse.json({
      series,
      summary: {
        avgPct: summaryRow.avg_pct || 0,
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
