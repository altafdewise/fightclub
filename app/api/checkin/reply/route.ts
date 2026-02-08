import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, getHQSession } from "@/lib/auth";
import { addTrainerFeedback, getCheckinById } from "@/lib/checkins";
import { query } from "@/lib/db";
import { Resend } from "resend";
import { createNotification } from "@/lib/notifications";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const adminSession = await getAdminSession();
  const hqSession = await getHQSession();
  if (!adminSession?.admin && !hqSession?.hq) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { checkinId, feedback } = body || {};
    if (!checkinId || typeof feedback !== "string" || !feedback.trim()) {
      return NextResponse.json({ message: "Missing feedback" }, { status: 400 });
    }

    const checkin = await getCheckinById(checkinId);
    if (!checkin) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Only assigned trainer or HQ can reply
    if (!hqSession?.hq && adminSession?.admin?.id !== checkin.trainer_id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updated = await addTrainerFeedback(checkinId, checkin.trainer_id || adminSession?.admin?.id || "", feedback.trim());
    if (!updated) {
      return NextResponse.json({ message: "Unable to save feedback" }, { status: 500 });
    }

    // Notify client
    await createNotification({
      userType: "client",
      userId: checkin.client_id,
      title: "Coach replied to your check-in",
      message: "Your coach reviewed your week.",
      type: "trainer_reply",
      link: `/portal/checkin/history`,
    }).catch((err) => console.error("Failed to create trainer reply notification", err));

    // Email if possible
    if (process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
      const clientRes = await query<{ email?: string | null }>(
        `SELECT email FROM clients WHERE id = $1 LIMIT 1`,
        [checkin.client_id]
      );
      const clientEmail = clientRes.rows[0]?.email;
      if (clientEmail) {
        await resend.emails
          .send({
            from: process.env.FROM_EMAIL,
            to: clientEmail,
            subject: "Your weekly check-in has feedback",
            html: `<p>Your trainer replied to your weekly check-in.</p><p>Feedback:</p><p>${feedback.trim()}</p>`,
          })
          .catch((err) => console.error("Failed to send client feedback email", err));
      }
    }

    return NextResponse.json({ ok: true, checkin: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to submit feedback" }, { status: 500 });
  }
}
