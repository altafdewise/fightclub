"use client";

import { useState } from "react";

type WeeklyStatus = {
  canSubmit: boolean;
  daysRemaining: number;
  nextUnlockDate: Date | string | null;
};

export function WeeklyCheckinForm({ status }: { status: WeeklyStatus }) {
  const locked = status.canSubmit ? 0 : status.daysRemaining;
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const nextUnlockLabel = () => {
    if (!status.nextUnlockDate) return null;
    const date = typeof status.nextUnlockDate === "string" ? new Date(status.nextUnlockDate) : status.nextUnlockDate;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const renderScale = (name: string, label: string) => (
    <div className="space-y-3">
      <p className="text-sm font-medium text-white/80">{label}</p>
      <div className="grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className="group relative block">
            <input
              type="radio"
              name={name}
              value={value}
              className="peer sr-only"
            />
            <div className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-3 text-center text-white/80 transition duration-150 ease-out shadow-sm shadow-black/10 hover:border-white/30 hover:bg-white/[0.08] peer-checked:border-white peer-checked:bg-white peer-checked:text-black peer-focus-visible:ring-2 peer-focus-visible:ring-white/40">
              <span className="text-base font-semibold">{value}</span>
            </div>
          </label>
        ))}
      </div>
      <p className="text-xs text-white/50">1 = exhausted / very poor · 3 = normal · 5 = excellent</p>
    </div>
  );

  const onSubmit = async (formData: FormData) => {
    if (locked > 0 || state === "submitting") return;
    setState("submitting");
    setMessage(null);
    const payload = Object.fromEntries(formData.entries());
    try {
      const res = await fetch("/api/checkin/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: payload.weight,
          energyLevel: payload.energy,
          sleepQuality: payload.sleep,
          workoutAdherence: payload.workout,
          dietAdherence: payload.diet,
          notes: payload.notes,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to submit");
      }
      setState("success");
      setMessage(null);
    } catch (err: any) {
      setState("error");
      setMessage(err?.message || "Unable to submit");
    }
  };

  if (locked > 0) {
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-lg shadow-black/10">
        <p className="text-lg font-semibold">Your next check-in unlocks in {locked} day(s).</p>
        <p className="text-sm text-white/70">You can send your next reflection on {nextUnlockLabel()}.</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.05] p-8 text-center shadow-lg shadow-black/10">
        <h2 className="text-2xl font-semibold">Check-in sent to your coach</h2>
        <p className="text-white/70">Your coach will review this and reply.</p>
        <p className="text-sm text-white/60">This week is complete. Your next check-in opens next week.</p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-lg shadow-black/10">
        <div className="space-y-1 text-center">
          <p className="text-sm font-semibold text-white/90">Body Metrics</p>
          <p className="text-xs text-white/60">Optional, but helps us adjust your plan.</p>
        </div>
        <div className="flex justify-center">
          <input
            name="weight"
            type="number"
            step="0.1"
            placeholder="kg"
            className="w-32 rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-lg shadow-black/10">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white/90">Recovery & Energy</p>
          <p className="text-xs text-white/60">How your body felt this week.</p>
        </div>
        <div className="space-y-5">
          {renderScale("energy", "Energy Level")}
          {renderScale("sleep", "Sleep Quality")}
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-lg shadow-black/10">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white/90">Adherence</p>
          <p className="text-xs text-white/60">Be honest — this helps us fix the plan, not judge you.</p>
        </div>
        <div className="space-y-5">
          {renderScale("workout", "Workout Adherence")}
          {renderScale("diet", "Diet Adherence")}
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-lg shadow-black/10">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white/90">Message to your coach</p>
          <p className="text-xs text-white/60">This is where the real coaching happens.</p>
        </div>
        <textarea
          name="notes"
          rows={7}
          className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-white placeholder-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          placeholder="What felt hard this week? cravings? schedule? injuries? motivation?"
        />
      </div>

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-lg shadow-black/10">
        <button
          type="submit"
          disabled={state === "submitting"}
          className="w-full rounded-xl bg-white px-4 py-3 text-base font-semibold text-black shadow-md shadow-black/10 transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:opacity-60"
        >
          {state === "submitting" ? "Sending..." : "Send Weekly Check-In"}
        </button>
        {message && <p className="text-center text-sm text-red-200">{message}</p>}
      </div>
    </form>
  );
}
