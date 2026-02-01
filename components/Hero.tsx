import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden" id="home">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/Videos/video1.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/60" />
      </div>

      <div className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-20 md:py-28 mb-12 md:mb-16 gap-8 text-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center mt-4">
          <Link
            href="/get-started"
            className="w-full sm:w-auto text-center rounded-full px-6 py-3 font-semibold text-[var(--gold)] border border-[var(--gold)] bg-[rgba(201,168,106,0.08)] backdrop-blur-md hover:bg-[rgba(201,168,106,0.12)] transition"
          >
            Book a consult
          </Link>
          <a
            href="#services"
            className="btn-secondary w-full sm:w-auto text-center border-[var(--border)] bg-[rgba(255,255,255,0.03)]"
          >
            View services
          </a>
        </div>
      </div>
    </section>
  );
}
