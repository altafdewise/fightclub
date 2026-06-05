import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import {
  classifyCoupon,
  computeAmountPaise,
  COUPON_CODE,
  RUPEE_COUPON_CODE,
  RUPEE_COUPON_PRICE,
  rupeesToPaise,
  PRICING,
  type EntryType,
} from "@/lib/fightclub/config";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "@/lib/fightclub/env";
import {
  createBoxerEntry,
  createComplimentaryBooking,
  createPendingBooking,
  linkAcknowledgementToBooking,
} from "@/lib/fightclub/bookings";
import { sendTicketEmail } from "@/lib/fightclub/notify";

// ⚠️ Paste live Razorpay keys (rzp_live_…) into .env.local to go live —
// no code change needed here.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = body.type as EntryType | undefined;

    // ── Legacy Season One free-ticket flow (book/ page) ────────────
    // Kept for backward compatibility. Triggered when no `type` is sent.
    if (type !== "viewer" && type !== "boxer") {
      const tickets = Number(body.tickets) || 1;
      if (tickets < 1 || tickets > 4) {
        return NextResponse.json({ message: "Invalid ticket count." }, { status: 400 });
      }
      const orderId = `FC_FREE_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      return NextResponse.json({ free: true, orderId });
    }

    // ── Series Two paid flow (viewer / boxer) ──────────────────────
    const fullName = String(body.fullName || body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const quantity =
      type === "viewer"
        ? Math.min(Math.max(Number(body.quantity) || 1, 1), PRICING.viewer.maxQty)
        : null;

    if (!fullName || !email || !phone) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // ── Coupon handling (validated server-side — the client never
    //    decides the price) ────────────────────────────────────────
    const submittedCoupon = String(body.couponCode || "").trim();
    const couponKind = submittedCoupon ? classifyCoupon(submittedCoupon) : null;
    if (submittedCoupon && !couponKind) {
      return NextResponse.json({ message: "Invalid coupon code." }, { status: 400 });
    }

    // PBC → full comp: skip Razorpay, record paid at ₹0 (offline cash).
    if (couponKind === "free") {
      const booking = await createComplimentaryBooking({
        type,
        fullName,
        email,
        phone,
        quantity,
        couponCode: COUPON_CODE,
      });

      // Attach boxer extras inline (the paid path does this in confirm-booking,
      // but the comp path skips that step entirely).
      if (type === "boxer") {
        const boxer = body.boxer || {};
        await createBoxerEntry({
          bookingId: booking.id,
          weightKg: boxer.weightKg != null ? Number(boxer.weightKg) : null,
          experience: boxer.experience ?? null,
          experienceYears: boxer.experienceYears != null ? Number(boxer.experienceYears) : null,
          selfieUrl: boxer.selfieUrl ?? null,
        });
        if (body.acknowledgementId) {
          await linkAcknowledgementToBooking(String(body.acknowledgementId), booking.id);
        }
      }

      await sendTicketEmail(booking);

      return NextResponse.json({
        free: true,
        bookingId: booking.id,
        type: booking.type,
      });
    }

    // ── Razorpay path (regular price, or PBC1 → ₹1) ────────────────
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { message: "Payments not configured. Set Razorpay keys." },
        { status: 500 }
      );
    }

    // Amount is computed server-side from config. PBC1 overrides it to ₹1.
    const amount =
      couponKind === "rupee"
        ? rupeesToPaise(RUPEE_COUPON_PRICE)
        : computeAmountPaise(type, quantity ?? 1);
    const couponToStore = couponKind === "rupee" ? RUPEE_COUPON_CODE : null;

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `fc_s1s2_${Date.now()}`,
      notes: { event: "Fight Club S1 Series Two", type, quantity: String(quantity ?? "") },
    });

    // Record the attempt as pending up front so abandonment is visible in admin.
    await createPendingBooking({
      type,
      fullName,
      email,
      phone,
      quantity,
      amount,
      razorpayOrderId: order.id,
      couponCode: couponToStore,
    });

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: RAZORPAY_KEY_ID, // public checkout key
    });
  } catch (error) {
    console.error("[fightclub/create-order]", error);
    return NextResponse.json({ message: "Could not create order." }, { status: 500 });
  }
}
