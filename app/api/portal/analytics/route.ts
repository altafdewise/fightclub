import { NextRequest, NextResponse } from "next/server";
import { requireClient } from "@/lib/auth";
import { query } from "@/lib/db";

type SeriesPoint = {
  date: string;
  pct: number;
};

type Summary = {
  avgPct: number;
  submittedDays: number;
  bestPct: number;
  trend?: "up" | "down" | "flat";
};

type AnalyticsResponse = {
  series: SeriesPoint[];
  summary: Summary;
};

/**
 * GET /api/portal/analytics
 * Fetch analytics for authenticated client
 * Query params: ?range=7 | 30 | 90
 */
export async function GET(request: NextRequest) {
  try {
    const client = await requireClient();

    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range") || "7", 10);

    if (![7, 30, 90].includes(range)) {
      return NextResponse.json(
        { error: "Invalid range. Use 7, 30, or 90" },
        { status: 400 }
      );
    }

    // Build continuous day range and join submitted summaries by calendar date
    const seriesResult = await query<{
      date: string;
      completion_pct: number;
    }>(
      `WITH params AS (
         SELECT
           (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date AS today_local,
           $1::uuid AS cid
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
      [client.id]
    );

    const series: SeriesPoint[] = seriesResult.rows.map((row) => ({
      date: row.date,
      pct: row.completion_pct || 0,
    }));

    // Summary based only on submitted days to preserve existing stats behavior
    const submittedRows = await query<{ completion_pct: number }>(
      `SELECT completion_pct
       FROM client_day_summaries
       WHERE client_id = $1
         AND is_submitted = true
         AND created_at >= ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::date - INTERVAL '${range - 1} days')`,
      [client.id]
    );

    const total = submittedRows.rows.reduce((sum, row) => sum + (row.completion_pct || 0), 0);
    const avgPct = submittedRows.rows.length
      ? Math.round(total / submittedRows.rows.length)
      : 0;
    const bestPct = submittedRows.rows.length
      ? Math.max(...submittedRows.rows.map((row) => row.completion_pct || 0))
      : 0;
    const submittedDays = submittedRows.rows.length;

    // Calculate trend (up/down/flat based on last 7 days vs 7 days before)
    let trend: "up" | "down" | "flat" = "flat";
    if (series.length > 14) {
      const recent = series.slice(-7).reduce((sum, p) => sum + p.pct, 0) / 7;
      const previous = series
        .slice(-14, -7)
        .reduce((sum, p) => sum + p.pct, 0) / 7;
      if (recent > previous * 1.05) {
        trend = "up";
      } else if (recent < previous * 0.95) {
        trend = "down";
      }
    }

    const response: AnalyticsResponse = {
      series,
      summary: {
        avgPct,
        submittedDays,
        bestPct,
        trend,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[ANALYTICS] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load analytics" },
      { status: error.status || 500 }
    );
  }
}
