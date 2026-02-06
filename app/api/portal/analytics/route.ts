import { NextRequest, NextResponse } from "next/server";
import { requireClient } from "@/lib/auth";
import { query } from "@/lib/db";
import { toDateKey, lastNDaysKeys } from "@/lib/date";

type SeriesPoint = {
  date: string;
  pct: number;
};

type Summary = {
  avgPct: number;
  winDays: number;
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
 * Query params: ?range=30 (or 90)
 */
export async function GET(request: NextRequest) {
  try {
    const client = await requireClient();

    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get("range") || "30", 10);

    if (![30, 90].includes(range)) {
      return NextResponse.json(
        { error: "Invalid range. Use 30 or 90" },
        { status: 400 }
      );
    }

    // Get dates for the range
    const dates = lastNDaysKeys(range);

    // Query analytics for these dates
    const result = await query<{
      date: string;
      completion_pct: number;
    }>(
      `SELECT date, completion_pct
       FROM client_day_summaries
       WHERE client_id = $1 AND date = ANY($2)
       ORDER BY date ASC`,
      [client.id, dates]
    );

    // Build series
    const series: SeriesPoint[] = result.rows.map((row) => ({
      date: row.date,
      pct: row.completion_pct || 0,
    }));

    // Calculate summary
    const total = series.reduce((sum, point) => sum + point.pct, 0);
    const avgPct = series.length ? Math.round(total / series.length) : 0;
    const winDays = series.filter((point) => point.pct >= 60).length;
    const bestPct = series.length
      ? Math.max(...series.map((point) => point.pct))
      : 0;
    const submittedDays = series.length;

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
        winDays,
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
