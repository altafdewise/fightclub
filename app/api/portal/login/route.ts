import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, sessionCookieOptions } from "@/lib/session";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, passcode } = await req.json();

    if (!username || !passcode) {
      return NextResponse.json({ message: "Missing credentials." }, { status: 400 });
    }

    const clientResult = await query<{ id: string; name: string; username: string; passcode_hash: string }>(
      "SELECT id, name, username, passcode_hash FROM clients WHERE username = $1 LIMIT 1",
      [username]
    );
    const client = clientResult.rows[0];
    if (!client) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    const ok = await bcrypt.compare(passcode, client.passcode_hash);
    if (!ok) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    const session = await createSession({ type: "client", clientId: client.id });

    const response = NextResponse.json({ ok: true });
    response.cookies.set("client_session", session.sessionToken, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to login." }, { status: 500 });
  }
}
