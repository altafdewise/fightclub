"use client";

import { useRef } from "react";
import { Reveal } from "./Reveal";

const testimonials = [
  { name: "Jordan K.", quote: "I travel a lot - this is the first program I've actually stuck to." },
  { name: "Priya S.", quote: "The check-ins kept me honest without feeling intense." },
  { name: "Marco D.", quote: "Clear plan, clear progress. No noise." },
  { name: "Elina R.", quote: "Form feedback over WhatsApp was a game changer." },
  { name: "Sam T.", quote: "Scheduling across timezones was effortless." },
  { name: "Nina P.", quote: "Minimal, effective, and consistent." },
  { name: "Alicia M.", quote: "Programming felt personal, not copy-paste. Easy to follow on busy weeks." },
  { name: "Drew L.", quote: "Feedback landed same day. Small tweaks made big differences." },
  { name: "Harper C.", quote: "The weekly check-ins kept me consistent without pressure." },
  { name: "Ravi V.", quote: "Travel plus shifts weren't an issue - they adjusted before I even asked." },
];

export function TestimonialsMarquee() {
  const doubled = [...testimonials, ...testimonials];
  const durationSec = testimonials.length * 4;
  const marqueeRef = useRef<HTMLDivElement | null>(null);

  const scrollByCard = (dir: number) => {
    const marquee = marqueeRef.current;
    if (!marquee) return;
    const card = marquee.querySelector<HTMLElement>("article");
    const cardWidth = card ? card.offsetWidth : 280;
    marquee.scrollBy({ left: dir * (cardWidth + 16), behavior: "smooth" });
  };

  return (
    <section id="testimonials" className="section-space pb-16 md:pb-24">
      <div className="flex flex-col gap-6 mb-8">
        <Reveal>
          <p className="text-sm text-muted">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-semibold">Quiet confidence from clients.</h2>
        </Reveal>
      </div>
      <div className="relative overflow-hidden rounded-3xl glass border border-[var(--panelBorder)] py-6">
        <div className="absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-[#0b0c10] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-[#0b0c10] to-transparent pointer-events-none" />
        <div className="marquee" ref={marqueeRef}>
          <div className="marquee-track gap-3 md:gap-4" style={{ animationDuration: `${durationSec}s` }}>
            {doubled.map((item, idx) => (
              <article
                key={idx}
                className="glass min-w-[82vw] sm:min-w-[320px] max-w-[360px] mr-3 md:mr-4 rounded-2xl p-5 border border-[var(--panelBorder)]"
              >
                <p className="text-sm text-muted mb-3">verified client</p>
                <p className="text-base leading-relaxed mb-3">"{item.quote}"</p>
                <p className="text-sm font-semibold">{item.name}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            type="button"
            className="btn-secondary px-3 py-2 rounded-full"
            aria-label="Previous testimonial"
            onClick={() => scrollByCard(-1)}
          >
            {"<"}
          </button>
          <button
            type="button"
            className="btn-primary px-3 py-2 rounded-full"
            aria-label="Next testimonial"
            onClick={() => scrollByCard(1)}
          >
            {">"}
          </button>
        </div>
      </div>
    </section>
  );
}
