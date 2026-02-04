import Link from "next/link";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { Services } from "@/components/Services";
import { VideoSection } from "@/components/VideoSection";
import { TestimonialsMarquee } from "@/components/TestimonialsMarquee";
import { Why } from "@/components/Why";

export default function HomePage() {
  return (
    <div className="pb-16">
      <Navbar />
      <Hero />
      <Services />
      <VideoSection />
      <Why />
      <TestimonialsMarquee />
      <CTA />
      <section className="section-space pt-4 pb-16" aria-label="Access">
        <div className="mb-6 text-center space-y-2">
          <p className="text-sm text-white/60">I'm a BRUTAL member.</p>
          <h2 className="text-2xl md:text-3xl font-semibold">Member Access</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-1 hover:bg-white/[0.05]">
            <div className="flex h-full flex-col gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Client Portal</h2>
                <p className="text-sm text-white/60">
                  Daily training checklist, trainer notes, and progress tracking.
                </p>
              </div>
              <div className="mt-auto pt-2">
                <Link
                  href="/portal/login"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 sm:w-auto"
                >
                  Continue Training 
                </Link>
              </div>
            </div>
          </div>

          <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 backdrop-blur-sm shadow-[0_20px_40px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-1 hover:bg-white/[0.05]">
            <div className="flex h-full flex-col gap-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Trainer Access</h2>
                <p className="text-sm text-white/60">
                  Manage clients, assign workouts, and review weekly progress.
                </p>
              </div>
              <div className="mt-auto pt-2">
                <Link
                  href="/admin/login"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06] sm:w-auto"
                >
                  Trainer Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
