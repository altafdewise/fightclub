import { NextResponse } from "next/server";
import crypto from "crypto";
import { BOOKINGS_OPEN, SOLD_OUT_MESSAGE } from "@/lib/fightclub/config";
import { RAZORPAY_KEY_SECRET } from "@/lib/fightclub/env";
import {
  createBoxerEntry,
  createChallengeEntry,
  getBookingByOrderId,
  linkAcknowledgementToBooking,
  markBookingPaid,
} from "@/lib/fightclub/bookings";
import { sendTicketEmail } from "@/lib/fightclub/notify";

function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!RAZORPAY_KEY_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature || "");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function num(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function hasChallengeDetails(challenge: Record<string, unknown>, acknowledgementId: unknown): boolean {
  return Boolean(
    text(acknowledgementId) &&
      challenge.termsAccepted === true &&
      text(challenge.targetName) &&
      (num(challenge.age) ?? 0) >= 18 &&
      text(challenge.city) &&
      (num(challenge.heightCm) ?? 0) > 0 &&
      (num(challenge.weightKg) ?? 0) > 0 &&
      text(challenge.weightClass) &&
      text(challenge.stance) &&
      text(challenge.experience) &&
      num(challenge.experienceYears) !== null &&
      text(challenge.fightRecord) &&
      text(challenge.trainingGym) &&
      text(challenge.strengths) &&
      text(challenge.injuries) &&
      text(challenge.medicalConditions) &&
      text(challenge.availability) &&
      text(challenge.challengeReason) &&
      text(challenge.emergencyContactName) &&
      text(challenge.emergencyContactPhone) &&
      text(challenge.selfieUrl)
  );
}

export async function POST(req: Request) {
  try {
    if (!BOOKINGS_OPEN) {
      return NextResponse.json({ message: SOLD_OUT_MESSAGE, soldOut: true }, { status: 403 });
    }

    const body = asRecord(await req.json());
    const razorpayOrderId = text(body.razorpay_order_id);
    const razorpayPaymentId = text(body.razorpay_payment_id);
    const razorpaySignature = text(body.razorpay_signature);
    const boxer = asRecord(body.boxer);
    const challenge = asRecord(body.challenge);
    const acknowledgementId = text(body.acknowledgementId);

    if (!razorpayOrderId) {
      return NextResponse.json({ message: "Missing order id." }, { status: 400 });
    }

    if (razorpayOrderId.startsWith("FC_FREE_")) {
      return NextResponse.json({ message: "Free Fight Club bookings are disabled." }, { status: 400 });
    }

    if (!razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ message: "Missing payment details." }, { status: 400 });
    }

    if (!verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      return NextResponse.json({ message: "Invalid payment signature." }, { status: 400 });
    }

    const existing = await getBookingByOrderId(razorpayOrderId);
    if (!existing) {
      return NextResponse.json({ message: "Unknown order." }, { status: 404 });
    }

    if (existing.type === "challenge" && !hasChallengeDetails(challenge, acknowledgementId)) {
      return NextResponse.json(
        { message: "Challenge details are incomplete. Contact support with your payment ID." },
        { status: 400 }
      );
    }

    const booking = await markBookingPaid(razorpayOrderId, razorpayPaymentId);

    if (booking.type === "boxer") {
      await createBoxerEntry({
        bookingId: booking.id,
        weightKg: boxer.weightKg != null ? Number(boxer.weightKg) : null,
        weightClass: text(boxer.weightClass),
        experience: text(boxer.experience),
        experienceYears: boxer.experienceYears != null ? Number(boxer.experienceYears) : null,
        selfieUrl: text(boxer.selfieUrl),
      });
      if (acknowledgementId) {
        await linkAcknowledgementToBooking(acknowledgementId, booking.id);
      }
    }

    if (booking.type === "challenge") {
      await createChallengeEntry({
        bookingId: booking.id,
        targetName: text(challenge.targetName) ?? "Purvik",
        age: num(challenge.age),
        city: text(challenge.city),
        instagram: text(challenge.instagram),
        heightCm: num(challenge.heightCm),
        weightKg: num(challenge.weightKg),
        weightClass: text(challenge.weightClass),
        stance: text(challenge.stance),
        experience: text(challenge.experience),
        experienceYears: num(challenge.experienceYears),
        fightRecord: text(challenge.fightRecord),
        trainingGym: text(challenge.trainingGym),
        coachName: text(challenge.coachName),
        strengths: text(challenge.strengths),
        injuries: text(challenge.injuries),
        medicalConditions: text(challenge.medicalConditions),
        availability: text(challenge.availability),
        challengeReason: text(challenge.challengeReason),
        emergencyContactName: text(challenge.emergencyContactName),
        emergencyContactPhone: text(challenge.emergencyContactPhone),
        selfieUrl: text(challenge.selfieUrl),
        termsAccepted: challenge.termsAccepted === true,
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
