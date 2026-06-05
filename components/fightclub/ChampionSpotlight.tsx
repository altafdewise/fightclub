import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { CHAMPION } from "@/lib/fightclub/config";

// The headline section: the reigning Fighter of the Night. Their photo is
// the prize. Win the night, and your face takes this spot until someone
// rips it from you. Data comes from CHAMPION in lib/fightclub/config.ts.
const GOLD = "#c9a86a";

export function ChampionSpotlight() {
  const crowned = Boolean(CHAMPION.photo);

  return (
    <section className="section-space relative py-28 text-center sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(ellipse 38% 46% at 50% 42%, rgba(201,168,106,0.16) 0%, rgba(139,0,0,0.16) 32%, transparent 68%)",
        }}
      />

      <Reveal>
        <p
          className="mb-3 text-xs font-bold uppercase tracking-[0.42em]"
          style={{ color: GOLD }}
        >
          Reigning Champion
        </p>
        <h2 className="fc-display text-[clamp(2.4rem,9vw,4.5rem)] text-[var(--fc-text)]">
          Fighter of the Night
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[var(--fc-muted)]">
          One fighter rages the hardest. The crowd crowns them. Their photo goes
          here and stays until someone takes it.
        </p>
      </Reveal>

      <Reveal delay={90}>
        <div
          className="mx-auto mb-8 mt-14 flex h-12 w-12 items-center justify-center border border-[rgba(201,168,106,0.32)] text-[0.6rem] font-black uppercase tracking-[0.18em]"
          style={{ color: GOLD, filter: "drop-shadow(0 0 14px rgba(201,168,106,0.5))" }}
          aria-hidden
        >
          Crown
        </div>

        <div
          className="relative mx-auto w-full max-w-[460px] rounded-[26px] p-[2px]"
          style={{
            background: `linear-gradient(150deg, ${GOLD} 0%, rgba(201,168,106,0.25) 28%, #8b0000 72%, #a01010 100%)`,
            boxShadow:
              "0 0 60px rgba(201,168,106,0.18), 0 0 120px rgba(139,0,0,0.35), 0 30px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div className="overflow-hidden rounded-[24px] bg-[#080404]">
            {crowned && CHAMPION.photo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={CHAMPION.photo}
                alt="Fighter of the Night"
                className="aspect-[4/5] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/5] w-full flex-col items-center justify-center gap-5 px-8">
                <span
                  className="select-none text-sm font-black uppercase tracking-[0.28em]"
                  style={{ color: GOLD, opacity: 0.42 }}
                  aria-hidden
                >
                  Crown vacant
                </span>
                <p
                  className="text-sm font-bold uppercase tracking-[0.3em]"
                  style={{ color: "rgba(201,168,106,0.7)" }}
                >
                  The throne is empty
                </p>
                <p className="max-w-[16rem] text-sm leading-relaxed text-[var(--fc-muted)]">
                  Series Two hasn&apos;t crowned its first. This spot is waiting
                  for a face. It could be yours.
                </p>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={140}>
        {crowned ? (
          <div className="mt-9 space-y-2">
            {CHAMPION.wonOn && (
              <p className="text-sm text-[var(--fc-muted)]">
                Took the throne on{" "}
                <span className="font-semibold text-[var(--fc-text)]">{CHAMPION.wonOn}</span>
              </p>
            )}
            {CHAMPION.record && (
              <p className="text-sm font-semibold uppercase tracking-[0.14em]" style={{ color: GOLD }}>
                {CHAMPION.record}
              </p>
            )}
            {CHAMPION.quote && (
              <p className="mx-auto max-w-md pt-2 text-lg italic text-[var(--fc-muted)]">
                &ldquo;{CHAMPION.quote}&rdquo;
              </p>
            )}
          </div>
        ) : null}

        <div
          className="mx-auto mb-5 mt-10 h-px w-16"
          style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }}
        />

        <p className="mb-7 text-[clamp(1.1rem,3.5vw,1.5rem)] font-bold uppercase tracking-tight text-[var(--fc-text)]">
          {crowned ? "Beat them, and the throne is yours." : "Be the first face on this wall."}
        </p>
        <Link href="/fightclub/enter" className="btn-blood inline-flex items-center gap-2">
          {crowned ? "Take their place" : "Claim the throne"}
        </Link>
      </Reveal>
    </section>
  );
}
