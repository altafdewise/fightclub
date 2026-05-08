# Fight Club Hyderabad — Season One

Setup guide for the `/fightclub` section of brutal.fit.

---

## Routes

| Route | Description |
|-------|-------------|
| `/fightclub` | Landing page — hero, rules, fighters section, footer |
| `/fightclub/book` | Booking form — name, email, phone, ticket count |
| `/fightclub/success` | Post-booking success screen with WhatsApp CTA |
| `/api/fightclub/create-order` | POST — creates a booking token (free flow) or Razorpay order (paid flow) |
| `/api/fightclub/confirm-booking` | POST — confirms booking, generates booking ID, sends email via Resend |

---

## Environment variables

Add to `.env.local`. All existing keys are preserved.

```env
# Razorpay — test keys (rzp_test_...). Switch to rzp_live_ for production.
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_REPLACE_ME
RAZORPAY_KEY_SECRET=REPLACE_ME

# Resend sender for fight club emails. Falls back to FROM_EMAIL if blank.
FIGHTCLUB_FROM_EMAIL=Fight Club HYD <fightclub@brutal.fit>

# WhatsApp broadcast invite link.
NEXT_PUBLIC_WHATSAPP_INVITE_URL=https://chat.whatsapp.com/REPLACE_ME
WHATSAPP_INVITE_URL=https://chat.whatsapp.com/REPLACE_ME
```

`RESEND_API_KEY` is already present in the project — no change needed.

---

## Email

Sent from `confirm-booking` via the project's existing Resend instance.

- **Subject**: "You're in. Fight Club Hyderabad — Season One"
- **From**: `FIGHTCLUB_FROM_EMAIL` → `FROM_EMAIL` → hardcoded fallback
- **Template**: `lib/fightclub-email.ts` — pure function, dark HTML email

To test email delivery locally, set `RESEND_API_KEY` in `.env.local` and use a real recipient address. Resend's free tier works fine for this.

---

## Booking flow (current — free tickets)

```
User fills form
  → POST /api/fightclub/create-order  →  returns { free: true, orderId: "FC_FREE_..." }
  → Client detects free: true, skips Razorpay modal
  → POST /api/fightclub/confirm-booking  →  generates booking ID, sends email
  → Redirect to /fightclub/success?bookingId=...
```

Razorpay is **not** called for ₹0 tickets. Razorpay's API requires a minimum of ₹1 (100 paise) for INR orders.

---

## Switching to paid tiers

When you're ready to charge for tickets:

1. **`app/api/fightclub/create-order/route.ts`** — uncomment the Razorpay block and set `TICKET_PRICE_PAISE`.
2. **`.env.local`** — replace `rzp_test_` keys with `rzp_live_` keys from the Razorpay dashboard.
3. **`app/fightclub/book/page.tsx`** — the `openRazorpay()` function is already wired; the `free` branch in `handleSubmit` will be skipped automatically since `create-order` will return `{ orderId }` without `free: true`.

No other changes needed.

---

## Fonts

Loaded via `next/font/google` in `app/fightclub/layout.tsx`:
- **Bebas Neue** → CSS variable `--fc-bebas` (headlines)
- **Barlow Condensed** → CSS variable `--fc-barlow` (body)

These are scoped to the `/fightclub` route group and don't affect the rest of the site.

---

## Isolation

The `/fightclub` layout is a nested layout inside the root layout. The root layout's `BackgroundLightLines` and `WebsiteAssistant` still render, but they appear behind the fightclub content (which has a solid `#0a0a0a` background covering the decorative lines).

To completely suppress `WebsiteAssistant` on fightclub pages, modify `app/layout.tsx` to conditionally render it using `usePathname()` — this requires converting the root layout to a client component, so it's left as an opt-in change.
