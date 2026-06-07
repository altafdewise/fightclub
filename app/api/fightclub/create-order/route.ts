import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import {
  CHALLENGE,
  COUPON_CODE,
  PRICING,
  RUPEE_COUPON_CODE,
  RUPEE_COUPON_PRICE,
  classifyCoupon,
  computeAmountPaise,
  isChallengeOfferOpen,
  rupeesToPaise,
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

const ENTRY_TYPES: EntryType[] = ["viewer", "boxer", "challenge"];

function isEntryType(value: unknown): value is EntryType {
  return ENTRY_TYPES.includes(value as EntryType);
}

function requiredString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function num(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function hasCompleteChallengePayload(body: Record<string, unknown>): boolean {
  const challenge = asRecord(body.challenge);
  return Boolean(
    body.acknowledgementId &&
      challenge.termsAccepted === true &&
      requiredString(challenge.targetName) &&
      Number(challenge.age) >= 18 &&
      requiredString(challenge.city) &&
      Number(challenge.heightCm) > 0 &&
      Number(challenge.weightKg) > 0 &&
      requiredString(challenge.weightClass) &&
      requiredString(challenge.stance) &&
      requiredString(challenge.experience) &&
      Number(challenge.experienceYears) >= 0 &&
      requiredString(challenge.fightRecord) &&
      requiredString(challenge.trainingGym) &&
      requiredString(challenge.strengths) &&
      requiredString(challenge.injuries) &&
      requiredString(challenge.medicalConditions) &&
      requiredString(challenge.availability) &&
      requiredString(challenge.challengeReason) &&
      requiredString(challenge.emergencyContactName) &&
      requiredString(challenge.emergencyContactPhone) &&
      requiredString(challenge.selfieUrl)
  );
}

// Paste live Razorpay keys (rzp_live_...) into .env.local to go live.
// No code change needed here.

export async function POST(req: Request) {
  try {
    const body = asRecord(await req.json());
    const typeRaw = body.type;

    if (!typeRaw) {
      return NextResponse.json(
        { message: "Choose a paid Fight Club entry type." },
        { status: 400 }
      );
    }

    if (!isEntryType(typeRaw)) {
      return NextResponse.json({ message: "Invalid entry type." }, { status: 400 });
    }

    const type = typeRaw;
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

    if (type === "challenge") {
      if (!isChallengeOfferOpen()) {
        return NextResponse.json(
          { message: `The Purvik challenge offer closed on ${CHALLENGE.deadlineLabel}.` },
          { status: 400 }
        );
      }
      if (!hasCompleteChallengePayload(body)) {
        return NextResponse.json(
          { message: "Complete the challenge form, selfie, and acknowledgement before payment." },
          { status: 400 }
        );
      }
    }

    const submittedCoupon = String(body.couponCode || "").trim();
    if (type === "challenge" && submittedCoupon) {
      return NextResponse.json({ message: "Coupons are not available for the Purvik challenge." }, { status: 400 });
    }

    const couponKind = submittedCoupon ? classifyCoupon(submittedCoupon) : null;
    if (submittedCoupon && !couponKind) {
      return NextResponse.json({ message: "Invalid coupon code." }, { status: 400 });
    }

    // PBC -> full comp: skip Razorpay, record paid at INR 0 (offline cash).
    if (couponKind === "free") {
      const booking = await createComplimentaryBooking({
        type,
        fullName,
        email,
        phone,
        quantity,
        couponCode: COUPON_CODE,
      });

      // Attach boxer extras inline; the comp path skips confirm-booking.
      if (type === "boxer") {
        const boxer = asRecord(body.boxer);
        await createBoxerEntry({
          bookingId: booking.id,
          weightKg: num(boxer.weightKg),
          weightClass: text(boxer.weightClass),
          experience: text(boxer.experience),
          experienceYears: num(boxer.experienceYears),
          selfieUrl: text(boxer.selfieUrl),
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

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { message: "Payments not configured. Set Razorpay keys." },
        { status: 500 }
      );
    }

    // Amount is computed server-side from config. PBC1 overrides regular
    // viewer/boxer pricing to INR 1, but never applies to challenge entries.
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
      receipt: type === "challenge" ? `fc_chal_${Date.now()}` : `fc_s1s2_${Date.now()}`,
      notes: {
        event: "Fight Club S1 Series Two",
        type,
        quantity: String(quantity ?? ""),
        target: type === "challenge" ? CHALLENGE.targetName : "",
      },
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
      keyId: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[fightclub/create-order]", error);
    return NextResponse.json({ message: "Could not create order." }, { status: 500 });
  }
}
