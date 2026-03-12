# BRUTAL (www.brutal.fit)

Minimal, premium dark Next.js site for online coaching across timezones.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Resend for lead and notification email
- PostgreSQL / Supabase Postgres for app data
- lucide-react icons

## Getting Started
1) Install dependencies
```bash
npm install
```
2) Create `.env.local` in the project root:
```
RESEND_API_KEY=
FROM_EMAIL=BRUTAL <onboarding@resend.dev>
TO_EMAIL=altafdewise@gmail.com
NEXT_PUBLIC_WHATSAPP_NUMBER=+91XXXXXXXXXX
DATABASE_URL=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_1M=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3M=
NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6M=
NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK_1M=
NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK_3M=
NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK_6M=
```
- Get `RESEND_API_KEY` from your Resend dashboard.
- `FROM_EMAIL` must be a verified domain/sender in Resend.
- `TO_EMAIL` is the destination inbox (defaults to the address above).
- `DATABASE_URL` must point to the Postgres instance used by the app.
- The `NEXT_PUBLIC_*_PAYMENT_LINK_*` values should point to the hosted Stripe and Razorpay checkout URLs for each plan.

3) Run dev server
```bash
npm run dev
```
Visit http://localhost:3000.

## Form flow (/get-started)
- Client-side validation for required fields + email format.
- POST to `/api/lead` which sends mail via Resend using `.env.local` keys.
- On success, user sees success message then is redirected to WhatsApp using `NEXT_PUBLIC_WHATSAPP_NUMBER` with a prefilled message (name + goal + timezone).
- If Resend is not configured or sending fails, the API returns a graceful error.

## Pricing flow
- The homepage pricing section gates pricing behind a required lead form.
- Lead submissions POST to `/api/pricing-leads`, are stored in `pricing_leads`, and notify the admin inbox.
- Currency defaults to USD. India routes to INR and Razorpay; international routes to USD and Stripe.
- Hosted payment links are controlled by the environment variables listed above.

## Deployment notes
- Works on Vercel/Netlify; ensure env vars above are set in the hosting platform.
- If using Vercel, set `RESEND_API_KEY`/`FROM_EMAIL`/`TO_EMAIL`/`NEXT_PUBLIC_WHATSAPP_NUMBER` in Environment Variables.
- Tailwind is configured with CSS variables in `app/globals.css` for theme control.

## Design system
- Dark gradient background, glass panels via `.glass` utility.
- Colors are defined as CSS variables (`--bg`, `--panel`, `--panelBorder`, `--text`, `--muted`, `--accent`, `--accentSoft`).
- Subtle crimson accent for highlights, underlines, focus states.
- IntersectionObserver-based `Reveal` component for on-scroll fades.
- Continuous testimonials marquee using CSS animation.

## Scripts
- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - start prod server
- `npm run lint` - lint

## Customization
- Update copy/links in components under `components/`.
- Change accent colors or background via CSS variables in `app/globals.css`.
- Swap testimonials/content in `components/TestimonialsMarquee.tsx`.
