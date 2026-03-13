import Link from "next/link";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section className="section-space pt-12 sm:pt-16 pb-20 sm:pb-28">
      <Reveal>
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-[rgba(201,168,106,0.08)] pointer-events-none" />
          <div className="relative overflow-hidden rounded-[24px] border border-[rgba(201,168,106,0.18)] glass p-6 sm:p-8 md:rounded-[28px] md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-white/4 via-transparent to-white/2 pointer-events-none" />
            <div className="relative grid items-center gap-6 md:grid-cols-[1.2fr_auto] md:gap-10">
              <div className="space-y-3">
                <p className="text-sm text-muted">Next step</p>
                <h3 className="text-[clamp(1.9rem,7vw,2.5rem)] font-semibold md:text-4xl">
                  Start with a consult. We&apos;ll map the plan.
                </h3>
                <p className="text-sm text-muted">
                  Across timezones. Led by certified professionals.
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-2 md:items-end">
                <Link
                  href="/get-started"
                  className="rounded-full border border-[var(--gold)] bg-[rgba(201,168,106,0.12)] px-5 py-3 text-center font-semibold text-[var(--text)] shadow-[0_12px_30px_rgba(201,168,106,0.28)] transition hover:bg-[rgba(201,168,106,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-0"
                >
                  Book a consult
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
