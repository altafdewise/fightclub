"use client";

import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";

const goals = ["Fat loss", "Muscle gain", "Recomp", "Performance"];
const timezones = [
  "US / Pacific (UTC-08:00)",
  "US / Mountain (UTC-07:00)",
  "US / Central (UTC-06:00)",
  "US / Eastern (UTC-05:00)",
  "UK / Ireland (UTC+00:00)",
  "Europe / Central (UTC+01:00)",
  "Europe / Eastern (UTC+02:00)",
  "India (UTC+05:30)",
  "Singapore / Hong Kong (UTC+08:00)",
  "Australia / Eastern (UTC+10:00)",
];

function validateEmail(email: string) {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
}

export function ConsultForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    goal: goals[0],
    timezone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const whatsappNumber = useMemo(() => process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+91XXXXXXXXXX", []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const redirectToWhatsApp = () => {
    const digitsOnly = whatsappNumber.replace(/[^\d]/g, "");
    const text = encodeURIComponent(
      `Hi, I'm ${form.name}. Goal: ${form.goal}. Timezone: ${form.timezone || "not provided"}.`
    );
    window.location.href = `https://wa.me/${digitsOnly}?text=${text}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      setError("Please fill in the required fields.");
      return;
    }
    if (!validateEmail(form.email)) {
      setError("Enter a valid email.");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Unable to submit right now.");
      }

      setStatus("success");
      setTimeout(() => redirectToWhatsApp(), 900);
    } catch (err: any) {
      setStatus("error");
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 md:p-10 space-y-5 border border-[var(--border)] max-w-3xl w-full">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-semibold">Book a consult</h1>
        <p className="text-muted">Tell us what you need; we’ll respond with a plan that fits your schedule.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-2 text-sm">
          Full name *
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            className="rounded-xl px-3 py-3"
            placeholder="Alex Doe"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Email *
          <input
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            type="email"
            required
            className="rounded-xl px-3 py-3"
            placeholder="you@example.com"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          WhatsApp number *
          <input
            value={form.whatsapp}
            onChange={(e) => handleChange("whatsapp", e.target.value)}
            required
            className="rounded-xl px-3 py-3"
            placeholder="+00 12345 67890"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Timezone
         <select
           value={form.timezone}
           onChange={(e) => handleChange("timezone", e.target.value)}
           className="rounded-xl px-3 py-3"
         >
            <option value="">Select timezone / region</option>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
         </select>
        </label>
        <label className="flex flex-col gap-2 text-sm">
          Primary goal
          <select
            value={form.goal}
            onChange={(e) => handleChange("goal", e.target.value)}
            className="rounded-xl px-3 py-3"
          >
            {goals.map((goal) => (
              <option key={goal}>{goal}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm md:col-span-2">
          Message
          <textarea
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
            rows={4}
            className="rounded-xl px-3 py-3"
            placeholder="Anything else we should know?"
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {status === "success" && <p className="text-sm text-green-300">Submitted. Redirecting to WhatsApp…</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className={cn(
          "btn-primary inline-flex items-center justify-center",
          status === "sending" && "opacity-70 cursor-not-allowed"
        )}
      >
        {status === "sending" ? "Sending..." : "Book a consult"}
      </button>
    </form>
  );
}

