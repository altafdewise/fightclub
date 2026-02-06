import { NextResponse } from "next/server";
import { createSession, sessionCookieOptions } from "@/lib/session";

const HQ_PASSCODE = "brutal.fit@hq";

export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();

    if (!passcode) {
      return NextResponse.json({ message: "Passcode required." }, { status: 400 });
    }

    if (passcode !== HQ_PASSCODE) {
      return NextResponse.json({ message: "Invalid passcode." }, { status: 401 });
    }

    const session = await createSession({ type: "hq" });

    const response = NextResponse.json({ ok: true });
    response.cookies.set("hq_session", session.sessionToken, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to login." }, { status: 500 });
  }
}
