import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { toDateKey } from "@/lib/date";

const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export async function GET(req: Request) {
  const session = await getClientSession();
  if (!session?.client) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  if (!month || !MONTH_PATTERN.test(month)) {
    return NextResponse.json({ message: "Invalid month." }, { status: 400 });
  }

  const [yearText, monthText] = month.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return NextResponse.json({ message: "Invalid month." }, { status: 400 });
  }

  try {
    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 0));
    const startKey = toDateKey(start);
    const endKey = toDateKey(end);

    const summaries = await query<{
      date: string;
      completion_pct: number;
      is_submitted: boolean;
      is_win_day: boolean;
    }>(
      `SELECT date, completion_pct, is_submitted, is_win_day
       FROM client_day_summaries
       WHERE client_id = $1 AND date BETWEEN $2 AND $3`,
      [session.client.id, startKey, endKey]
    );

    const days = summaries.rows.map((row) => ({
      date: toDateKey(new Date(row.date as unknown as string)),
      completion_pct: row.completion_pct,
      is_submitted: row.is_submitted,
      is_win_day: row.is_win_day,
    }));

    return NextResponse.json({ month, days });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to load calendar." }, { status: 500 });
  }
}
