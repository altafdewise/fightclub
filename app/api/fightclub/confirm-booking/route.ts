import { NextResponse } from "next/server";
import crypto from "crypto";
import { RAZORPAY_KEY_SECRET } from "@/lib/fightclub/env";
import {
  getBookingByOrderId,
  markBookingPaid,
  createBoxerEntry,
  linkAcknowledgementToBooking,
  type BookingRow,
} from "@/lib/fightclub/bookings";
import { sendTicketEmail } from "@/lib/fightclub/notify";

function legacyBookingId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FCH-S1-${ts}-${rand}`;
}

function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // Series Two extras:
      boxer,
      acknowledgementId,
      // Legacy fields:
      name,
      email,
      tickets,
    } = body || {};

    if (!razorpay_order_id) {
      return NextResponse.json({ message: "Missing order id." }, { status: 400 });
    }

    // ── Legacy free flow (FC_FREE_* tokens) ────────────────────────
    if (String(razorpay_order_id).startsWith("FC_FREE_")) {
      if (!name || !email) {
        return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
      }
      const bookingId = legacyBookingId();
      // Build a synthetic booking row for the email helper.
      const synthetic: BookingRow = {
        id: bookingId,
        type: "viewer",
        full_name: String(name),
        email: String(email),
        phone: "",
        quantity: Number(tickets) || 1,
        amount: 0,
        currency: "INR",
        razorpay_order_id: null,
        razorpay_payment_id: null,
        coupon_code: null,
        status: "paid",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await sendTicketEmail(synthetic);
      return NextResponse.json({ ok: true, bookingId, type: "viewer" });
    }

    // ── Series Two paid flow ───────────────────────────────────────
    if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ message: "Invalid payment signature." }, { status: 400 });
    }

    const existing = await getBookingByOrderId(razorpay_order_id);
    if (!existing) {
      return NextResponse.json({ message: "Unknown order." }, { status: 404 });
    }

    const booking = await markBookingPaid(razorpay_order_id, razorpay_payment_id);

    if (booking.type === "boxer") {
      await createBoxerEntry({
        bookingId: booking.id,
        weightKg: boxer?.weightKg != null ? Number(boxer.weightKg) : null,
        weightClass: boxer?.weightClass ?? null,
        experience: boxer?.experience ?? null,
        experienceYears: boxer?.experienceYears != null ? Number(boxer.experienceYears) : null,
        selfieUrl: boxer?.selfieUrl ?? null,
      });
      if (acknowledgementId) {
        await linkAcknowledgementToBooking(acknowledgementId, booking.id);
      }
    }

    await sendTicketEmail(booking);

    return NextResponse.json({ ok: true, bookingId: booking.id, type: booking.type });
  } catch (error) {
    console.error("[fightclub/confirm-booking]", error);
    return NextResponse.json({ message: "Could not confirm booking." }, { status: 500 });
  }
}
