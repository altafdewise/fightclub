"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/utils/cn";

type Props = { type: "viewer" | "boxer" };

type Form = {
  fullName: string;
  email: string;
  phone: string;
  bookingId: string;
  upiId: string;
  amountInr: string;
  reason: string;
};

const EMPTY: Form = {
  fullName: "",
  email: "",
  phone: "",
  bookingId: "",
  upiId: "",
  amountInr: "",
  reason: "",
};

export function RefundForm({ type }: Props) {
  const roleLabel = type === "boxer" ? "Boxer" : "Spectator";
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof Form, string>> = {};
    if (!form.fullName.trim()) errs.fullName = "Required.";
    if (!form.email.trim() || !/.+@.+\..+/.test(form.email)) errs.email = "Valid email required.";
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) errs.phone = "Valid 10-digit mobile required.";
    if (!/^[\w.\-]{2,}@[\w.\-]{2,}$/.test(form.upiId.trim())) errs.upiId = "Valid UPI ID required (e.g. name@bank).";
    if (!form.reason.trim()) errs.reason = "Tell us why.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/fightclub/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not submit request.");
      setDone(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="section-space py-24">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <p className="fc-kicker mb-2">{roleLabel} refund</p>
            <h1 className="fc-display text-[clamp(2rem,8vw,2.8rem)] text-[var(--fc-text)]">
              Request a refund
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--fc-muted)]">
              Send your details and UPI ID. We&apos;ll review your reason and process the refund
              to your UPI manually.
            </p>
          </div>

          {done ? (
            <div className="fc-card p-8 text-center">
              <p className="fc-kicker mb-3">Received</p>
              <h2 className="mb-3 text-xl font-bold uppercase tracking-tight text-[var(--fc-text)]">
                Request submitted
              </h2>
              <p className="text-sm leading-relaxed text-[var(--fc-muted)]">
                We&apos;ve got your refund request. Once reviewed, the amount will be sent to your
                UPI ID. You&apos;ll be contacted on the phone/email you provided.
              </p>
              <Link href="/fightclub" className="btn-blood-ghost mt-7 inline-flex">
                Back to Fight Club
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="fc-card space-y-5 p-8">
              {serverError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {serverError}
                </p>
              )}

              <Field label="Full name" error={errors.fullName}>
                <input name="fullName" value={form.fullName} onChange={change} autoComplete="name"
                  className={cn("w-full rounded-xl px-3 py-3", errors.fullName && "!border-red-500")} />
              </Field>

              <Field label="Email" error={errors.email}>
                <input name="email" type="email" value={form.email} onChange={change} autoComplete="email"
                  placeholder="you@example.com"
                  className={cn("w-full rounded-xl px-3 py-3", errors.email && "!border-red-500")} />
              </Field>

              <Field label="Phone (Indian mobile)" error={errors.phone}>
                <input name="phone" type="tel" inputMode="numeric" maxLength={10} value={form.phone}
                  onChange={change} placeholder="9876543210"
                  className={cn("w-full rounded-xl px-3 py-3", errors.phone && "!border-red-500")} />
              </Field>

              <Field label="Booking ID (optional)" error={errors.bookingId}>
                <input name="bookingId" value={form.bookingId} onChange={change}
                  placeholder="From your ticket email, if you have it"
                  className="w-full rounded-xl px-3 py-3 font-mono" />
              </Field>

              <Field label="UPI ID (where to send the refund)" error={errors.upiId}>
                <input name="upiId" value={form.upiId} onChange={change} autoCapitalize="none"
                  spellCheck={false} placeholder="name@bank"
                  className={cn("w-full rounded-xl px-3 py-3", errors.upiId && "!border-red-500")} />
              </Field>

              <Field label="Amount paid (₹, optional)" error={errors.amountInr}>
                <input name="amountInr" type="number" inputMode="numeric" min={0} value={form.amountInr}
                  onChange={change} placeholder="e.g. 199"
                  className="w-full rounded-xl px-3 py-3" />
              </Field>

              <Field label="Reason for refund" error={errors.reason}>
                <textarea name="reason" rows={4} value={form.reason} onChange={change}
                  placeholder="Briefly tell us why you're requesting a refund."
                  className={cn("w-full resize-y rounded-xl px-3 py-3", errors.reason && "!border-red-500")} />
              </Field>

              <button type="submit" disabled={loading} className="btn-blood w-full">
                {loading ? "Submitting…" : "Submit refund request"}
              </button>
              <p className="text-center text-xs text-[var(--fc-muted)]">
                Refunds are reviewed manually and sent to your UPI ID.
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-[var(--fc-text)]">{label}</span>
      {children}
      {error && <span className="text-sm text-red-300">{error}</span>}
    </label>
  );
}
