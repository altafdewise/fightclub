import { NextResponse } from "next/server";
import { requireAdminOrHQ } from "@/lib/server/requireAdminOrHQ";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminOrHQ();
  if (!auth.authorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ message: "date is required (YYYY-MM-DD)" }, { status: 400 });
  }

  const checklist = await query<{ id: string }>(
    `SELECT id
     FROM daily_checklists
     WHERE client_id = $1
       AND date::date = $2::date
     LIMIT 1`,
    [id, date]
  );

  if (!checklist.rows.length) {
    return NextResponse.json({ message: "Checklist not found" }, { status: 404 });
  }

  const checklistId = checklist.rows[0].id;

  const items = await query<{
    label: string;
    block_name: string | null;
    exercise_name: string | null;
    prescription: string | null;
    exercise_notes: string | null;
    sort_order: number;
    checked: boolean;
    video_url: string | null;
  }>(
    `SELECT label, block_name, exercise_name, prescription, exercise_notes, sort_order, checked, video_url
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1
     ORDER BY sort_order ASC`,
    [checklistId]
  );

  return NextResponse.json({
    date,
    items: items.rows.map((item) => ({
      label: item.label,
      blockName: item.block_name ?? "Workout",
      exerciseName: item.exercise_name ?? item.label,
      prescription: item.prescription ?? "",
      notes: item.exercise_notes ?? "",
      sortOrder: item.sort_order,
      checked: item.checked,
      videoUrl: item.video_url,
    })),
  });
}
