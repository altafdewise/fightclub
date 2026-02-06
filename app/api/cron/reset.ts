import { NextRequest, NextResponse } from "next/server";
import { performDailyResetWithRetry } from "@/lib/resetService";

/**
 * Vercel Cron: Daily Reset Handler
 * Triggered by Vercel at specified time (in vercel.json)
 * Performs daily reset of client checklists and evaluates streaks
 */
export async function GET(request: NextRequest) {
  // Verify request is from Vercel (security check)
  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (!authHeader || authHeader !== expectedAuth) {
    console.warn("[CRON] Unauthorized cron request");
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("[CRON] Starting daily reset cron job");

    // Perform reset with retry logic
    const result = await performDailyResetWithRetry(3);

    return NextResponse.json(
      {
        success: true,
        result: {
          clientsProcessed: result.clientsProcessed,
          clientsSucceeded: result.clientsSucceeded,
          clientsFailed: result.clientsFailed,
          streaksEvaluated: result.streaksEvaluated,
          streaksIncremented: result.streaksIncremented,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[CRON] Reset cron failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
