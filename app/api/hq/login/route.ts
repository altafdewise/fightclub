import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSession } from "@/lib/session";

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

    const cookieStore = await cookies();
    cookieStore.set("hq_session", session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to login." }, { status: 500 });
  }
}
