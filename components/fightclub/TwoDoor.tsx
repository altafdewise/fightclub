import Link from "next/link";
import { PRICING } from "@/lib/fightclub/config";
import { Reveal } from "@/components/Reveal";

// The gate: "WHY ARE YOU HERE?" - two heavy doors. Cinematic, center-aligned.
export function TwoDoor() {
  const doors = [
    {
      href: "/fightclub/watch",
      verb: "WATCH",
      role: "Spectator",
      price: PRICING.viewer.price,
      blurb: "Ringside. Pick your fighter. Scream the winner into the throne.",
    },
    {
      href: "/fightclub/fight",
      verb: "FIGHT",
      role: "Boxer",
      price: PRICING.boxer.price,
      blurb: "Step through the ropes. 3 rounds. The crowd decides if you're the one.",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {doors.map((d, i) => (
        <Reveal key={d.verb} delay={i * 90}>
          <Link
            href={d.href}
            className="group fc-card flex h-full flex-col items-center justify-center gap-4 p-10 text-center transition hover:border-[var(--fc-blood-bright)] hover:shadow-[0_0_50px_rgba(139,0,0,0.5)]"
          >
            <span className="fc-kicker">{d.role}</span>
            <span className="fc-display text-[clamp(2.8rem,11vw,4.5rem)] text-[var(--fc-text)] transition group-hover:text-[var(--fc-ember)]">
              {d.verb}
            </span>
            <span className="text-2xl font-bold text-[var(--fc-ember)]">INR {d.price}</span>
            <span className="max-w-xs text-sm leading-relaxed text-[var(--fc-muted)]">{d.blurb}</span>
            <span className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--fc-muted)] transition group-hover:text-[var(--fc-text)]">
              Choose this door
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
