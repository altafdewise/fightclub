import { NextResponse } from "next/server";
import { createRefundRequest } from "@/lib/fightclub/bookings";

// Public endpoint. People reach the refund form only via a private link
// the organiser shares directly, then submit their UPI + details here.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = body.type === "boxer" ? "boxer" : body.type === "viewer" ? "viewer" : null;
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const upiId = String(body.upiId || "").trim();
    const reason = String(body.reason || "").trim();
    const bookingId = String(body.bookingId || "").trim() || null;
    const amountInr =
      body.amountInr != null && String(body.amountInr).trim() !== ""
        ? Math.max(0, Math.round(Number(body.amountInr)))
        : null;

    if (!type) {
      return NextResponse.json({ message: "Invalid request type." }, { status: 400 });
    }
    if (!fullName || !email || !phone || !upiId || !reason) {
      return NextResponse.json({ message: "Please fill all required fields." }, { status: 400 });
    }
    if (!/.+@.+\..+/.test(email)) {
      return NextResponse.json({ message: "Enter a valid email." }, { status: 400 });
    }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) {
      return NextResponse.json({ message: "Enter a valid 10-digit Indian mobile." }, { status: 400 });
    }
    if (!/^[\w.\-]{2,}@[\w.\-]{2,}$/.test(upiId)) {
      return NextResponse.json({ message: "Enter a valid UPI ID (e.g. name@bank)." }, { status: 400 });
    }

    const row = await createRefundRequest({
      type,
      fullName,
      email,
      phone,
      bookingId,
      upiId,
      amountInr,
      reason,
    });

    return NextResponse.json({ ok: true, id: row.id });
  } catch (error) {
    console.error("[fightclub/refund]", error);
    return NextResponse.json({ message: "Could not submit request." }, { status: 500 });
  }
}
