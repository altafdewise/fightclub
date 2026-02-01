import Link from "next/link";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section className="section-space pb-16 md:pb-24">
      <Reveal>
        <div className="glass rounded-3xl p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-[var(--panelBorder)]">
          <div className="space-y-2">
            <p className="text-sm text-muted">Next step</p>
            <h3 className="text-3xl font-semibold">Start with a consult. Get a plan that fits your schedule.</h3>
          </div>
          <Link href="/get-started" className="btn-primary">Book a consult</Link>
        </div>
      </Reveal>
    </section>
  );
}

