# Fight Club — Season One, Series Two

Ticketing + registration for the `/fightclub` section of brutal.fit. Darker,
paid chapter built on Supabase + Razorpay + Resend.

All event details and pricing live in **`lib/fightclub/config.ts`** — edit there.

---

## Routes

| Route | Description |
|-------|-------------|
| `/fightclub` | Series Two landing — hero, "the crowd decides" hook, rules strip, gallery, GET IN |
| `/fightclub/enter` | Two-door gate: WATCH (₹199) vs FIGHT (₹349) |
| `/fightclub/watch` | Viewer flow — form → Razorpay (UPI) → email → success |
| `/fightclub/fight` | Boxer flow — acknowledge → details → selfie → pay (strict order) |
| `/fightclub/challenge` | Premium Purvik challenge — acknowledge → detailed form → selfie → Razorpay |
| `/fightclub/success` | Post-payment screen + WhatsApp broadcast CTA |
| `/fightclub/admin` | Password-gated operations dashboard |
| `/fightclub/book`, `/fightclub/rules` | Legacy URLs now redirect to `/fightclub/enter` |

### API
| Endpoint | Purpose |
|----------|---------|
| `POST /api/fightclub/create-order` | Server-computes amount, creates Razorpay order + pending booking. Requires a paid `type`. |
| `POST /api/fightclub/confirm-booking` | Verifies Razorpay signature → marks paid → links boxer/ack → emails ticket |
| `POST /api/fightclub/mark-failed` | Records abandoned/failed attempts for admin |
| `POST /api/fightclub/acknowledge` | Stores boxer acknowledgement before payment |
| `POST /api/fightclub/upload-selfie` | Uploads selfie to the private `boxer-selfies` bucket (service role) |
| `POST /api/fightclub/admin/login` | Checks `ADMIN_PASSWORD`, sets httpOnly cookie |
| `GET /api/fightclub/admin/data` | Gated aggregates + lists (+ signed selfie URLs) |
| `GET /api/fightclub/admin/export?type=boxers\|viewers\|challenges` | Gated CSV gate-list |

---

## Setup

1. **Supabase** — open the SQL editor and run **`supabase.fightclub.sql`** (repo root).
   It creates `fc_bookings`, `fc_boxer_entries`, `fc_acknowledgements`, and the
   private `boxer-selfies` storage bucket. Safe to re-run.
2. **Storage** — confirm the `boxer-selfies` bucket is **Private** (the SQL sets this).
3. **Env** — copy keys from `.env.local.example` into `.env.local` and fill them in
   (see table below). Each is commented with where to swap the live value.
4. **Install & run** — `npm install` (nothing new to add), then `npm run dev`.
5. **Admin** — open `/fightclub/admin`, enter `ADMIN_PASSWORD`.

### Going live
KYC is already done. Paste your **live** Razorpay keys (`rzp_live_…`) into
`NEXT_PUBLIC_RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` and deploy — **no code change**.

---

## Env keys

| Key | Notes |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | already used by the site |
| `SUPABASE_SERVICE_ROLE_KEY` | server only (falls back to `SUPABASE_SERVICE_KEY`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | client checkout key |
| `RAZORPAY_KEY_ID` | server (alias; falls back to `NEXT_PUBLIC_RAZORPAY_KEY_ID`) |
| `RAZORPAY_KEY_SECRET` | server-only secret; used for signature verification |
| `RESEND_API_KEY` | already present |
| `SENDER_EMAIL` | ticket sender (falls back to `FIGHTCLUB_FROM_EMAIL` → `FROM_EMAIL`) |
| `WHATSAPP_INVITE_URL`, `NEXT_PUBLIC_WHATSAPP_INVITE_URL` | broadcast redirect (placeholder for now) |
| `ADMIN_PASSWORD` | **new** — gates `/fightclub/admin` |

---

## Money & security

- **All amounts are computed server-side** from `lib/fightclub/config.ts`
  (`computeAmountPaise`). The client never sends a price.
- The **Razorpay signature is verified server-side** before any booking is marked `paid`.
- The **service-role key is used only in server routes** (`lib/fightclub/supabase.ts`)
  and never imported into client components.
- Selfies live in a **private** bucket; admin reads them via short-lived signed URLs.

---

## Schema

- **`fc_bookings`** — one row per purchase: `type` (viewer|boxer|challenge), name/email/phone,
  `quantity` (viewers), `amount` (paise), `razorpay_order_id`/`payment_id`,
  `status` (pending|paid|failed), timestamps.
- **`fc_boxer_entries`** — 1:1 with a boxer booking: weight, experience, years, `selfie_url`.
- **`fc_challenge_entries`** — 1:1 with a challenge booking: Purvik target, detailed fight profile, safety notes, emergency contact, `selfie_url`.
- **`fc_acknowledgements`** — name, `all_points_accepted`, `accepted_at`, `points_version`,
  `booking_id` (linked once paid). Acknowledgement text lives in
  `lib/fightclub/acknowledgement.ts`; bump `POINTS_VERSION` if you change it.
- Tables are `fc_`-prefixed to avoid any clash with the existing trainer schema in `supabase.sql`.

---

## Styling

Series Two styling is scoped to the `.fc2` wrapper in `app/fightclub/layout.tsx`.
Tokens + classes (`.btn-blood`, `.fc-card`, `.fc-bg`, `.fc-display`, …) are appended
to `app/globals.css` under that scope — the main brutal.fit site is untouched.

## Photos

Drop real Season 1 photos into `public/fightclub/` and swap the placeholder tiles in
`app/fightclub/page.tsx` (search for `TODO`). Until then the gallery renders styled voids.
