import { Instagram, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const INSTAGRAM_URL = "https://www.instagram.com/thefightclub.hyd";
const WHATSAPP_URL = "https://whatsapp.com/channel/0029VbCnmcuAO7R8tIwTqh3W";

export function FightClubUpdatesStrip() {
  return (
    <section className="section-space py-10" aria-label="Fight Club social updates">
      <Reveal>
        <div className="flex flex-col items-center justify-between gap-5 rounded-2xl border border-[var(--fc-line)] bg-black/35 px-5 py-6 text-center sm:flex-row sm:px-7 sm:text-left">
          <div>
            <p className="fc-kicker mb-2">Updates</p>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[var(--fc-text)]">
              Join the channel. Follow the page.
            </h2>
            <p className="mt-1 text-sm text-[var(--fc-muted)]">@thefightclub.hyd</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-blood inline-flex items-center justify-center gap-2 !px-5 !py-3"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Join WhatsApp
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-blood-ghost inline-flex items-center justify-center gap-2 !px-5 !py-3"
            >
              <Instagram className="h-4 w-4" aria-hidden />
              More Updates
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
