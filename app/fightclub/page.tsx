import Link from "next/link";
import { ChevronDown, ExternalLink, MapPin } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { ChampionSpotlight } from "@/components/fightclub/ChampionSpotlight";
import { FIGHTCLUB, GALLERY } from "@/lib/fightclub/config";

const RULES = [
  { num: "01", headline: "3 ROUNDS X 3 MINUTES", body: "No more, no less. Survive all three." },
  { num: "02", headline: "YOU TAP, IT STOPS", body: "Until then, nobody's saving you." },
  { num: "03", headline: "THE CROWD DECIDES", body: "No judges. No scorecards. Just the roar." },
];

const CROWD_LINES = ["No judges", "No scorecards", "The crowd decides"] as const;

// Gallery renders real photos from GALLERY in config when present, or six
// styled placeholders while it's empty. Drop files into public/fightclub/
// and list them in lib/fightclub/config.ts.
const GALLERY_PLACEHOLDERS = Array.from({ length: 6 }, (_, i) => i + 1);
const hasGallery = GALLERY.length > 0;
const mapsQuery = encodeURIComponent(FIGHTCLUB.venue);
const mapsHref = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
const mapsPreviewHref = `https://www.google.com/maps?q=${mapsQuery}&output=embed`;

export default function FightClubPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative flex min-h-[94vh] flex-col items-center justify-center overflow-hidden px-5 py-28 text-center">
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
            <div className="mb-8 flex items-center justify-center gap-4">
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

            {/* Accent rule */}
            <div
              aria-hidden
              className="mx-auto mt-9 h-px w-24"
              style={{ background: "linear-gradient(to right, transparent, var(--fc-ember), transparent)" }}
            />

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.34em] text-[var(--fc-muted)] sm:text-base">
              {FIGHTCLUB.tagline}
            </p>

            <div className="mx-auto mb-12 mt-11 flex max-w-md flex-col items-center gap-2">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--fc-ember)]">
                {FIGHTCLUB.date} &middot; {FIGHTCLUB.time}
              </p>
              <p className="text-sm leading-relaxed text-[var(--fc-muted)]">{FIGHTCLUB.venue}</p>
            </div>

            <Link
              href="/fightclub/enter"
              className="btn-blood inline-flex items-center px-9 text-base"
            >
              Get In
            </Link>
          </Reveal>

          {/* Scroll cue */}
          <div
            aria-hidden
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--fc-muted)]"
          >
            <ChevronDown className="h-6 w-6 animate-bounce opacity-50" strokeWidth={1.5} />
          </div>
        </section>

        <ChampionSpotlight />

        {/* ── THE CROWD DECIDES (minimal hook) ─────────────────── */}
        <section className="section-space py-28 text-center sm:py-40">
          <Reveal>
            <p className="fc-kicker mb-10">The rules of the ring</p>

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

        <section className="py-20 text-center">
          <div className="section-space">
            <Reveal>
              <p className="fc-kicker mb-3">Series One - the carnage</p>
              <h2 className="mb-10 text-[clamp(1.8rem,6vw,2.4rem)] font-bold uppercase tracking-tight text-[var(--fc-text)]">
                You missed the first one.
              </h2>
            </Reveal>
          </div>

          {hasGallery ? (
            <div className="marquee py-2">
              <div className="marquee-track">
                {[...GALLERY, ...GALLERY].map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    aria-hidden={i >= GALLERY.length}
                    className="fc-card w-[clamp(320px,82vw,620px)] shrink-0 overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt="Fight Club Series One"
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="section-space">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {GALLERY_PLACEHOLDERS.map((n, i) => (
                  <Reveal key={n} delay={i * 50}>
                    <div className="fc-card flex aspect-square items-center justify-center bg-[rgba(0,0,0,0.5)]">
                      <span className="select-none text-3xl opacity-15" aria-hidden>
                        FIGHT
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          <div className="section-space">
            <Reveal>
              <p className="mt-6 text-xs text-[var(--fc-muted)]">Photos from Series One. This time it&apos;s darker.</p>
            </Reveal>
          </div>
        </section>

        <section className="section-space py-28 text-center">
          <Reveal>
            <div className="fc-card mx-auto max-w-xl p-10">
              <p className="fc-kicker mb-3">Two doors</p>
              <h2 className="mb-4 text-[clamp(1.9rem,7vw,2.6rem)] font-bold uppercase tracking-tight text-[var(--fc-text)]">
                Watch or fight.
              </h2>
              <p className="mb-8 text-[var(--fc-muted)]">
                Viewer INR 199. Boxer INR 349. Pick your door. There&apos;s no third option.
              </p>
              <Link href="/fightclub/enter" className="btn-blood">
                Get In
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
      </main>
      <Footer />
    </>
  );
}
