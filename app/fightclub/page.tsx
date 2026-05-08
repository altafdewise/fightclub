import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";

const RULES = [
  { num: "01", headline: "YOU TAP, IT STOPS", body: "Until then nobody's saving you." },
  { num: "02", headline: "NO JUDGES, NO SCORECARDS", body: "The crowd decides." },
  { num: "03", headline: "THIS RING DOESN'T DISCRIMINATE", body: "Men. Women. Anyone with hands." },
];

const WHO = [
  { label: "Men's bouts", desc: "All skill levels. We do the matching on the night." },
  { label: "Women's bouts", desc: "Full contact. No excuses, no soft rounds." },
  { label: "Spectators", desc: "You don't have to fight to be part of this." },
];

export default function FightClubPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="section-space flex min-h-[85vh] flex-col items-center justify-center py-28 text-center">
          <Reveal>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[var(--muted)]">
              Hyderabad · Season One
            </p>
            <h1 className="text-[clamp(3.5rem,13vw,7rem)] font-black uppercase leading-none tracking-tight text-[var(--text)]">
              Fight Club
            </h1>
            <h2 className="mb-6 text-[clamp(3.5rem,13vw,7rem)] font-black uppercase leading-none tracking-tight text-[#e63c1e]">
              Hyderabad
            </h2>
            <p className="mb-8 text-xl font-medium italic text-[var(--muted)]">
              No rules. Just fists.
            </p>
            <div className="mx-auto mb-10 max-w-sm space-y-1 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Sunday · 6:00 PM
              </p>
              <p className="text-sm text-[var(--text)]">
                B3 Underground Parking, Chaitanyapuri, Hyderabad
              </p>
            </div>
            <Link href="/fightclub/book" className="btn-fight inline-flex items-center gap-2">
              Book Ticket —{" "}
              <span className="font-normal opacity-70 line-through">₹499</span>{" "}
              <span className="font-bold">₹0</span>
            </Link>
          </Reveal>
        </section>

        {/* ── RULES ────────────────────────────────────────────── */}
        <section className="section-space py-20 text-center">
          <Reveal>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#e63c1e]">
              The deal
            </p>
            <h2 className="mb-10 text-[clamp(1.9rem,7vw,2.5rem)] font-semibold text-[var(--text)]">
              This isn&apos;t a gym class.
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {RULES.map(({ num, headline, body }, i) => (
              <Reveal key={num} delay={i * 70}>
                <div className="glass rounded-2xl border border-[var(--border)] p-5 sm:p-6 text-center">
                  <p className="mb-2 text-xs font-bold text-[#e63c1e]">{num}</p>
                  <p className="mb-1 text-sm font-bold uppercase tracking-[0.08em] text-[var(--text)]">
                    {headline}
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--muted)]">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-8 text-sm">
              <Link href="/fightclub/rules" className="text-[#e63c1e] hover:underline">
                Read the full code →
              </Link>
            </p>
          </Reveal>
        </section>

        {/* ── WHO FIGHTS ───────────────────────────────────────── */}
        <section className="section-space py-20 text-center">
          <Reveal>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#e63c1e]">
              Who fights
            </p>
            <h2 className="mb-4 text-[clamp(1.9rem,7vw,2.5rem)] font-semibold text-[var(--text)]">
              This ring doesn&apos;t care about your background.
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-[var(--muted)]">
              Men. Women. Trained or not. We match you with someone your size on the night.
              You don&apos;t need a gym. You need the will to show up.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {WHO.map(({ label, desc }, i) => (
              <Reveal key={label} delay={i * 80}>
                <div className="glass rounded-2xl border border-[var(--border)] p-5 sm:p-6 text-center">
                  <p className="mb-1 font-semibold text-[var(--text)]">{label}</p>
                  <p className="text-sm leading-relaxed text-[var(--muted)]">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── THE THRONE ───────────────────────────────────────── */}
        <section className="section-space py-32 text-center">
          <Reveal>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#e63c1e]">
              The Prize
            </p>
            <h2 className="mb-5 font-black uppercase leading-none tracking-tight text-[var(--text)]"
              style={{ fontSize: "clamp(2.8rem,10vw,5.5rem)" }}
            >
              One night.
              <br />
              One throne.
            </h2>
            <p className="mx-auto max-w-md text-lg text-[var(--muted)]">
              The fighter who rages the night sits on it.
            </p>
          </Reveal>

          <Reveal>
            {/* Accent line above image */}
            <div
              className="mx-auto mb-10 mt-14"
              style={{ width: 1, height: 56, background: "linear-gradient(to bottom, transparent, #e63c1e)" }}
            />

            {/* Throne image placeholder */}
            <div
              className="relative mx-auto w-full max-w-[560px]"
              style={{ boxShadow: "0 0 80px rgba(230,60,30,0.4), 0 0 200px rgba(230,60,30,0.12)" }}
            >
              {/* TODO: Replace with actual iron throne photo */}
              <div className="flex aspect-square w-full flex-col items-center justify-center gap-5 rounded-2xl border border-[rgba(230,60,30,0.15)] bg-[#0c0101]">
                <span className="select-none text-[7rem] leading-none opacity-[0.18]" aria-hidden="true">
                  ♛
                </span>
                <p className="text-xs uppercase tracking-[0.35em] text-[rgba(230,60,30,0.35)]">
                  Iron Throne
                </p>
              </div>
            </div>

            {/* Accent line below image */}
            <div
              className="mx-auto mb-14 mt-10"
              style={{ width: 1, height: 56, background: "linear-gradient(to top, transparent, #e63c1e)" }}
            />
          </Reveal>

          <Reveal>
            <div className="space-y-5">
              <p className="text-[var(--muted)]">Welded by hand. Iron and steel.</p>
              <p className="text-[var(--muted)]">Photo goes up. Title is yours until next Sunday.</p>
              <p className="text-[var(--muted)]">Then someone takes it from you.</p>
            </div>
            <p
              className="mt-10 font-black uppercase tracking-[0.12em] text-[#e63c1e]"
              style={{ fontSize: "clamp(1.6rem,5vw,2.8rem)" }}
            >
              Will it be you?
            </p>
          </Reveal>
        </section>

        {/* ── BOTTOM CTA ───────────────────────────────────────── */}
        <section className="section-space py-28 text-center">
          <Reveal>
            <div className="glass mx-auto max-w-xl rounded-[24px] border border-[rgba(230,60,30,0.2)] p-10">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#e63c1e]">
                Limited spots
              </p>
              <h2 className="mb-4 text-[clamp(1.9rem,7vw,2.5rem)] font-semibold text-[var(--text)]">
                Are you in?
              </h2>
              <p className="mb-8 text-[var(--muted)]">
                Free entry. Underground venue. No spectator sport — everyone&apos;s a fighter.
              </p>
              <Link href="/fightclub/book" className="btn-fight">
                Book Your Spot
              </Link>
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  );
}
