import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { BOOKINGS_OPEN, CHALLENGE } from "@/lib/fightclub/config";

export function PurvikChallengeSection() {
  return (
    <section id="challenge-purvik" className="section-space py-10 sm:py-16">
      <Reveal>
        <div className="relative isolate min-h-[560px] overflow-hidden rounded-2xl border border-[rgba(230,60,30,0.28)] bg-black shadow-[0_24px_70px_rgba(0,0,0,0.68)] sm:min-h-[620px] lg:min-h-[660px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CHALLENGE.photo}
            alt="Purvik in the Fight Club ring"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[43%_30%]"
          />
          <div
            className="absolute inset-0 -z-10"
            aria-hidden
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.52) 44%, rgba(0,0,0,0.96) 100%), linear-gradient(0deg, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.24) 52%, rgba(0,0,0,0.08) 100%)",
            }}
          />

          <div className="flex min-h-[560px] items-end px-5 py-7 sm:min-h-[620px] sm:px-8 sm:py-9 lg:min-h-[660px] lg:items-center lg:justify-end lg:px-14">
            <div className="w-full max-w-xl lg:w-[48%]">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.26em] text-[var(--fc-ember)]">
                {BOOKINGS_OPEN ? "Limited Challenge" : "Challenge Slot Booked"}
              </p>

              <h2 className="fc-display text-[clamp(3.2rem,14vw,6.4rem)] text-[var(--fc-text)]">
                Challenge Purvik.
              </h2>

              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--fc-muted)]">
                <span className="text-[var(--fc-ember)]">
                  {BOOKINGS_OPEN ? `Closes ${CHALLENGE.deadlineLabel}` : "All Purvik challenge slots are booked"}
                </span>
              </div>

              <Link
                href="/fightclub/challenge"
                aria-disabled={!BOOKINGS_OPEN}
                className="btn-blood mt-8 inline-flex w-full items-center justify-center gap-2 sm:w-fit"
              >
                {BOOKINGS_OPEN ? "Challenge Purvik" : "Challenge Booked"}
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
