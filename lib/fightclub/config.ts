// ════════════════════════════════════════════════════════════════
// FIGHT CLUB — SEASON ONE, SERIES TWO
// Single edit-point for all event details + pricing.
// Change anything here and it updates across the site + emails.
// ════════════════════════════════════════════════════════════════

export const FIGHTCLUB = {
  title: "FIGHT CLUB",
  season: "Season One · Series Two",
  tagline: "No rules. Just fists.",

  date: "Sunday, 14th June",
  time: "5:00 PM onwards",
  // Placeholder address line — edit freely.
  venue: "6th Floor Brutal Fight Club, Saroornagar, 6 Mall, Near Chaitanyapuri Metro, Hyderabad",

  format: "3 rounds, 3 minutes each",
  // The hook: the audience decides the winner.
  crowdLine: "NO JUDGES. NO SCORECARDS. THE CROWD DECIDES.",
  prizeLine:
    "Surprise prize for the most entertaining fighter of the night. Rage hard enough and you walk away with it.",
} as const;

// ── Reigning Champion / Fighter of the Night ─────────────────────
// The headline section of the site. Update this after every event —
// the winner's photo and name go here, and that IS the reason people
// show up to fight.
//
// To set a champion:
//   1. Drop their photo in  public/fightclub/champion.jpg  (portrait,
//      ideally 4:5, shot tight on the face/torso, dark background).
//   2. Fill in `name`, `wonOn`, and optionally `record` / `quote`.
//   3. Set `photo` to the path you used.
//
// Leave `name` empty to show the premium "THE THRONE IS EMPTY" state
// (perfect before the first Series Two crowning).
export const CHAMPION: {
  name: string;
  photo: string; // path under /public, e.g. "/fightclub/champion.jpg"
  wonOn: string; // e.g. "Series One · 8th June"
  record: string; // e.g. "3 bouts · 3 stoppages" (optional, "" to hide)
  quote: string; // short line in their voice (optional, "" to hide)
} = {
  name: "", // left blank on purpose — nothing shows over the photo
  photo: "/fightclub/champion.jpeg",
  wonOn: "", // optional — e.g. "Series One · 8th June"
  record: "", // optional — e.g. "3 bouts · 3 stoppages"
  quote: "", // optional — a short line in their voice
};

// ── Gallery (Series One hype photos) ─────────────────────────────
// Drop photos in  public/fightclub/  and list their paths here. They
// render in order on the landing page. Leave the array empty to show
// styled placeholders instead. Any number of photos works.
export const GALLERY: string[] = [
  "/fightclub/s1-01.jpeg",
  "/fightclub/s1-02.jpeg",
  "/fightclub/s1-03.jpeg",
  "/fightclub/s1-04.jpeg",
];

// ── Pricing (rupees) ──────────────────────────────────────────────
// Amounts are converted to paise server-side; the client never sets price.
export const PRICING = {
  viewer: { label: "Viewer", price: 199, maxQty: 4 },
  boxer: { label: "Boxer", price: 349, maxQty: 1 },
} as const;

export type EntryType = "viewer" | "boxer";

export const rupeesToPaise = (rupees: number) => Math.round(rupees * 100);

/** Server-authoritative amount in paise. Never trust a client-sent amount. */
export function computeAmountPaise(type: EntryType, quantity = 1): number {
  if (type === "viewer") {
    const qty = Math.min(Math.max(quantity, 1), PRICING.viewer.maxQty);
    return rupeesToPaise(PRICING.viewer.price * qty);
  }
  return rupeesToPaise(PRICING.boxer.price);
}

export const EXPERIENCE_OPTIONS = [
  "First-timer",
  "Some training",
  "Amateur",
  "Pro",
] as const;

// ── Coupon codes ─────────────────────────────────────────────────
// Two staff-only codes, validated case-insensitively + trimmed server-side:
//
//   PBC  → full comp. Razorpay is skipped, booking saved as paid at ₹0
//          (for offline cash sales — take cash at the gate).
//   PBC1 → pay ₹1. Goes through Razorpay normally but the price is
//          overridden to ₹1 (useful for live-testing the real payment
//          flow without paying full price).
export const COUPON_CODE = "PBC"; // free comp
export const RUPEE_COUPON_CODE = "PBC1"; // pay ₹1
export const RUPEE_COUPON_PRICE = 1; // rupees

export type CouponKind = "free" | "rupee";

/** Returns which kind of coupon the input is, or null if it isn't valid. */
export function classifyCoupon(input: string | null | undefined): CouponKind | null {
  if (!input) return null;
  const code = input.trim().toUpperCase();
  if (code === COUPON_CODE.toUpperCase()) return "free";
  if (code === RUPEE_COUPON_CODE.toUpperCase()) return "rupee";
  return null;
}
