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

      <div className="relative mb-10 flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center gap-4 px-4 py-20 text-center sm:mb-12 sm:gap-6 sm:px-6 md:mb-16 md:min-h-[100svh] md:gap-8 md:py-28">
        <h1
          className="mx-auto rounded-2xl border border-white/5 px-4 py-3 text-[clamp(2.45rem,14vw,4rem)] font-black tracking-[0.18em] text-white/10 backdrop-blur-md sm:px-6 sm:py-4 sm:text-[clamp(4rem,11vw,6.5rem)] sm:tracking-[0.22em] md:text-[clamp(6rem,10vw,10rem)] md:tracking-[0.25em]"
          style={{ textShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          BRUTAL
        </h1>
        <p className="px-2 text-[11px] uppercase tracking-[0.16em] text-white/50 sm:text-sm sm:tracking-[0.3em]">
          Coaching across all time zones
        </p>
        <div className="mt-2 flex w-full max-w-sm flex-col justify-center gap-3 sm:mt-4 sm:max-w-none sm:w-auto sm:flex-row">
          <Link
            href="/get-started"
            className="w-full rounded-full border border-[var(--gold)] bg-[rgba(201,168,106,0.08)] px-4 py-3 text-center text-sm font-semibold text-[var(--gold)] backdrop-blur-md transition hover:bg-[rgba(201,168,106,0.12)] sm:w-auto sm:px-6 sm:text-base"
          >
            Book a consult
          </Link>
          <a
            href="#services"
            className="btn-secondary w-full border-[var(--border)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-center text-sm sm:w-auto sm:px-5 sm:text-base"
          >
            View services
          </a>
        </div>
      </div>
    </section>
  );
}
