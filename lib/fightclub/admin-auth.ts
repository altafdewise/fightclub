import crypto from "crypto";
import { cookies } from "next/headers";

// Simple, isolated password gate for /fightclub/admin. Kept separate
// from the main app's sessions table — this is a single shared operator
// password, not a per-user login.
//
// The cookie stores an HMAC of a fixed marker keyed by ADMIN_PASSWORD.
// Without the password the cookie can't be forged, and the password
// itself is never sent to or stored on the client.

const COOKIE_NAME = "fc_admin";
const MARKER = "fightclub-admin-v1";
const MAX_AGE = 60 * 60 * 8; // 8 hours

// Read the password lazily on every call so edits to .env.local pick up
// without juggling stale module-level constants. Trim trailing whitespace
// in case the .env line has an accidental space or quote.
function adminPassword(): string {
  return (process.env.ADMIN_PASSWORD ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function expectedToken(): string {
  // The password also salts the HMAC, so an empty password yields a token
  // that the timing-safe check below will still gate correctly.
  return crypto.createHmac("sha256", adminPassword() || "unset").update(MARKER).digest("hex");
}

export function verifyPassword(input: string): boolean {
  const expected = adminPassword();
  if (!expected) {
    // Refuse to authenticate (and log loudly) when the env var is missing
    // — this is the single most common cause of unexpected 401s here.
    console.error(
      "[fightclub/admin] ADMIN_PASSWORD is not set on the server. " +
        "Add it to .env.local and RESTART `npm run dev` — Next.js does not hot-reload server env vars."
    );
    return false;
  }
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function setAdminCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // Must be "/" so the cookie is sent to BOTH the page (/fightclub/admin)
    // and the API routes (/api/fightclub/admin/*). A narrower path like
    // "/fightclub/admin" would not match "/api/fightclub/admin/data".
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function isAdminAuthed(): Promise<boolean> {
  if (!adminPassword()) return false;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const expected = expectedToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
