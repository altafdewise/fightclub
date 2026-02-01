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
      <Footer />
    </div>
  );
}
