import type { Metadata } from "next";
import Link from "next/link";
import { GymDirectory } from "@/components/gyms/GymDirectory";
import dataset from "@/lib/data/hyderabad-gyms.json";
import type { VenueDataset } from "@/lib/gyms";

const data = dataset as VenueDataset;

export const metadata: Metadata = {
  title: "Gyms & Fitness Studios in Hyderabad | BRUTAL",
  description: `Directory of ${data.venues.length} gyms, CrossFit boxes, yoga, pilates and boxing studios across Hyderabad and Secunderabad with phone numbers, addresses and map links.`,
  alternates: { canonical: "https://www.brutal.fit/gyms/hyderabad" },
};

export default function HyderabadGymsPage() {
  const updated = new Date(data.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(5,6,7,0.45)] shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="section-space flex items-center justify-between py-3.5 sm:py-4">
          <Link href="/" className="text-base font-semibold tracking-[0.08em] sm:text-lg">
            BRUTAL
          </Link>
          <nav className="flex items-center gap-4 text-sm text-muted">
            <Link href="/" className="nav-link hover:text-white">
              Home
            </Link>
            <Link href="/get-started" className="btn-primary hidden text-sm sm:inline-flex">
              Book a consult
            </Link>
          </nav>
        </div>
      </header>

      <main className="section-space flex-1 py-10 md:py-14">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--gold)]">Directory</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-5xl">Gyms &amp; fitness studios in Hyderabad</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/70 md:text-base">
            Every gym, CrossFit box, yoga, pilates, boxing and dance-fitness studio we could verify across Hyderabad,
            Secunderabad and Cyberabad, with phone numbers, addresses and map links. Filter by locality or type, then call,
            WhatsApp or export the list as CSV.
          </p>
          <p className="mt-2 text-xs text-white/45">Last updated {updated}.</p>
        </div>

        <div className="mt-8">
          <GymDirectory venues={data.venues} />
        </div>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Run a gym or studio?</h2>
            <p className="mt-2 text-sm text-white/65">
              Missing, closed, or listed with the wrong number? Send the correct details and we will update the listing.
            </p>
            <a href="mailto:hello@brutal.fit?subject=Hyderabad%20gym%20directory%20update" className="btn-secondary mt-4 inline-flex text-sm">
              Submit a correction
            </a>
          </div>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Prefer coaching that comes to you?</h2>
            <p className="mt-2 text-sm text-white/65">
              BRUTAL pairs you with certified coaches for structured online or in-person training anywhere in Hyderabad.
            </p>
            <Link href="/get-started" className="btn-primary mt-4 inline-flex text-sm">
              Book a consult
            </Link>
          </div>
        </section>

        <p className="mt-10 text-[11px] leading-relaxed text-white/40">
          Listings compiled from OpenStreetMap (© OpenStreetMap contributors, ODbL) and the venues&apos; own websites. Phone
          numbers and hours are as published by the venues and may change; confirm before visiting. BRUTAL is not affiliated
          with the venues listed.
        </p>
      </main>

      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="section-space flex flex-col gap-2 py-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} BRUTAL</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition-colors hover:text-[var(--gold)]">
              Privacy
            </Link>
            <span className="text-[var(--gold)]">www.brutal.fit</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
