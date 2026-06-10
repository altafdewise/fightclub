import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { TwoDoor } from "@/components/fightclub/TwoDoor";
import { SoldOut } from "@/components/fightclub/SoldOut";
import { BOOKINGS_OPEN } from "@/lib/fightclub/config";

export default function EnterPage() {
  if (!BOOKINGS_OPEN) return <SoldOut />;
  return (
    <>
      <Navbar />
      <main className="section-space flex min-h-[80vh] flex-col items-center justify-center py-24 text-center">
        <div className="mx-auto w-full max-w-3xl">
          <Reveal>
            <p className="fc-kicker mb-4">One night. One throne.</p>
            <h1 className="fc-display mb-3 text-[clamp(2.6rem,10vw,5rem)] text-[var(--fc-text)]">
              Why are you here?
            </h1>
            <p className="mb-12 text-[var(--fc-muted)]">
              Regular entry has two doors. The Purvik challenge is a premium slot.
            </p>
          </Reveal>
          <TwoDoor />
          <Reveal delay={120}>
            <Link href="/fightclub/challenge" className="btn-blood-ghost mt-6 inline-flex">
              Challenge Purvik
            </Link>
          </Reveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
