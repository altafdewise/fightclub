import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/auth";
import { getClientsWithStats } from "@/lib/admin";
import { query } from "@/lib/db";
import { ensureConversation } from "@/lib/chat";

export async function GET() {
  const session = await getAdminSession();
  if (!session?.admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const clients = await getClientsWithStats(session.admin.id);
  return NextResponse.json({ clients });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session?.admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  try {
    const { name, username, passcode, email, trainerId } = await req.json();

    if (!name || !username || !passcode) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    if (String(passcode).length < 4) {
      return NextResponse.json({ message: "Passcode must be at least 4 characters." }, { status: 400 });
    }

    const existing = await query<{ id: string }>(
      "SELECT id FROM clients WHERE username = $1 LIMIT 1",
      [username]
    );
    if (existing.rows.length) {
      return NextResponse.json({ message: "Username already exists." }, { status: 409 });
    }

    if (trainerId) {
      const trainerExists = await query<{ id: string }>(
        "SELECT id FROM admins WHERE id = $1 LIMIT 1",
        [trainerId]
      );
      if (!trainerExists.rows[0]) {
        return NextResponse.json({ message: "Trainer not found." }, { status: 400 });
      }
    }

    const passcodeHash = await bcrypt.hash(passcode, 10);
    const created = await query<{ id: string; name: string; username: string; email: string | null }>(
      `INSERT INTO clients (name, username, passcode_hash, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, username, email`,
      [name, username, passcodeHash, email || null]
    );

    const clientId = created.rows[0].id;

    if (trainerId) {
      await query(
        `INSERT INTO client_trainer_assignments (client_id, trainer_id)
         VALUES ($1, $2)
         ON CONFLICT (client_id) DO UPDATE SET trainer_id = EXCLUDED.trainer_id`,
        [clientId, trainerId]
      );

      await ensureConversation(clientId, trainerId);
    }

    return NextResponse.json({ ok: true, client: created.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to create client." }, { status: 500 });
  }
}
