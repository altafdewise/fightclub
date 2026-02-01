import { ConsultForm } from "@/components/ConsultForm";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";

export default function GetStartedPage() {
  return (
    <div className="pb-16">
      <Navbar />
      <main className="section-space pt-12 md:pt-16 pb-12 flex justify-center">
        <Reveal>
          <ConsultForm />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}

