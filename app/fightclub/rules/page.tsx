import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "The Fight Club Code | BRUTAL",
  description:
    "Fight Club Hyderabad code of conduct for fighters and spectators. Read it. Understand it. Live by it.",
};

const RULES = [
  {
    num: "01",
    headline: "YOU TAP, IT STOPS",
    body: "You decide when you've had enough. Tap your opponent, tap the floor, or say it out loud. The fight ends instantly. No shame in it. Tapping is how you go home in one piece.",
  },
  {
    num: "02",
    headline: "FISTS ONLY",
    body: "This is open boxing. Closed-fist punches above the waist. Nothing else. No kicks. No knees. No elbows. No headbutts. No takedowns. No ground game. You break this rule, you're out — and you don't come back.",
  },
  {
    num: "03",
    headline: "ZERO ZONES",
    body: "No strikes to the groin, the back of the head, the spine, the throat, or the eyes. Hit clean or don't hit at all.",
  },
  {
    num: "04",
    headline: "GEAR UP OR GO HOME",
    body: "Every fighter wears: hand wraps, 16oz boxing gloves, headgear, mouthguard, and a groin guard (optional but recommended). We provide the gear. Use it. No gear, no fight.",
  },
  {
    num: "05",
    headline: "18 AND ABOVE",
    body: "Bring a government-issued photo ID — Aadhaar, PAN, Driving Licence, Passport. Anyone under 18 doesn't enter the ring. Period.",
  },
  {
    num: "06",
    headline: "SIGN THE PAPER",
    body: "Every fighter signs the waiver before stepping in. We video-record the signing. No waiver, no fight. This protects you and it protects us.",
  },
  {
    num: "07",
    headline: "SHOW UP CLEAN",
    body: "No alcohol. No drugs. No painkillers that mess with your reflexes. We can and will refuse anyone who shows up impaired. Your safety isn't negotiable.",
  },
  {
    num: "08",
    headline: "TELL US IF SOMETHING'S WRONG",
    body: "Heart condition. Recent injury. Concussion in the last six months. Pregnancy. Anything. Tell us in the medical form. If you hide it and something happens, that's on you.",
  },
  {
    num: "09",
    headline: "THE REFEREE IS GOD",
    body: "The referee can stop the fight at any moment for any reason. So can the medical attendant. Their call is final. If they say stop, you stop — instantly.",
  },
  {
    num: "10",
    headline: "THREE ROUNDS, TWO MINUTES EACH",
    body: "Standard format: 3 rounds, 2 minutes each, 1 minute rest between rounds. Fighter can also win by tap-out, knockout, technical knockout, or referee stoppage.",
  },
  {
    num: "11",
    headline: "RESPECT IS THE FIRST AND LAST RULE",
    body: "Touch gloves before. Embrace after. Whatever happens between is between fighters. Outside the ring? You're on the same team. No trash talk before. No celebration over an unconscious opponent. No fights in the parking lot, the gym, or anywhere outside the ring. Break this and you're banned.",
  },
  {
    num: "12",
    headline: "NO PHONES IN THE PIT",
    body: "Spectators can record from outside the ring. Fighters and corners — phones away. The pit is for fighting, not filming.",
  },
  {
    num: "13",
    headline: "THE THRONE",
    body: "One night. Many fighters. One throne. The fighter who rages the night — decided by the head coach and referee — sits on the iron throne. Photo goes up. Title is yours until next Sunday.",
  },
  {
    num: "14",
    headline: "WHAT HAPPENS HERE STAYS HERE",
    body: "Don't fight clout. Don't fight to flex. Don't bring your social media beef into the ring. You step in for one reason — to find out what you're made of.",
  },
  {
    num: "15",
    headline: "IF YOU'RE NOT SURE, DON'T STEP IN",
    body: "Watch a few Sundays first. Train with us. Then come back when you're ready. The ring will be here next week. So will we.",
  },
];

function RuleBlock({
  rule,
  isLast,
}: {
  rule: (typeof RULES)[number];
  isLast: boolean;
}) {
  return (
    <div className="text-center">
      <p
        className="font-black uppercase leading-none tracking-tight text-[#e63c1e]"
        style={{ fontSize: "clamp(5rem, 18vw, 9rem)" }}
      >
        {rule.num}
      </p>
      <h2 className="mb-4 mt-2 font-bold uppercase tracking-[0.15em] text-[var(--text)]"
        style={{ fontSize: "clamp(1rem, 3.5vw, 1.35rem)" }}
      >
        {rule.headline}
      </h2>
      <p className="mx-auto max-w-lg text-base leading-relaxed text-[var(--muted)]">
        {rule.body}
      </p>
      {!isLast && (
        <div
          className="mx-auto mt-14"
          style={{ width: 60, height: 1, background: "#e63c1e" }}
        />
      )}
    </div>
  );
}

export default function FightClubRulesPage() {
  return (
    <>
      <Navbar />

      {/* Sticky banner — hidden on mobile to avoid screen-eating */}
      <div className="sticky top-14 z-40 hidden sm:block border-l-4 border-[#e63c1e] bg-black/95 px-6 py-3 backdrop-blur-md">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text)]">
          RULE 01 — YOU TAP, IT STOPS. UNTIL THEN, NOBODY&apos;S SAVING YOU.
        </p>
      </div>

      <main>
        {/* ── HERO ──────────────────────────────────────────────── */}
        <section className="section-space flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
          <Reveal>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#e63c1e]">
              Fight Club Hyderabad · Season One
            </p>
            <h1
              className="font-black uppercase leading-none tracking-tight text-[var(--text)]"
              style={{ fontSize: "clamp(3rem, 12vw, 6.5rem)" }}
            >
              The Fight Club
            </h1>
            <p
              className="mb-6 font-black uppercase leading-none tracking-tight text-[#e63c1e]"
              style={{ fontSize: "clamp(3rem, 12vw, 6.5rem)" }}
            >
              Code
            </p>
            <div
              className="mx-auto mb-8"
              style={{ width: 60, height: 1, background: "#e63c1e" }}
            />
            <p className="text-xl font-medium italic text-[var(--muted)]">
              Read it. Understand it. Live by it.
            </p>
          </Reveal>
        </section>

        {/* ── RULES LIST ────────────────────────────────────────── */}
        <section className="section-space pb-24 pt-4">
          <div className="mx-auto max-w-2xl">
            {RULES.map((rule, i) => (
              <Reveal key={rule.num}>
                <RuleBlock rule={rule} isLast={i === RULES.length - 1} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ────────────────────────────────────────── */}
        <section className="section-space py-24 text-center">
          <Reveal>
            <div className="glass mx-auto max-w-xl rounded-[24px] border border-[rgba(230,60,30,0.2)] p-10">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#e63c1e]">
                You&apos;ve read it
              </p>
              <h2
                className="mb-8 font-semibold text-[var(--text)]"
                style={{ fontSize: "clamp(1.5rem, 5vw, 2rem)" }}
              >
                Read it. Sign it. Step in.
              </h2>
              <Link
                href="/fightclub/book"
                className="btn-fight inline-flex items-center gap-2"
              >
                BOOK YOUR SLOT —{" "}
                <span className="font-normal opacity-70 line-through">₹499</span>{" "}
                <span className="font-bold">₹0</span>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </>
  );
}
