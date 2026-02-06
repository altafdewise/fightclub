import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, passcode } = await req.json();

    if (!username || !passcode) {
      return NextResponse.json({ message: "Missing credentials." }, { status: 400 });
    }

    if (passcode.length < 4) {
      return NextResponse.json({ message: "Passcode must be at least 4 characters." }, { status: 400 });
    }

    // Check if username already exists
    const existing = await query<{ id: string }>(
      "SELECT id FROM admins WHERE username = $1 LIMIT 1",
      [username]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ message: "Username already exists." }, { status: 400 });
    }

    // Hash the passcode
    const passcodeHash = await bcrypt.hash(passcode, 10);

    // Create the trainer/admin
    const result = await query<{ id: string }>(
      "INSERT INTO admins (username, passcode_hash) VALUES ($1, $2) RETURNING id",
      [username, passcodeHash]
    );

    return NextResponse.json({
      ok: true,
      trainer: {
        id: result.rows[0].id,
        username,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to create trainer." }, { status: 500 });
  }
}
