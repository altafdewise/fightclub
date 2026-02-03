import { Reveal } from "./Reveal";

const testimonials = [
  { name: "Ananya S.", quote: "The plan fit around late calls and early flights. That made it doable." },
  { name: "Rohan K.", quote: "Small tweaks each week kept me moving without overthinking." },
  { name: "Sara L.", quote: "Clear instructions, no hype. I just followed and stayed steady." },
  { name: "Amit P.", quote: "Check ins were short but sharp, enough to keep me honest." },
  { name: "Meera T.", quote: "They adjusted for my travel before I even asked. Consistency felt easy." },
  { name: "Daniel P.", quote: "Structure without pressure. I always knew what the next session was." },
  { name: "Priya S.", quote: "Form notes were simple and to the point. Confidence went up fast." },
  { name: "Marcus J.", quote: "Progress was steady, not dramatic. That's what I wanted." },
  { name: "Nina S.", quote: "I stopped guessing reps and weights. The clarity saved time." },
  { name: "Jonas T.", quote: "Quiet accountability, enough to keep me on track, not in my face." },
];

export function TestimonialsMarquee() {
  const doubled = [...testimonials, ...testimonials];
  const durationSec = testimonials.length * 6;

  return (
    <section id="testimonials" className="pb-16 md:pb-24">
      <div className="section-space flex flex-col gap-6 mb-8">
        <Reveal>
          <p className="text-sm text-muted">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-semibold">Quiet confidence from clients.</h2>
        </Reveal>
      </div>
      <div className="relative overflow-hidden rounded-3xl">
        <div className="marquee">
          <div
            className="marquee-track gap-8 md:gap-10"
            style={{ animationDuration: `${durationSec}s` }}
          >
            {doubled.map((item, idx) => (
              <article
                key={idx}
                className="min-w-[85vw] sm:min-w-[360px] md:min-w-[420px] max-w-[440px] px-2"
              >
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted">verified client</p>
                  <p className="text-lg leading-relaxed text-white/90">"{item.quote}"</p>
                  <p className="text-sm font-semibold text-[var(--gold)]">{item.name}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
