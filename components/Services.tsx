"use client";

import { useState } from "react";
import { Dumbbell, ClipboardCheck, Apple, Clock3, HeartPulse, ChevronDown } from "lucide-react";
import { Reveal } from "./Reveal";
import { ServicesReveal } from "./ServicesReveal";
import { cn } from "@/utils/cn";

const services = [
  {
    icon: Dumbbell,
    title: "1:1 Coaching",
    desc: "Personalized programming and accountability.",
    details: "Custom training plan, weekly check-ins, and form review to keep progress on track.",
  },
  {
    icon: ClipboardCheck,
    title: "Training Plans",
    desc: "Structured progression, no noise.",
    details: "Evidence based plans with clear progression and session guidance.",
  },
  {
    icon: Apple,
    title: "Nutrition Guidance",
    desc: "Simple, sustainable strategies.",
    details: "Habits first nutrition and macro guidance without strict rules.",
  },
  {
    icon: Clock3,
    title: "Check-ins",
    desc: "Clear feedback and course correction.",
    details: "Quick feedback, adjustments, and accountability to stay consistent.",
  },
];

export function Services() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (key: string) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  return (
    <section id="services" className="section-space pb-12 pt-14 sm:pb-14 sm:pt-20">
      <div className="mb-8 flex flex-col gap-4 text-center sm:mb-10">
        <Reveal>
          <p className="text-sm text-muted">Services</p>
        </Reveal>
        <Reveal delay={100}>
          <h2 className="text-[clamp(1.9rem,7vw,2.5rem)] font-semibold md:text-4xl">Minimal, effective, and measured.</h2>
        </Reveal>
      </div>
      <ServicesReveal>
        {({ isVisible, prefersReducedMotion }) => {
          const cycleDelay = prefersReducedMotion ? "0ms" : `${services.length * 140}ms`;
          const cycleIsLeft = services.length % 2 === 0;
          const cycleKey = "cycle-sync";
          const cycleExpanded = expanded === cycleKey;

          return (
            <div className="relative">
              <div
                className={cn(
                  "absolute bottom-0 top-0 left-3.5 w-px bg-gradient-to-b from-transparent via-[rgba(201,168,106,0.28)] to-transparent transition-opacity duration-[450ms] ease-out md:left-1/2",
                  isVisible ? "opacity-100" : "opacity-0",
                  "motion-reduce:opacity-100 motion-reduce:transition-none"
                )}
              />
              <div className="flex flex-col gap-5 md:gap-10">
                {services.map((service, idx) => {
                  const isLeft = idx % 2 === 0;
                  const delay = prefersReducedMotion ? "0ms" : `${idx * 140}ms`;
                  const detailId = `service-details-${idx}`;
                  const key = `service-${idx}`;
                  const isExpanded = expanded === key;

                  return (
                    <div
                      key={service.title}
                      className="grid grid-cols-[28px_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)]"
                    >
                      <div className="relative col-start-1 row-start-1 md:col-start-2 md:row-start-1 pointer-events-none">
                        <span
                          className={cn(
                            "absolute top-[36px] left-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(201,168,106,0.35)] bg-[rgba(201,168,106,0.55)] shadow-[0_0_0_4px_rgba(201,168,106,0.08)] transition-opacity duration-[450ms] ease-out md:top-[42px]",
                            isVisible ? "opacity-100" : "opacity-0",
                            "motion-reduce:opacity-100 motion-reduce:transition-none"
                          )}
                          style={{ transitionDelay: delay }}
                        />
                        <span
                          className={cn(
                            "absolute top-[36px] h-px bg-[rgba(201,168,106,0.32)] transition-opacity duration-[450ms] ease-out md:top-[42px]",
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
                            "glass rounded-2xl border border-[var(--border)] p-5 transition-[opacity,transform,filter,border-color] duration-[450ms] ease-out hover:border-[var(--gold)] sm:p-6",
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
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
                                <button
                                  type="button"
                                  onClick={() => toggle(key)}
                                  aria-expanded={isExpanded}
                                  aria-controls={detailId}
                                  className="text-muted transition-transform duration-200 ease-out"
                                >
                                  <ChevronDown size={18} className={cn(isExpanded && "rotate-180")} />
                                </button>
                              </div>
                              <p className="text-muted text-sm leading-relaxed">{service.desc}</p>
                              <div
                                id={detailId}
                                className={cn(
                                  "grid overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
                                  isExpanded ? "max-h-24 opacity-100 mt-3" : "max-h-0 opacity-0"
                                )}
                              >
                                <p className="text-muted text-sm leading-relaxed">{service.details}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="grid grid-cols-[28px_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)]">
                  <div className="relative col-start-1 row-start-1 md:col-start-2 md:row-start-1 pointer-events-none">
                    <span
                      className={cn(
                        "absolute top-[36px] left-1/2 z-10 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(201,168,106,0.35)] bg-[rgba(201,168,106,0.55)] shadow-[0_0_0_4px_rgba(201,168,106,0.08)] transition-opacity duration-[450ms] ease-out md:top-[42px]",
                        isVisible ? "opacity-100" : "opacity-0",
                        "motion-reduce:opacity-100 motion-reduce:transition-none"
                      )}
                      style={{ transitionDelay: cycleDelay }}
                    />
                    <span
                      className={cn(
                        "absolute top-[36px] h-px bg-[rgba(201,168,106,0.32)] transition-opacity duration-[450ms] ease-out md:top-[42px]",
                        "left-1/2 w-[calc(50%-2px)]",
                        cycleIsLeft ? "md:right-1/2 md:left-auto" : "md:left-1/2 md:right-auto",
                        isVisible ? "opacity-100" : "opacity-0",
                        "motion-reduce:opacity-100 motion-reduce:transition-none"
                      )}
                      style={{ transitionDelay: cycleDelay }}
                    />
                  </div>
                  <div
                    className={cn(
                      "col-start-2 row-start-1 md:row-start-1",
                      cycleIsLeft ? "md:col-start-1" : "md:col-start-3"
                    )}
                  >
                    <div
                      className={cn(
                        "glass rounded-2xl border border-[var(--border)] p-5 transition-[opacity,transform,filter,border-color] duration-[450ms] ease-out hover:border-[var(--gold)] sm:p-6",
                        isVisible ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-3.5 blur-sm",
                        "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:blur-0 motion-reduce:transition-none"
                      )}
                      style={{ transitionDelay: cycleDelay }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[rgba(201,168,106,0.08)] border border-[var(--border)] flex items-center justify-center text-[var(--gold)]">
                          <HeartPulse size={22} />
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold mb-1">Cycle Sync Coaching</h3>
                            <button
                              type="button"
                              onClick={() => toggle(cycleKey)}
                              aria-expanded={cycleExpanded}
                              aria-controls="cycle-details"
                              className="text-muted transition-transform duration-200 ease-out"
                            >
                              <ChevronDown size={18} className={cn(cycleExpanded && "rotate-180")} />
                            </button>
                          </div>
                          <p className="text-muted text-sm leading-relaxed">
                            Training, nutrition, and recovery aligned to your cycle.
                          </p>
                          <div
                            id="cycle-details"
                            className={cn(
                              "grid overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
                              cycleExpanded ? "max-h-24 opacity-100 mt-3" : "max-h-0 opacity-0"
                            )}
                          >
                            <p className="text-muted text-sm leading-relaxed">
                              We adjust intensity and fueling across all four phases, guided by certified coaches.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </ServicesReveal>
    </section>
  );
}
