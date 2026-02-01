import Link from "next/link";
import { Reveal } from "./Reveal";

export function Hero() {
  return (
    <section className="section-space pt-10 md:pt-20 pb-14 md:pb-24" id="home">
      <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-center max-w-6xl mx-auto">
        <Reveal>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--panelBorder)] text-xs text-muted bg-[rgba(255,255,255,0.02)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" aria-hidden />
              Online coaching, anywhere, anytime.
            </div>
            <h1 className="text-[2.1rem] leading-tight font-semibold md:text-5xl">
              Online coaching, built for all timezones.
            </h1>
            <p className="text-base md:text-lg text-muted max-w-2xl">
              Structured programming, accountability, and expert guidance—wherever you train.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link href="/get-started" className="btn-primary w-full sm:w-auto text-center">Book a consult</Link>
              <a href="#services" className="btn-secondary w-full sm:w-auto text-center">View services</a>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden /> Certified professionals
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden /> Personalized plans
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden /> Ongoing support
              </span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="glass rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(142,27,42,0.12)] via-transparent to-transparent" />
            <div className="relative space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">BRUTAL</p>
                  <p className="text-xl font-semibold">Anywhere, anytime</p>
                </div>
                <div className="w-12 h-12 rounded-2xl border border-[var(--panelBorder)] flex items-center justify-center bg-[rgba(255,255,255,0.04)] text-sm">
                  24/7
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-4 border border-[var(--panelBorder)]">
                  <p className="text-sm text-muted">Focus</p>
                  <p className="font-semibold">Progression</p>
                  <p className="text-sm text-muted">Measured weekly</p>
                </div>
                <div className="glass rounded-2xl p-4 border border-[var(--panelBorder)]">
                  <p className="text-sm text-muted">Support</p>
                  <p className="font-semibold">Responsive</p>
                  <p className="text-sm text-muted">Feedback loops</p>
                </div>
              </div>
              <div className="glass rounded-2xl p-5 border border-[var(--panelBorder)] flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted">Timezones</p>
                  <p className="font-semibold">Global fit</p>
                </div>
                <div className="text-xs px-3 py-1 rounded-full border border-[var(--panelBorder)]">
                  Calm & Clear
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

