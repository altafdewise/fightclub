"use client";

import { useState } from "react";

type Props = {
  checkinId: string;
  disabled?: boolean;
};

export function CheckinReply({ checkinId, disabled = false }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (formData: FormData) => {
    if (disabled) return;
    const feedback = String(formData.get("feedback") || "").trim();
    if (!feedback) return;
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/checkin/reply", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkinId, feedback }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to send feedback");
      }
      setState("sent");
    } catch (err: any) {
      setState("error");
      setError(err?.message || "Failed to send feedback");
    }
  };

  return (
    <form action={onSubmit} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <label className="text-sm text-white/70">Coaching Feedback</label>
      <textarea
        name="feedback"
        rows={4}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2"
        placeholder="Actionable coaching feedback"
        disabled={disabled || state === "sent"}
      />
      <button
        type="submit"
        disabled={disabled || state === "sending" || state === "sent"}
        className="rounded-lg bg-white px-4 py-2 text-black font-semibold disabled:opacity-60"
      >
        {state === "sending" ? "Sending..." : state === "sent" ? "Sent" : "Send Feedback"}
      </button>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </form>
  );
}
