import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getCheckinById } from "@/lib/checkins";
import { query } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ checkinId: string }> }
) {
  const adminSession = await getAdminSession();
  if (!adminSession?.admin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { checkinId } = await params;
  if (!checkinId) {
    return NextResponse.json({ message: "Missing check-in id" }, { status: 400 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const feedback = typeof body?.feedback === "string" ? body.feedback.trim() : "";
    if (!feedback) {
      return NextResponse.json({ message: "Feedback is required" }, { status: 400 });
    }

    const existing = await getCheckinById(checkinId);
    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const update = await query<{
      id: string;
      client_id: string;
      trainer_feedback: string | null;
      trainer_replied_at: string | null;
    }>(
      `UPDATE weekly_checkins
       SET trainer_feedback = $1,
           trainer_replied_at = NOW()
       WHERE id = $2
       RETURNING id, client_id, trainer_feedback, trainer_replied_at`,
      [feedback, checkinId]
    );

    const updated = update.rows[0];
    if (!updated) {
      return NextResponse.json({ message: "Unable to save feedback" }, { status: 500 });
    }

    // Notify client if email exists
    if (process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
      const clientRes = await query<{ email?: string | null; name?: string | null }>(
        `SELECT email, name FROM clients WHERE id = $1 LIMIT 1`,
        [updated.client_id]
      );
      const clientEmail = clientRes.rows[0]?.email;
      const clientName = clientRes.rows[0]?.name || "there";
      if (clientEmail) {
        await resend.emails
          .send({
            from: process.env.FROM_EMAIL,
            to: clientEmail,
            subject: "Your weekly check-in has feedback",
            html: `<p>Hi ${clientName}, your trainer replied to your weekly check-in.</p><p><strong>Feedback:</strong></p><p>${feedback}</p>`,
          })
          .catch((err) => console.error("Failed to send client feedback email", err));
      }
    }

    return NextResponse.json({ ok: true, checkin: { ...existing, trainer_feedback: feedback, trainer_replied_at: updated.trainer_replied_at } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to submit feedback" }, { status: 500 });
  }
}
