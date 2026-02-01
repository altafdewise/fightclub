# BRUTAL (www.brutal.fit)

Minimal, premium dark Next.js site for online coaching across timezones.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Nodemailer route handler for form delivery
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
```
- Get `RESEND_API_KEY` from your Resend dashboard.
- `FROM_EMAIL` must be a verified domain/sender in Resend.
- `TO_EMAIL` is the destination inbox (defaults to the address above).

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
