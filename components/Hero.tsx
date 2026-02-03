import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden" id="home">
      <div className="absolute inset-0">
        <video
          key="/Videos/video1.mp4?v=1"
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/Videos/video1.mp4?v=1" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/60" />
      </div>

      <div className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-20 md:py-28 mb-12 md:mb-16 gap-4 sm:gap-6 md:gap-8 text-center">
        <h1
          className="text-[clamp(3.5rem,12vw,5rem)] sm:text-[clamp(4.5rem,10vw,7rem)] md:text-[clamp(6rem,10vw,10rem)] font-black text-white/10 tracking-[0.25em] -mx-2 backdrop-blur-md rounded-2xl border border-white/5 py-4 px-6"
          style={{ textShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          BRUTAL
        </h1>
        <p className="text-[11px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.35em] text-white/50">
          Coaching across all time zones
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center mt-2 sm:mt-4">
          <Link
            href="/get-started"
            className="w-auto text-center rounded-full px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-semibold text-[var(--gold)] border border-[var(--gold)] bg-[rgba(201,168,106,0.08)] backdrop-blur-md hover:bg-[rgba(201,168,106,0.12)] transition"
          >
            Book a consult
          </Link>
          <a
            href="#services"
            className="btn-secondary w-auto text-center border-[var(--border)] bg-[rgba(255,255,255,0.03)] text-sm sm:text-base px-4 py-2 sm:px-5 sm:py-3"
          >
            View services
          </a>
        </div>
      </div>
    </section>
  );
}
