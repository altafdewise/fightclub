import { NextResponse } from "next/server";
import { markBookingFailed } from "@/lib/fightclub/bookings";

// Records an abandoned / failed payment attempt so it surfaces in admin.
// Called from the client when the Razorpay modal is dismissed or errors.
export async function POST(req: Request) {
  try {
    const { razorpay_order_id } = await req.json();
    if (!razorpay_order_id || String(razorpay_order_id).startsWith("FC_FREE_")) {
      // Nothing persisted for legacy free tokens — ignore quietly.
      return NextResponse.json({ ok: true });
    }
    await markBookingFailed(String(razorpay_order_id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[fightclub/mark-failed]", error);
    // Best-effort — never block the user's UI on this.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
