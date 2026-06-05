import { NextResponse } from "next/server";
import { ACKNOWLEDGEMENT_POINTS, POINTS_VERSION } from "@/lib/fightclub/acknowledgement";
import { createAcknowledgement } from "@/lib/fightclub/bookings";

// Stores the boxer's digital acknowledgement BEFORE payment (step 1 of the
// boxer flow). Returns an id the payment step links to the booking once paid.
export async function POST(req: Request) {
  try {
    const { fullName, accepted } = await req.json();

    const name = String(fullName || "").trim();
    // Every point must be ticked — count is validated server-side too.
    const allAccepted =
      Array.isArray(accepted) &&
      accepted.length === ACKNOWLEDGEMENT_POINTS.length &&
      accepted.every(Boolean);

    if (!name || !allAccepted) {
      return NextResponse.json(
        { message: "All points must be accepted and your name typed." },
        { status: 400 }
      );
    }

    const ack = await createAcknowledgement({
      fullName: name,
      allPointsAccepted: true,
      pointsVersion: POINTS_VERSION,
    });

    return NextResponse.json({ acknowledgementId: ack.id, acceptedAt: ack.accepted_at });
  } catch (error) {
    console.error("[fightclub/acknowledge]", error);
    return NextResponse.json({ message: "Could not record acknowledgement." }, { status: 500 });
  }
}
