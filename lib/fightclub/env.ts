// ════════════════════════════════════════════════════════════════
// Env reconciliation for the Fight Club section.
//
// The project already wires some keys under existing names. To avoid
// duplicate/conflicting secrets, each getter reads the spec-requested
// name FIRST, then falls back to the name already used by brutal.fit.
//
// ⚠️  SWAP WITH LIVE VALUES BEFORE DEPLOY — see .env.local.example.
// ════════════════════════════════════════════════════════════════

function firstDefined(...vals: Array<string | undefined>): string {
  return vals.find((v) => v && v.length > 0) ?? "";
}

// ── Supabase (server, service role — NEVER exposed to the client) ──
export const SUPABASE_URL = firstDefined(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_URL
);
export const SUPABASE_SERVICE_KEY = firstDefined(
  process.env.SUPABASE_SERVICE_ROLE_KEY, // spec name
  process.env.SUPABASE_SERVICE_KEY // existing project name
);

// ── Razorpay ───────────────────────────────────────────────────────
// ⚠️ Paste rzp_live_… keys to go live — no code change needed.
export const RAZORPAY_KEY_ID = firstDefined(
  process.env.RAZORPAY_KEY_ID, // spec name (server)
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID // existing (also client-safe)
);
export const RAZORPAY_KEY_SECRET = firstDefined(process.env.RAZORPAY_KEY_SECRET);

// ── Email (Resend) ─────────────────────────────────────────────────
export const RESEND_API_KEY = firstDefined(process.env.RESEND_API_KEY);
export const SENDER_EMAIL = firstDefined(
  process.env.SENDER_EMAIL, // spec name
  process.env.FIGHTCLUB_FROM_EMAIL, // existing fightclub sender
  process.env.FROM_EMAIL, // existing site sender
  "Fight Club HYD <fightclub@brutal.fit>"
);

// ── WhatsApp broadcast (placeholder for now) ──────────────────────
export const WHATSAPP_INVITE_URL = firstDefined(
  process.env.WHATSAPP_INVITE_URL,
  process.env.NEXT_PUBLIC_WHATSAPP_INVITE_URL,
  "#"
);

// ── Admin dashboard gate ───────────────────────────────────────────
// NOTE: ADMIN_PASSWORD is read lazily inside lib/fightclub/admin-auth.ts
// (via process.env on every call) so edits to .env.local don't get stuck
// behind a stale module-level constant.
