import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { fightclubEmailHtml } from "@/lib/fightclub-email";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateBookingId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FCH-S1-${ts}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, name, email, phone, tickets } =
      body || {};

    if (!name || !email || !phone || !razorpay_order_id) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // Verify Razorpay signature for paid orders.
    // Free orders (FC_FREE_* prefix) skip verification — they are server-generated tokens.
    // When enabling paid tiers, remove the free-order bypass below.
    const isFreeOrder = String(razorpay_order_id).startsWith("FC_FREE_");
    if (!isFreeOrder && razorpay_payment_id && razorpay_signature) {
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
      if (expected !== razorpay_signature) {
        return NextResponse.json({ message: "Invalid payment signature." }, { status: 400 });
      }
    }

    const bookingId = generateBookingId();
    const whatsappUrl = process.env.WHATSAPP_INVITE_URL || "#";

    // Send confirmation email — reuses project's existing Resend + FROM_EMAIL setup.
    // FIGHTCLUB_FROM_EMAIL overrides FROM_EMAIL so fight club emails come from a dedicated address.
    const from =
      process.env.FIGHTCLUB_FROM_EMAIL ||
      process.env.FROM_EMAIL ||
      "Fight Club HYD <noreply@brutal.fit>";

    const { error: emailError } = await resend.emails.send({
      from,
      to: [email],
      subject: "You're in. Fight Club Hyderabad — Season One",
      html: fightclubEmailHtml({
        bookingId,
        name,
        tickets: Number(tickets) || 1,
        whatsappUrl,
      }),
    });

    if (emailError) {
      // Log but don't fail — booking is confirmed regardless of email delivery
      console.error("[fightclub/confirm-booking] email error:", emailError);
    }

    console.info("[fightclub/confirm-booking] booked:", { bookingId, name, email, phone, tickets });

    return NextResponse.json({ ok: true, bookingId });
  } catch (error) {
    console.error("[fightclub/confirm-booking]", error);
    return NextResponse.json({ message: "Could not confirm booking." }, { status: 500 });
  }
}
