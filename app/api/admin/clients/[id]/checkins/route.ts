import { NextResponse } from "next/server";
import { getAdminSession, getHQSession } from "@/lib/auth";
import { getClientCheckinHistory } from "@/lib/checkins";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminSession = await getAdminSession();
  const hqSession = await getHQSession();

  if (!adminSession?.admin && !hqSession?.hq) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ message: "Missing client id" }, { status: 400 });
  }

  try {
    const rows = await getClientCheckinHistory(id);
    const data = rows.map((row) => ({
      id: row.id,
      client_id: row.client_id,
      weight: row.weight,
      energy: row.energy_level,
      sleep: row.sleep_quality,
      workout_adherence: row.workout_adherence,
      diet_adherence: row.diet_adherence,
      notes: row.notes,
      trainer_feedback: row.trainer_feedback,
      trainer_replied_at: row.trainer_replied_at,
      created_at: row.created_at,
    }));

    return NextResponse.json({ checkins: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to load check-ins" }, { status: 500 });
  }
}
