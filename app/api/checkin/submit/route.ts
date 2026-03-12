import { NextRequest, NextResponse } from "next/server";
import { getClientSession } from "@/lib/auth";
import { createCheckin, getCurrentWeekCheckin, getDaysUntilNextWeek } from "@/lib/checkins";
import { query } from "@/lib/db";
import { Resend } from "resend";
import { createNotification } from "@/lib/notifications";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const session = await getClientSession();
  if (!session?.client) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      weight,
      energyLevel,
      sleepQuality,
      workoutAdherence,
      dietAdherence,
      notes,
    } = body || {};

    const currentWeekCheckin = await getCurrentWeekCheckin(session.client.id);
    if (currentWeekCheckin) {
      const remaining = getDaysUntilNextWeek();
      return NextResponse.json(
        { message: `Your next check-in unlocks in ${remaining} day(s).` },
        { status: 429 }
      );
    }

    const checkin = await createCheckin({
      clientId: session.client.id,
      weight: weight ? Number(weight) : null,
      energyLevel: energyLevel ? Number(energyLevel) : null,
      sleepQuality: sleepQuality ? Number(sleepQuality) : null,
      workoutAdherence: workoutAdherence ? Number(workoutAdherence) : null,
      dietAdherence: dietAdherence ? Number(dietAdherence) : null,
      notes: typeof notes === "string" ? notes : null,
    });

    // Notify trainer if available
    if (checkin.trainer_id) {
      // Admins table does not have an email column; fetch username only.
      const trainer = await query<{ username?: string | null }>(
        `SELECT username FROM admins WHERE id = $1 LIMIT 1`,
        [checkin.trainer_id]
      );
      const clientName = session.client.name || "Client";
      const trainerEmail = null;

      // In-app notification
      await createNotification({
        userType: "trainer",
        userId: checkin.trainer_id,
        title: "Weekly check-in submitted",
        message: `${clientName} submitted their weekly check-in`,
        type: "checkin_received",
        link: `/trainer/checkins/${checkin.id}`,
      }).catch((err) => console.error("Failed to create trainer check-in notification", err));

      // Email notification skipped because admins table has no email column.
    }

    return NextResponse.json({ ok: true, checkin });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to submit check-in" }, { status: 500 });
  }
}
