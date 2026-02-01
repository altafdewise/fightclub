import { Dumbbell, ClipboardCheck, Apple, Clock3, HeartPulse } from "lucide-react";
import { Reveal } from "./Reveal";

const services = [
  { icon: Dumbbell, title: "1:1 Coaching", desc: "Personalized programming and accountability." },
  { icon: ClipboardCheck, title: "Training Plans", desc: "Structured progression, no noise." },
  { icon: Apple, title: "Nutrition Guidance", desc: "Simple, sustainable strategies." },
  { icon: Clock3, title: "Check-ins", desc: "Clear feedback and course correction." },
];

export function Services() {
  return (
    <section id="services" className="section-space pt-16 sm:pt-20 pb-12 sm:pb-14">
      <div className="flex flex-col gap-6 mb-10">
        <Reveal>
          <p className="text-sm text-muted">Services</p>
          <h2 className="text-3xl md:text-4xl font-semibold">Minimal, effective, and measured.</h2>
        </Reveal>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service, idx) => (
          <Reveal key={service.title} delay={idx * 60}>
            <div className="glass rounded-2xl p-6 flex items-start gap-4 border border-[var(--border)] hover:border-[var(--gold)] transition">
              <div className="w-11 h-11 rounded-xl bg-[rgba(201,168,106,0.08)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)]">
                <service.icon size={22} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{service.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={240}>
        <div className="glass rounded-2xl p-6 mt-6 border border-[var(--border)] hover:border-[var(--gold)] transition">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-[rgba(201,168,106,0.08)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)]">
              <HeartPulse size={22} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Cycle Sync Coaching</h3>
            </div>
          </div>
          <p className="text-muted text-sm leading-relaxed">
            Training, nutrition, and recovery aligned to the four phases—built for consistency and reduced fatigue.
            Guided by certified professionals.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
