import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/fightclub/admin-auth";
import { setRefundStatus } from "@/lib/fightclub/bookings";

// Gated: lets the organiser flip a refund request between pending/refunded
// after they've sent the money via UPI.
export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }
  try {
    const { id, status } = await req.json();
    if (!id || (status !== "pending" && status !== "refunded")) {
      return NextResponse.json({ message: "Invalid request." }, { status: 400 });
    }
    await setRefundStatus(String(id), status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[fightclub/admin/refund-status]", error);
    return NextResponse.json({ message: "Could not update." }, { status: 500 });
  }
}
