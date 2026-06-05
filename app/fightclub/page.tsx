import Link from "next/link";
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

export default function FightClubPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="section-space flex min-h-[88vh] flex-col items-center justify-center py-28 text-center">
          <Reveal>
            <p className="fc-kicker mb-5">{FIGHTCLUB.season}</p>
            <h1 className="fc-display text-[clamp(4rem,16vw,9rem)]">Fight Club</h1>
            <p className="mt-4 text-xl font-medium italic text-[var(--fc-muted)]">
              {FIGHTCLUB.tagline}
            </p>

            <div className="mx-auto mb-10 mt-9 max-w-md space-y-1 rounded-2xl border border-[var(--fc-line)] bg-[rgba(0,0,0,0.4)] px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--fc-ember)]">
                {FIGHTCLUB.date} / {FIGHTCLUB.time}
              </p>
              <p className="text-sm text-[var(--fc-text)]">{FIGHTCLUB.venue}</p>
            </div>

            <Link href="/fightclub/enter" className="btn-blood inline-flex items-center text-base">
              Get In
            </Link>
          </Reveal>
        </section>

        <ChampionSpotlight />

        <section id="crowd" className="relative overflow-hidden border-y border-[var(--fc-line)] py-20 sm:py-28">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(90deg, rgba(139,0,0,0.2), transparent 28%, transparent 72%, rgba(139,0,0,0.16)), radial-gradient(ellipse 78% 36% at 50% 50%, rgba(230,60,30,0.14), transparent 70%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[linear-gradient(90deg,transparent,rgba(230,60,30,0.5),transparent)]"
            aria-hidden
          />

          <div className="section-space relative">
            <Reveal>
              <div className="grid items-center gap-10 lg:grid-cols-[0.86fr_1.14fr]">
                <div className="text-left">
                  <p className="fc-kicker mb-4">The rules of the ring</p>
                  <h2 className="fc-display max-w-[9ch] text-[clamp(2.75rem,8vw,6rem)]">
                    The room keeps score.
                  </h2>
                  <p className="mt-6 max-w-md text-base leading-relaxed text-[var(--fc-muted)] sm:text-lg">
                    No table, no clipboard, no polite verdict. You win when the whole room feels it.
                  </p>
                  <div className="mt-8 grid max-w-md grid-cols-3 gap-2 text-center">
                    {["0 judges", "0 scorecards", "1 crowd"].map((item) => (
                      <div key={item} className="border border-[var(--fc-line)] bg-black/35 px-3 py-3">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--fc-text)]">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-3 border border-[rgba(230,60,30,0.16)]" aria-hidden />
                  <div className="relative border border-[var(--fc-line)] bg-[rgba(0,0,0,0.62)] p-4 shadow-[0_26px_80px_rgba(0,0,0,0.7)] sm:p-6">
                    <div className="mb-4 flex items-center justify-between border-b border-[var(--fc-line)] pb-3">
                      <span className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--fc-muted)]">
                        Verdict board
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[var(--fc-ember)] shadow-[0_0_18px_rgba(230,60,30,0.9)]" />
                    </div>

                    <div className="space-y-3">
                      {CROWD_LINES.map((line, i) => {
                        const isLast = i === CROWD_LINES.length - 1;

                        return (
                          <div
                            key={line}
                            className={[
                              "grid grid-cols-[3rem_1fr] items-center gap-3 border px-3 py-4 sm:grid-cols-[4rem_1fr] sm:px-5",
                              isLast
                                ? "border-[rgba(230,60,30,0.55)] bg-[rgba(160,16,16,0.16)]"
                                : "border-[rgba(255,255,255,0.08)] bg-white/[0.025]",
                            ].join(" ")}
                          >
                            <span className="font-mono text-xs font-bold text-[var(--fc-muted)]">
                              0{i + 1}
                            </span>
                            <h3
                              className={[
                                "fc-display text-[clamp(1.85rem,6vw,4rem)]",
                                isLast ? "text-[var(--fc-ember)]" : "text-[var(--fc-text)]",
                              ].join(" ")}
                            >
                              {line}
                            </h3>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 border-t border-[var(--fc-line)] pt-5">
                      <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-[#c9a86a]">
                        The prize
                      </p>
                      <p className="text-base leading-relaxed text-[var(--fc-text)] sm:text-lg">
                        {FIGHTCLUB.prizeLine}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
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
                    className="fc-card w-[clamp(240px,42vw,380px)] shrink-0 overflow-hidden"
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
      </main>
      <Footer />
    </>
  );
}
