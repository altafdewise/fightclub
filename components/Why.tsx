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
      <div className="flex flex-col gap-6 mb-8">
        <Reveal>
          <p className="text-sm text-muted">Why BRUTAL</p>
          <h2 className="text-3xl md:text-4xl font-semibold">Focused coaching without the noise.</h2>
        </Reveal>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {reasons.map((item, idx) => (
          <Reveal key={item.title} delay={idx * 70}>
            <div className="glass rounded-2xl p-6 border border-[var(--border)]">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

