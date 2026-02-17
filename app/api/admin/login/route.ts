import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createSession } from "@/lib/session";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, passcode } = await req.json();

    if (!username || !passcode) {
      return NextResponse.json({ message: "Missing credentials." }, { status: 400 });
    }

    const adminResult = await query<{ id: string; username: string; passcode_hash: string }>(
      "SELECT id, username, passcode_hash FROM admins WHERE username = $1 LIMIT 1",
      [username]
    );
    const admin = adminResult.rows[0];
    if (!admin) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    const ok = await bcrypt.compare(passcode, admin.passcode_hash);
    if (!ok) {
      return NextResponse.json({ message: "Invalid credentials." }, { status: 401 });
    }

    const session = await createSession({ type: "admin", adminId: admin.id });

    const cookieStore = await cookies();
    cookieStore.set("admin_session", session.sessionToken, {
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
