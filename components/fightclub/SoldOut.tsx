import Link from "next/link";
import { Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FIGHTCLUB, SOLD_OUT_HEADLINE, SOLD_OUT_MESSAGE } from "@/lib/fightclub/config";

const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_INVITE_URL || "#";

// Shown across every booking flow when BOOKINGS_OPEN is false.
export function SoldOut() {
  return (
    <>
      <Navbar />
      <main className="section-space flex min-h-[80vh] flex-col items-center justify-center py-24 text-center">
        <div className="mx-auto w-full max-w-lg">
          <div className="fc-card p-10">
            <Lock
              className="mx-auto mb-6 h-10 w-10 text-[var(--fc-ember)]"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="fc-kicker mb-3">{FIGHTCLUB.season}</p>
            <h1 className="fc-display text-[clamp(2.6rem,9vw,4rem)] text-[var(--fc-text)]">
              {SOLD_OUT_HEADLINE}
            </h1>
            <p className="mx-auto mt-5 max-w-sm leading-relaxed text-[var(--fc-muted)]">
              {SOLD_OUT_MESSAGE}
            </p>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-blood mt-8 inline-flex items-center"
            >
              Join the Broadcast
            </a>

            <p className="mt-6 text-sm">
              <Link href="/fightclub" className="text-[var(--fc-muted)] hover:text-[var(--fc-ember)]">
                Back to Fight Club
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
