import { Reveal } from "./Reveal";

const reasons = [
  { title: "Certified coaching", desc: "Grounded guidance from certified professionals." },
  { title: "Clear progression", desc: "Trackable phases with simple milestones." },
  { title: "Feedback loops", desc: "Frequent check-ins to adjust without friction." },
  { title: "Across timezones", desc: "Designed to work wherever you train." },
];

export function Why() {
  return (
    <section id="why" className="section-space pb-16 md:pb-24">
      <div className="mb-8 flex flex-col gap-5 text-center">
        <Reveal>
          <p className="text-sm text-muted">Why BRUTAL</p>
          <h2 className="text-[clamp(1.9rem,7vw,2.5rem)] font-semibold md:text-4xl">Focused coaching without the noise.</h2>
        </Reveal>
      </div>
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {reasons.map((item, idx) => (
          <Reveal key={item.title} delay={idx * 70}>
            <div className="glass rounded-2xl border border-[var(--border)] p-5 sm:p-6">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

