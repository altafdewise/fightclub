import { NextResponse } from "next/server";
import { verifyPassword, setAdminCookie } from "@/lib/fightclub/admin-auth";

// Checks the submitted password against ADMIN_PASSWORD server-side and sets
// an httpOnly cookie. The password is never returned to or stored on the client.
export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const input = String(password || "");

    if (!verifyPassword(input)) {
      return NextResponse.json({ message: "Wrong password." }, { status: 401 });
    }
    await setAdminCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[fightclub/admin/login]", error);
    return NextResponse.json({ message: "Login failed." }, { status: 500 });
  }
}
