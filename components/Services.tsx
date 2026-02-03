"use client";

import { Dumbbell, ClipboardCheck, Apple, Clock3, HeartPulse } from "lucide-react";
import { Reveal } from "./Reveal";
import { ServicesReveal } from "./ServicesReveal";
import { cn } from "@/utils/cn";

const services = [
  {
    icon: Dumbbell,
    title: "1:1 Coaching",
    desc: "Personalized programming and accountability.",
    details: "Our 1:1 coaching provides a fully customized training program tailored to your specific goals, experience level, and equipment access. You'll receive weekly check-ins and form reviews to ensure you're making progress safely and effectively.",
  },
  {
    icon: ClipboardCheck,
    title: "Training Plans",
    desc: "Structured progression, no noise.",
    details: "Choose from a variety of evidence-based training plans designed for specific outcomes like strength gain, muscle growth, or athletic performance. Each plan includes detailed instructions and progression protocols.",
  },
  {
    icon: Apple,
    title: "Nutrition Guidance",
    desc: "Simple, sustainable strategies.",
    details: "We don't do restrictive diets. Our nutrition guidance focuses on building sustainable habits, understanding macronutrients, and fueling your body for performance and health without eliminating the foods you love.",
  },
  {
    icon: Clock3,
    title: "Check-ins",
    desc: "Clear feedback and course correction.",
    details: "Regular check-ins are crucial for accountability and making adjustments. We'll review your progress, answer your questions, and adapt your plan as needed to keep you moving toward your goals.",
  },
];

export function Services() {
  return (
    <section id="services" className="section-space pt-16 sm:pt-20 pb-12 sm:pb-14">
      <div className="flex flex-col gap-4 mb-10 text-center">
        <Reveal>
          <p className="text-sm text-muted">Services</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="text-3xl md:text-4xl font-semibold">Minimal, effective, and measured.</h2>
        </Reveal>
      </div>
      <ServicesReveal>
        {({ isVisible, prefersReducedMotion }) => (
          <>
            <div className="relative">
              <div
                className={cn(
                  "absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[rgba(201,168,106,0.28)] to-transparent transition-opacity duration-[450ms] ease-out",
                  isVisible ? "opacity-100" : "opacity-0",
                  "motion-reduce:opacity-100 motion-reduce:transition-none"
                )}
              />
              <div className="flex flex-col gap-6 md:gap-10">
                {services.map((service, idx) => {
                  const isLeft = idx % 2 === 0;
                  const delay = prefersReducedMotion ? "0ms" : `${idx * 140}ms`;

                  return (
                    <div
                      key={service.title}
                      className="grid grid-cols-[32px_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)]"
                    >
                      <div className="relative col-start-1 row-start-1 md:col-start-2 md:row-start-1 pointer-events-none">
                        <span
                          className={cn(
                            "absolute top-[42px] left-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-[rgba(201,168,106,0.55)] border border-[rgba(201,168,106,0.35)] shadow-[0_0_0_4px_rgba(201,168,106,0.08)] transition-opacity duration-[450ms] ease-out z-10",
                            isVisible ? "opacity-100" : "opacity-0",
                            "motion-reduce:opacity-100 motion-reduce:transition-none"
                          )}
                          style={{ transitionDelay: delay }}
                        />
                        <span
                          className={cn(
                            "absolute top-[42px] h-px bg-[rgba(201,168,106,0.32)] transition-opacity duration-[450ms] ease-out",
                            "left-1/2 w-[calc(50%-2px)]",
                            isLeft ? "md:right-1/2 md:left-auto" : "md:left-1/2 md:right-auto",
                            isVisible ? "opacity-100" : "opacity-0",
                            "motion-reduce:opacity-100 motion-reduce:transition-none"
                          )}
                          style={{ transitionDelay: delay }}
                        />
                      </div>
                      <div
                        className={cn(
                          "col-start-2 row-start-1 md:row-start-1",
                          isLeft ? "md:col-start-1" : "md:col-start-3"
                        )}
                      >
                        <div
                          className={cn(
                            "glass rounded-2xl p-6 border border-[var(--border)] hover:border-[var(--gold)] transition-[opacity,transform,filter,border-color] duration-[450ms] ease-out",
                            isVisible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-3.5 blur-sm",
                            "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:blur-0 motion-reduce:transition-none"
                          )}
                          style={{ transitionDelay: delay }}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-[rgba(201,168,106,0.08)] border border-[var(--border)] flex-shrink-0 flex items-center justify-center text-[var(--gold)]">
                              <service.icon size={22} />
                            </div>
                            <div className="flex-grow">
                              <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
                              <p className="text-muted text-sm leading-relaxed">{service.desc}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div
              className={cn(
                "glass rounded-2xl p-6 mt-8 border border-[var(--border)] hover:border-[var(--gold)] transition-[opacity,transform,filter,border-color] duration-[450ms] ease-out",
                isVisible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-3.5 blur-sm",
                "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:blur-0 motion-reduce:transition-none"
              )}
              style={{
                transitionDelay: prefersReducedMotion ? "0ms" : `${services.length * 140}ms`,
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-[rgba(201,168,106,0.08)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)]">
                  <HeartPulse size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Cycle Sync Coaching</h3>
                </div>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                <span className="block">Training, nutrition, and recovery aligned to your cycle.</span>
                <span className="block">
                  We adjust intensity and fueling across all four phases to support energy, performance, and long-term consistency—guided by certified coaches.
                </span>
              </p>
            </div>
          </>
        )}
      </ServicesReveal>
    </section>
  );
}
