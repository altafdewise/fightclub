import { ArrowUpRight, BellRing, Instagram, MessageCircle } from "lucide-react";
import { Reveal } from "./Reveal";

const socialLinks = [
  {
    title: "Instagram",
    eyebrow: "Reels, stories, and event energy",
    description: "Training clips, fight night photos, announcements, and behind the scenes drops.",
    cta: "Follow @thefightclub.hyd",
    href: "https://www.instagram.com/thefightclub.hyd",
    Icon: Instagram,
    iconClass: "border-[#e95986]/25 bg-[#e95986]/10 text-[#ff7aa8]",
    hoverClass: "hover:border-[#e95986]/50 hover:shadow-[0_18px_44px_rgba(233,89,134,0.16)]",
  },
  {
    title: "WhatsApp Channel",
    eyebrow: "Direct updates",
    description: "Schedule changes, fight card alerts, lineup notes, and last minute announcements.",
    cta: "Join the channel",
    href: "https://whatsapp.com/channel/0029VbCnmcuAO7R8tIwTqh3W",
    Icon: MessageCircle,
    iconClass: "border-[#25d366]/25 bg-[#25d366]/10 text-[#4ade80]",
    hoverClass: "hover:border-[#25d366]/50 hover:shadow-[0_18px_44px_rgba(37,211,102,0.14)]",
  },
];

export function SocialUpdates() {
  return (
    <section id="updates" className="section-space py-12 sm:py-16" aria-label="Fight Club updates">
      <Reveal>
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="flex flex-col justify-center rounded-2xl border border-[var(--border)] bg-white/[0.025] p-6 sm:p-8">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(201,168,106,0.22)] bg-[rgba(201,168,106,0.08)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold)]">
              <BellRing size={14} aria-hidden />
              Updates
            </div>
            <h2 className="text-[clamp(1.9rem,7vw,2.5rem)] font-semibold md:text-4xl">
              Stay close to the action.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Join our official channels for event announcements, training drops, and everything coming next from Fight Club Hyderabad.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {socialLinks.map(({ title, eyebrow, description, cta, href, Icon, iconClass, hoverClass }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex min-h-[260px] flex-col rounded-2xl border border-[var(--border)] bg-white/[0.04] p-6 transition duration-200 hover:-translate-y-1 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] ${hoverClass}`}
              >
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border ${iconClass}`}>
                  <Icon size={23} strokeWidth={2.2} aria-hidden />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{eyebrow}</p>
                  <h3 className="text-2xl font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted">{description}</p>
                </div>
                <div className="mt-auto pt-6">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-white transition group-hover:text-[var(--gold)]">
                    {cta}
                    <ArrowUpRight size={16} aria-hidden />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
