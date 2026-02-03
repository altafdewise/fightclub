"use client";

import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";

const goals = ["Fat loss", "Muscle gain", "Recomp", "Performance", "Cycle syncing", "Other"];
const countryCodes = [
  { code: "+1", label: "US (+1)" },
  { code: "+1", label: "CA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+61", label: "AU (+61)" },
  { code: "+64", label: "NZ (+64)" },
  { code: "+65", label: "SG (+65)" },
  { code: "+91", label: "IN (+91)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+966", label: "KSA (+966)" },
  { code: "+49", label: "DE (+49)" },
  { code: "+33", label: "FR (+33)" },
  { code: "+34", label: "ES (+34)" },
  { code: "+39", label: "IT (+39)" },
  { code: "+31", label: "NL (+31)" },
  { code: "+46", label: "SE (+46)" },
  { code: "+55", label: "BR (+55)" },
  { code: "+52", label: "MX (+52)" },
  { code: "OTHER", label: "Other" },
];

function validateEmail(email: string) {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
}

export function ConsultForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    countryCode: countryCodes[0].code,
    customCountryCode: "",
    whatsapp: "",
    goal: goals[0],
    customGoal: "",
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
    const selectedGoal = form.goal === "Other" ? form.customGoal : form.goal;
    const text = encodeURIComponent(
      `Hi, I'm ${form.name}. Goal: ${selectedGoal || "not provided"}.`
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
    if (form.countryCode === "OTHER" && !form.customCountryCode.trim()) {
      setError("Please enter your country code.");
      return;
    }
    if (form.goal === "Other" && !form.customGoal.trim()) {
      setError("Please enter your primary goal.");
      return;
    }
    if (!validateEmail(form.email)) {
      setError("Enter a valid email.");
      return;
    }

    setStatus("sending");

    try {
      const selectedCode = form.countryCode === "OTHER" ? form.customCountryCode : form.countryCode;
      const selectedGoal = form.goal === "Other" ? form.customGoal : form.goal;
      const payload = {
        ...form,
        goal: selectedGoal,
        whatsapp: `${selectedCode} ${form.whatsapp}`.trim(),
      };
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          <div className="flex gap-2">
            <select
              value={form.countryCode}
              onChange={(e) => handleChange("countryCode", e.target.value)}
              className="rounded-xl px-3 py-3 w-[120px]"
            >
              {countryCodes.map((code) => (
                <option key={`${code.label}-${code.code}`} value={code.code}>
                  {code.label}
                </option>
              ))}
            </select>
            <input
              value={form.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
              required
              className="rounded-xl px-3 py-3 flex-1"
              placeholder="12345 67890"
            />
          </div>
          {form.countryCode === "OTHER" && (
            <input
              value={form.customCountryCode}
              onChange={(e) => handleChange("customCountryCode", e.target.value)}
              className="rounded-xl px-3 py-3"
              placeholder="+00"
            />
          )}
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
          {form.goal === "Other" && (
            <input
              value={form.customGoal}
              onChange={(e) => handleChange("customGoal", e.target.value)}
              className="rounded-xl px-3 py-3"
              placeholder="Your primary goal"
            />
          )}
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

