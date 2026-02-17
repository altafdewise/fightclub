import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";
import { deleteSession, SessionType } from "./session";

const COOKIE_NAMES = {
  admin: "admin_session",
  client: "client_session",
  hq: "hq_session",
};

type AdminRow = { id: string; username: string };
type ClientRow = { id: string; name: string; username: string; email?: string | null };

async function validateSession(sessionToken: string, type: SessionType) {
  const session = await query<{
    session_token: string;
    type: SessionType;
    admin_id: string | null;
    client_id: string | null;
    expires_at: Date;
  }>(
    `SELECT session_token, type, admin_id, client_id, expires_at
     FROM sessions
     WHERE session_token = $1 AND type = $2
     LIMIT 1`,
    [sessionToken, type]
  );

  const row = session.rows[0];
  if (!row) return null;

  if (new Date(row.expires_at) < new Date()) {
    await deleteSession(sessionToken);
    return null;
  }

  if (type === "admin") {
    const admin = await query<AdminRow>(
      "SELECT id, username FROM admins WHERE id = $1 LIMIT 1",
      [row.admin_id]
    );
    return { admin: admin.rows[0] || null };
  }

  if (type === "hq") {
    return { hq: true };
  }

  const client = await query<ClientRow>(
    "SELECT id, name, username FROM clients WHERE id = $1 LIMIT 1",
    [row.client_id]
  );
  return { client: client.rows[0] || null };
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session?.admin) redirect("/admin/login");
  return session.admin;
}

export async function requireClient() {
  const session = await getClientSession();
  if (!session?.client) redirect("/portal/login");
  return session.client;
}

export async function requireHQ() {
  const session = await getHQSession();
  if (!session?.hq) redirect("/hq/login");
  return true;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.admin)?.value;
  if (!token) return null;
  return validateSession(token, "admin");
}

export async function getClientSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.client)?.value;
  if (!token) return null;
  return validateSession(token, "client");
}

export async function getHQSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.hq)?.value;
  if (!token) return null;
  return validateSession(token, "hq");
}
