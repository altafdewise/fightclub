"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CHALLENGE, FIGHTCLUB } from "@/lib/fightclub/config";

const WHATSAPP_URL = process.env.NEXT_PUBLIC_WHATSAPP_INVITE_URL || "#";

type SuccessType = "viewer" | "boxer" | "challenge";

function entryLabel(type: SuccessType, qty: number): string {
  if (type === "challenge") return `Challenge ${CHALLENGE.targetName}`;
  if (type === "boxer") return "Boxer entry. You fight";
  return `${qty} x Viewer admission`;
}

function SuccessContent() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId") || "-";
  const name = params.get("name") || "Fighter";
  const rawType = params.get("type");
  const type: SuccessType = rawType === "boxer" || rawType === "challenge" ? rawType : "viewer";
  const qty = Number(params.get("qty") || 1);
  const isBoxer = type === "boxer";
  const isChallenge = type === "challenge";

  const details = [
    { label: "Booking ID", value: bookingId, red: true, mono: true },
    { label: "Name", value: name },
    { label: "Entry", value: entryLabel(type, qty) },
    { label: "Date & Time", value: `${FIGHTCLUB.date} · ${FIGHTCLUB.time}` },
    { label: "Venue", value: FIGHTCLUB.venue },
    { label: "Format", value: FIGHTCLUB.format },
  ];

  return (
    <main className="section-space flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <div className="mx-auto w-full max-w-lg">
        <div className="fc-card p-8 md:p-10">
          <p className="fc-kicker mb-2">You&apos;re in</p>
          <h1 className="mb-2 text-[clamp(1.9rem,7vw,2.5rem)] font-bold uppercase tracking-tight text-[var(--fc-text)]">
            {isChallenge ? "Challenge locked" : isBoxer ? "Step into the ring" : "See you ringside"}
            {name !== "Fighter" ? `, ${name.split(" ")[0]}` : ""}.
          </h1>
          <p className="mb-8 text-[var(--fc-muted)]">
            {isChallenge
              ? `Your premium challenge against ${CHALLENGE.targetName} is recorded. The team will use your detailed form for verification and match readiness.`
              : isBoxer
              ? "Collect your wristband at the gate. 3 rounds. 3 minutes. The crowd decides."
              : "Booking confirmed. Check your email for your ticket."}
          </p>

          <div className="mb-8 divide-y divide-[var(--fc-line)] rounded-2xl border border-[var(--fc-line)] bg-[rgba(0,0,0,0.35)] text-left">
            {details.map(({ label, value, red, mono }) => (
              <div key={label} className="px-5 py-4">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fc-muted)]">
                  {label}
                </p>
                <p
                  className={[
                    "text-sm font-medium",
                    red ? "text-[var(--fc-ember)]" : "text-[var(--fc-text)]",
                    mono ? "font-mono" : "",
                  ].join(" ")}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-blood mb-3 flex w-full items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Join WhatsApp Broadcast
          </a>
          <p className="text-xs text-[var(--fc-muted)]">
            Fight night updates, lineups, and last minute changes on your phone.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-[var(--fc-muted)]">
          <Link href="/fightclub" className="transition-colors hover:text-[var(--fc-ember)]">
            Fight Club Home
          </Link>
          <a
            href="https://instagram.com/brutal.fit"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[var(--fc-ember)]"
          >
            @brutal.fit on Instagram
          </a>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense
        fallback={
          <main className="section-space flex min-h-[70vh] items-center justify-center py-24 text-center">
            <p className="text-[var(--fc-muted)]">Loading...</p>
          </main>
        }
      >
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  );
}
