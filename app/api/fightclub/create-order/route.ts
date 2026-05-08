import { NextResponse } from "next/server";

// Switch to live Razorpay keys (NEXT_PUBLIC_RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET) for production.
// Uncomment the Razorpay block below when adding paid ticket tiers.
//
// import Razorpay from "razorpay";
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,      // test key: rzp_test_...
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tickets = Number(body.tickets) || 1;

    if (tickets < 1 || tickets > 4) {
      return NextResponse.json({ message: "Invalid ticket count." }, { status: 400 });
    }

    // Season One tickets are free — return a direct booking token.
    // Razorpay minimum order amount is ₹1 (100 paise), so we bypass the
    // payment modal for ₹0 and confirm the booking server-side directly.
    // When adding paid tiers, replace this block with a real Razorpay order:
    //
    // const order = await razorpay.orders.create({
    //   amount: tickets * TICKET_PRICE_PAISE,
    //   currency: "INR",
    //   receipt: `fc_hyd_s1_${Date.now()}`,
    //   notes: { event: "Fight Club Hyderabad Season One", tickets: String(tickets) },
    // });
    // return NextResponse.json({ orderId: order.id });

    const orderId = `FC_FREE_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    return NextResponse.json({ free: true, orderId });
  } catch (error) {
    console.error("[fightclub/create-order]", error);
    return NextResponse.json({ message: "Could not create order." }, { status: 500 });
  }
}
