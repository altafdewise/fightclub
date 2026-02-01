import Link from "next/link";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section className="section-space py-20 sm:py-28">
      <Reveal>
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-[rgba(201,168,106,0.08)] pointer-events-none" />
          <div className="relative glass rounded-[28px] p-8 md:p-12 border border-[rgba(201,168,106,0.18)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/4 via-transparent to-white/2 pointer-events-none" />
            <div className="relative grid md:grid-cols-[1.2fr_auto] gap-6 md:gap-10 items-center">
              <div className="space-y-3">
                <p className="text-sm text-muted">Next step</p>
                <h3 className="text-3xl md:text-4xl font-semibold">
                  Start with a consult. We’ll map the plan.
                </h3>
                <p className="text-sm text-muted">
                  Across timezones. Led by certified professionals.
                </p>
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <Link
                  href="/get-started"
                  className="px-5 py-3 rounded-full font-semibold text-[var(--text)] border border-[var(--gold)] bg-[rgba(201,168,106,0.12)] hover:bg-[rgba(201,168,106,0.16)] transition shadow-[0_12px_30px_rgba(201,168,106,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-0"
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
