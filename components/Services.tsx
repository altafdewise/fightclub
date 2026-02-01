import { Dumbbell, ClipboardCheck, Apple, Clock3 } from "lucide-react";
import { Reveal } from "./Reveal";

const services = [
  { icon: Dumbbell, title: "1:1 Coaching", desc: "Personal direction with clear feedback." },
  { icon: ClipboardCheck, title: "Training Program", desc: "Structured plans tailored to your setup." },
  { icon: Apple, title: "Nutrition Guidance", desc: "Balanced habits that match your schedule." },
  { icon: Clock3, title: "Accountability & Check-ins", desc: "Consistent touchpoints to keep momentum." },
];

export function Services() {
  return (
    <section id="services" className="section-space pb-16 md:pb-24">
      <div className="flex flex-col gap-6 mb-10">
        <Reveal>
          <p className="text-sm text-muted">Services</p>
          <h2 className="text-3xl md:text-4xl font-semibold">Minimal, effective, and measured.</h2>
        </Reveal>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {services.map((service, idx) => (
          <Reveal key={service.title} delay={idx * 60}>
            <div className="glass rounded-2xl p-6 flex items-start gap-4 border border-[var(--panelBorder)] hover:border-[var(--accent)] transition">
              <div className="w-11 h-11 rounded-xl bg-[rgba(142,27,42,0.12)] border border-[var(--panelBorder)] flex items-center justify-center text-[var(--accent)]">
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
    </section>
  );
}

