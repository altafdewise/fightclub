import { Resend } from "resend";
import { fightclubEmailHtml } from "@/lib/fightclub-email";
import { RESEND_API_KEY, SENDER_EMAIL, WHATSAPP_INVITE_URL } from "./env";
import type { BookingRow } from "./bookings";

// Shared ticket-email sender, used by both the Razorpay confirm flow and
// the coupon comp-booking flow. Best-effort — email failures are logged
// but never block the booking.
export async function sendTicketEmail(booking: BookingRow): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("[fightclub/notify] RESEND_API_KEY not set — skipping ticket email.");
    return;
  }
  try {
    const resend = new Resend(RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [booking.email],
      subject:
        booking.type === "challenge"
          ? "Challenge locked - Fight Club, Season One Series Two"
          : "You're in - Fight Club, Season One Series Two",
      html: fightclubEmailHtml({
        bookingId: booking.id,
        name: booking.full_name,
        type: booking.type,
        quantity: booking.quantity ?? 1,
        whatsappUrl: WHATSAPP_INVITE_URL,
      }),
    });
    if (error) console.error("[fightclub/notify] email error:", error);
  } catch (err) {
    console.error("[fightclub/notify] email throw:", err);
  }
}
