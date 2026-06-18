import Link from "next/link";
import { ChevronDown, ExternalLink, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { FightClubUpdatesStrip } from "@/components/fightclub/FightClubUpdatesStrip";
import {
  BOOKINGS_OPEN,
  FIGHTCLUB,
  SOLD_OUT_HEADLINE,
  SOLD_OUT_MESSAGE,
} from "@/lib/fightclub/config";

const RULES = [
  { num: "01", headline: "3 ROUNDS X 3 MINUTES", body: "Standard amateur format under BFI rules." },
  { num: "02", headline: "JUDGES SCORE EVERY ROUND", body: "Five judges, 10-point must system." },
  { num: "03", headline: "REFEREE'S CALL IS FINAL", body: "Counts and stoppages keep boxers safe." },
];

const CROWD_LINES = ["Five judges", "Every round scored", "The better boxer wins"] as const;

const HERO_DATE = "Sunday, 14 June";
const HERO_TIME = "5 PM onwards";
const HERO_LOCATION = "Saroornagar, Hyderabad";
const mapsQuery = encodeURIComponent(FIGHTCLUB.venue);
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
const mapsPreviewHref = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;

export default function FightClubPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative flex min-h-[94vh] flex-col items-center justify-center overflow-hidden px-5 py-24 text-center sm:py-28">
          {/* Local glow behind the title for depth */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[42%] -z-10 h-[70vh] w-[120vw] -translate-x-1/2 -translate-y-1/2"
            style={{
              background:
                "radial-gradient(ellipse 42% 48% at 50% 50%, rgba(230,60,30,0.16) 0%, rgba(139,0,0,0.14) 38%, transparent 70%)",
            }}
          />

          <Reveal>
            {/* Season, flanked by hairlines */}
            <div className="mb-7 flex items-center justify-center gap-4">
              <span className="h-px w-8 bg-[var(--fc-line)] sm:w-12" aria-hidden />
              <p className="fc-kicker">{FIGHTCLUB.season}</p>
              <span className="h-px w-8 bg-[var(--fc-line)] sm:w-12" aria-hidden />
            </div>

            {/* Poster title */}
            <h1 className="fc-display text-[clamp(3rem,12vw,7rem)] leading-[0.86]">
              <span className="text-[var(--fc-text)]">Fight </span>
              <span
                className="text-[var(--fc-ember)]"
                style={{ textShadow: "0 0 60px rgba(230,60,30,0.45)" }}
              >
                Club
              </span>
            </h1>

            <div className="mx-auto mt-10 w-full max-w-[34rem] border-y border-[var(--fc-line)] py-5">
              <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--fc-ember)] sm:text-sm sm:tracking-[0.2em]">
                {HERO_DATE} &middot; {HERO_TIME}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--fc-muted)]">
                {HERO_LOCATION}
              </p>
            </div>

            {!BOOKINGS_OPEN && (
              <div className="mx-auto mt-8 max-w-md rounded-xl border border-[rgba(230,60,30,0.35)] bg-[rgba(139,0,0,0.16)] px-5 py-4">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--fc-ember)]">
                  {SOLD_OUT_HEADLINE}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--fc-muted)]">
                  {SOLD_OUT_MESSAGE}
                </p>
              </div>
            )}

            <Link
              href="/fightclub/enter"
              aria-disabled={!BOOKINGS_OPEN}
              className="btn-blood mt-9 inline-flex items-center px-9 text-base"
            >
              {BOOKINGS_OPEN ? "Get In" : "All Slots Booked"}
            </Link>

            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--fc-muted)] sm:text-[11px]">
              Presented by <span className="text-[var(--fc-text)]">Purvik</span>
            </p>
          </Reveal>

          {/* Scroll cue */}
          <div
            aria-hidden
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--fc-muted)]"
          >
            <ChevronDown className="h-6 w-6 animate-bounce opacity-50" strokeWidth={1.5} />
          </div>
        </section>

        {/* ── HOW IT'S SCORED (BFI) ────────────────────────────── */}
        <section className="section-space py-28 text-center sm:py-40">
          <Reveal>
            <p className="fc-kicker mb-10">Scored under BFI rules</p>

            <div className="mx-auto flex max-w-5xl flex-col gap-1 sm:gap-2">
              {CROWD_LINES.map((line, i) => {
                const isLast = i === CROWD_LINES.length - 1;
                return (
                  <h2
                    key={line}
                    className="fc-display text-[clamp(2.4rem,10vw,5.5rem)]"
                    style={isLast ? { color: "var(--fc-ember)" } : { color: "var(--fc-text)" }}
                  >
                    {line}.
                  </h2>
                );
              })}
            </div>

            <p className="mx-auto mt-12 max-w-md text-base leading-relaxed text-[var(--fc-muted)] sm:text-lg">
              {FIGHTCLUB.prizeLine}
            </p>
          </Reveal>
        </section>

        <section className="section-space py-16 text-center">
          <Reveal>
            <p className="fc-kicker mb-3">The deal</p>
            <h2 className="mb-10 text-[clamp(1.8rem,6vw,2.4rem)] font-bold uppercase tracking-tight text-[var(--fc-text)]">
              This isn&apos;t a gym class.
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {RULES.map(({ num, headline, body }, i) => (
              <Reveal key={num} delay={i * 80}>
                <div className="fc-card p-6 text-center">
                  <p className="mb-2 font-mono text-xs font-bold text-[var(--fc-ember)]">{num}</p>
                  <p className="mb-1.5 text-sm font-bold uppercase tracking-[0.06em] text-[var(--fc-text)]">
                    {headline}
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--fc-muted)]">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--fc-muted)]">
              {FIGHTCLUB.format}
            </p>
          </Reveal>
        </section>


        <section className="section-space py-28 text-center">
          <Reveal>
            <div className="fc-card mx-auto max-w-xl p-10">
              <p className="fc-kicker mb-3">Two doors</p>
              <h2 className="mb-4 text-[clamp(1.9rem,7vw,2.6rem)] font-bold uppercase tracking-tight text-[var(--fc-text)]">
                Watch or fight.
              </h2>
              <p className="mb-8 text-[var(--fc-muted)]">
                {BOOKINGS_OPEN
                  ? "Viewer INR 199. Boxer INR 349. Regular entry first. Premium Purvik challenge follows."
                  : "Viewer, boxer, and premium challenge slots are now fully booked."}
              </p>
              <Link href="/fightclub/enter" aria-disabled={!BOOKINGS_OPEN} className="btn-blood">
                {BOOKINGS_OPEN ? "Get In" : "All Slots Booked"}
              </Link>
            </div>
          </Reveal>
        </section>

        <section id="location" className="section-space pb-24 pt-2 text-center sm:pb-32">
          <Reveal>
            <div className="mx-auto mb-8 max-w-2xl">
              <p className="fc-kicker mb-3">Location</p>
              <h2 className="mb-4 text-[clamp(1.9rem,7vw,2.6rem)] font-bold uppercase tracking-tight text-[var(--fc-text)]">
                Find the ring.
              </h2>
              <p className="mx-auto max-w-md text-sm leading-relaxed text-[var(--fc-muted)]">
                {FIGHTCLUB.venue}
              </p>
            </div>

            <div className="fc-card mx-auto max-w-xl overflow-hidden p-2 sm:p-3">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black sm:aspect-[16/9]">
                <iframe
                  title="BRUTAL Fight Club location map"
                  src={mapsPreviewHref}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full border-0"
                  style={{
                    filter: "invert(90%) hue-rotate(180deg) brightness(58%) contrast(92%) saturate(65%)",
                  }}
                />
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${FIGHTCLUB.venue} in Google Maps`}
                  className="absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/55 via-transparent to-transparent p-4 sm:justify-end sm:p-6"
                >
                  <span className="btn-blood-ghost inline-flex items-center justify-center gap-2 bg-black/70 backdrop-blur-sm">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Open Maps
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        </section>

        <FightClubUpdatesStrip />
      </main>
      <Footer />
    </>
  );
}
