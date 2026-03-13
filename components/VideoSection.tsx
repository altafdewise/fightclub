import { Reveal } from "./Reveal";

export function VideoSection() {
  return (
    <section id="video" className="section-space pt-10 sm:pt-12 pb-16 sm:pb-20">
      <Reveal>
        <div className="mb-3 flex flex-col gap-1 text-center">
          <p className="text-sm text-muted">Video</p>
          <h2 className="text-[clamp(1.9rem,7vw,2.5rem)] font-semibold md:text-4xl">See how we work.</h2>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div className="group relative overflow-hidden rounded-[24px] border border-[var(--border)] glass sm:rounded-3xl">
          <video
            key="/Videos/video2.mp4?v=1"
            className="aspect-[9/12] h-full w-full object-cover sm:aspect-video"
            controls
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src="/Videos/video2.mp4?v=1" type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-0 rounded-[24px] shadow-[0_0_40px_rgba(201,168,106,0.18)] transition group-hover:shadow-[0_0_50px_rgba(201,168,106,0.28)] sm:rounded-3xl" />
        </div>
      </Reveal>
    </section>
  );
}
