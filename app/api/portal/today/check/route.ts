import { NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { todayKey } from "@/lib/date";
import { calculateDayStats, getDaySummary, upsertDaySummary } from "@/lib/portal";

export async function POST(req: Request) {
  const session = await getClientSession();
  if (!session?.client) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { itemId, checked } = await req.json();
    if (!itemId || typeof checked !== "boolean") {
      return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
    }

    const item = await query<{
      id: string;
      daily_checklist_id: string;
      checked: boolean;
      client_id: string;
      date: string;
    }>(
      `SELECT dci.id, dci.daily_checklist_id, dci.checked, dc.client_id, dc.date
       FROM daily_checklist_items dci
       JOIN daily_checklists dc ON dc.id = dci.daily_checklist_id
       WHERE dci.id = $1
       LIMIT 1`,
      [itemId]
    );

    const row = item.rows[0];
    if (!row || row.client_id !== session.client.id) {
      return NextResponse.json({ message: "Not found." }, { status: 404 });
    }

    if (row.date !== todayKey()) {
      return NextResponse.json({ message: "Not allowed." }, { status: 403 });
    }

    const existingSummary = await getDaySummary(session.client.id, row.date);
    if (existingSummary?.is_submitted) {
      return NextResponse.json({ message: "Day already submitted." }, { status: 403 });
    }

    await query(
      "UPDATE daily_checklist_items SET checked = $1, updated_at = NOW() WHERE id = $2",
      [checked, itemId]
    );

    const stats = await calculateDayStats(session.client.id, row.date);
    await upsertDaySummary(session.client.id, row.date, stats);

    return NextResponse.json({ ok: true, item: { id: itemId, checked } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to update." }, { status: 500 });
  }
}
