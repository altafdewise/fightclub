import crypto from "crypto";
import { query } from "./db";

const SESSION_DAYS = 7;
export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

export type SessionType = "admin" | "client" | "hq";

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function createSessionExpiry() {
  return new Date(Date.now() + SESSION_MAX_AGE * 1000);
}

export async function createSession(params: {
  type: SessionType;
  adminId?: string;
  clientId?: string;
}) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = createSessionExpiry();

  await query(
    `INSERT INTO sessions (session_token, type, admin_id, client_id, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [token, params.type, params.adminId || null, params.clientId || null, expiresAt]
  );

  return { sessionToken: token, expiresAt };
}

export async function deleteSession(token: string) {
  await query("DELETE FROM sessions WHERE session_token = $1", [token]);
}
