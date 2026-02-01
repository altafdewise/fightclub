import { Reveal } from "./Reveal";

export function VideoSection() {
  return (
    <section id="video" className="section-space pt-10 md:pt-14 pb-20 md:pb-28">
      <Reveal>
        <div className="flex flex-col gap-3 mb-6">
          <p className="text-sm text-muted">Video</p>
          <h2 className="text-3xl md:text-4xl font-semibold">See how we work.</h2>
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div className="relative rounded-3xl overflow-hidden border border-[var(--border)] glass group">
          <video
            className="w-full h-full object-cover"
            controls
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src="/Videos/video2.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 pointer-events-none rounded-3xl shadow-[0_0_40px_rgba(201,168,106,0.18)] group-hover:shadow-[0_0_50px_rgba(201,168,106,0.28)] transition" />
        </div>
      </Reveal>
    </section>
  );
}
