"use client";

import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { ACKNOWLEDGEMENT_POINTS } from "@/lib/fightclub/acknowledgement";

export interface AckResult {
  acknowledgementId: string;
  fullName: string;
  acceptedAt: string;
}

// Step 1 of the boxer flow. The fighter reads all points, ticks ONE box to
// accept them all, and types their name. Records the acknowledgement
// server-side (every point is stored as accepted).
export function AckChecklist({
  onDone,
  initialName = "",
}: {
  onDone: (result: AckResult) => void;
  initialName?: string;
}) {
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState(initialName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Timestamp is captured live and shown on screen.
  const timestamp = useMemo(() => new Date(), []);

  const ready = accepted && name.trim().length > 1;

  async function submit() {
    if (!ready || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      // The single checkbox covers all points — record each as accepted.
      const allAccepted = ACKNOWLEDGEMENT_POINTS.map(() => true);
      const res = await fetch("/api/fightclub/acknowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: name.trim(), accepted: allAccepted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not record acknowledgement.");
      onDone({
        acknowledgementId: data.acknowledgementId,
        fullName: name.trim(),
        acceptedAt: data.acceptedAt,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl text-left">
      <p className="mb-6 text-center text-sm text-[var(--fc-muted)]">
        Read all the points below, then accept. This is a digital acknowledgement. No drawn signature needed.
      </p>

      {/* Readable list — scrollable, no per-point checkboxes */}
      <div className="fc-card max-h-[46vh] overflow-y-auto p-5 sm:p-6">
        <ol className="space-y-3">
          {ACKNOWLEDGEMENT_POINTS.map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--fc-text)]">
              <span className="mt-0.5 font-mono text-xs font-bold text-[var(--fc-ember)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Single accept-all checkbox */}
      <label
        className={cn(
          "mt-4 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
          accepted
            ? "border-[var(--fc-blood-bright)] bg-[rgba(139,0,0,0.12)]"
            : "border-[var(--fc-line)] bg-[rgba(0,0,0,0.25)]"
        )}
      >
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-5 w-5 flex-shrink-0 accent-[#a01010]"
        />
        <span className="text-sm font-medium leading-relaxed text-[var(--fc-text)]">
          I have read and accept all {ACKNOWLEDGEMENT_POINTS.length} points above.
        </span>
      </label>

      <div className="mt-4 fc-card p-5">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fc-muted)]">
            Type your full name
          </span>
          <input
            type="text"
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full legal name"
            className="w-full rounded-xl px-3 py-3 text-sm"
          />
        </label>
        <p className="mt-3 text-xs text-[var(--fc-muted)]">
          Acknowledged at{" "}
          <span className="font-mono text-[var(--fc-text)]">{timestamp.toLocaleString()}</span>
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!ready || submitting}
        className="btn-blood mt-6 w-full"
      >
        {submitting ? "Recording…" : "I Acknowledge"}
      </button>
      {!ready && (
        <p className="mt-3 text-center text-xs text-[var(--fc-muted)]">
          {accepted ? "Type your full name to continue." : "Accept the points to continue."}
        </p>
      )}
    </div>
  );
}
