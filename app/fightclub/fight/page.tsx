"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/utils/cn";
import { PRICING, EXPERIENCE_OPTIONS, WEIGHT_CLASSES } from "@/lib/fightclub/config";
import { Stepper } from "@/components/fightclub/Stepper";
import { AckChecklist, type AckResult } from "@/components/fightclub/AckChecklist";
import { SelfieCapture } from "@/components/fightclub/SelfieCapture";
import { OrderSummary } from "@/components/fightclub/OrderSummary";
import { CouponField } from "@/components/fightclub/CouponField";
import { startCheckout } from "@/components/fightclub/checkout";

const STEPS = ["Acknowledge", "Details", "Selfie", "Pay"];

type Details = {
  name: string;
  weightClass: string;
  experience: string;
  experienceYears: string;
  email: string;
  phone: string;
};

export default function FightPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // strict order — can't jump ahead

  const [ack, setAck] = useState<AckResult | null>(null);
  const [details, setDetails] = useState<Details>({
    name: "",
    weightClass: "",
    experience: "",
    experienceYears: "",
    email: "",
    phone: "",
  });
  const [selfiePath, setSelfiePath] = useState<string | null>(null);
  const [detailErrors, setDetailErrors] = useState<Partial<Record<keyof Details, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [coupon, setCoupon] = useState("");
  const hasCoupon = coupon.trim().length > 0;

  // ── Step 1 done ──────────────────────────────────────────────────
  function onAcknowledged(result: AckResult) {
    setAck(result);
    setDetails((d) => ({ ...d, name: result.fullName }));
    setStep(1);
  }

  // ── Step 2: details ──────────────────────────────────────────────
  function onDetailChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setDetails((d) => ({ ...d, [name]: value }));
    setDetailErrors((errs) => ({ ...errs, [name]: undefined }));
  }

  function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    const errs: Partial<Record<keyof Details, string>> = {};
    if (!details.name.trim()) errs.name = "Name is required.";
    if (!details.email.trim() || !/.+@.+\..+/.test(details.email)) errs.email = "Valid email required.";
    if (!/^[6-9]\d{9}$/.test(details.phone.replace(/\s/g, "")))
      errs.phone = "Valid 10-digit Indian mobile required.";
    if (!details.weightClass) errs.weightClass = "Pick your weight division.";
    if (!details.experience) errs.experience = "Pick your experience level.";
    if (Object.keys(errs).length > 0) {
      setDetailErrors(errs);
      return;
    }
    setStep(2);
  }

  // ── Step 4: pay ──────────────────────────────────────────────────
  async function pay() {
    setServerError("");
    setLoading(true);
    const result = await startCheckout({
      type: "boxer",
      person: {
        fullName: details.name.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
      },
      extras: {
        acknowledgementId: ack?.acknowledgementId,
        boxer: {
          weightKg: null,
          weightClass: details.weightClass || null,
          experience: details.experience || null,
          experienceYears: details.experienceYears ? Number(details.experienceYears) : null,
          selfieUrl: selfiePath,
        },
      },
      couponCode: coupon.trim() || undefined,
      onError: (msg) => {
        setServerError(msg);
        setLoading(false);
      },
      onDismiss: () => setLoading(false),
    });

    if (result) {
      router.push(
        `/fightclub/success?bookingId=${encodeURIComponent(result.bookingId)}&name=${encodeURIComponent(details.name)}&type=boxer`
      );
    }
  }

  return (
    <>
      <Navbar />
      <main className="section-space py-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <p className="fc-kicker mb-2">Boxer</p>
            <h1 className="fc-display text-[clamp(2.2rem,8vw,3rem)] text-[var(--fc-text)]">Fight</h1>
            <p className="mt-3 text-[var(--fc-muted)]">
              ₹{PRICING.boxer.price} entry. Four steps. No skipping.
            </p>
          </div>

          <Stepper steps={STEPS} current={step} />

          {/* STEP 1 — ACKNOWLEDGEMENT */}
          {step === 0 && (
            <AckChecklist onDone={onAcknowledged} initialName={details.name} />
          )}

          {/* STEP 2 — DETAILS */}
          {step === 1 && (
            <form onSubmit={submitDetails} noValidate className="mx-auto max-w-lg space-y-5 fc-card p-8">
              <DetailField label="Full name" error={detailErrors.name}>
                <input
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={details.name}
                  onChange={onDetailChange}
                  className={cn("w-full rounded-xl px-3 py-3", detailErrors.name && "!border-red-500")}
                />
              </DetailField>

              <DetailField label="Email" error={detailErrors.email}>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={details.email}
                  onChange={onDetailChange}
                  className={cn("w-full rounded-xl px-3 py-3", detailErrors.email && "!border-red-500")}
                />
              </DetailField>

              <DetailField label="Phone (Indian mobile)" error={detailErrors.phone}>
                <input
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  value={details.phone}
                  onChange={onDetailChange}
                  className={cn("w-full rounded-xl px-3 py-3", detailErrors.phone && "!border-red-500")}
                />
              </DetailField>

              <DetailField label="Weight division" error={detailErrors.weightClass}>
                <select
                  name="weightClass"
                  value={details.weightClass}
                  onChange={onDetailChange}
                  className={cn("w-full rounded-xl px-3 py-3", detailErrors.weightClass && "!border-red-500")}
                >
                  <option value="">Select your division…</option>
                  {WEIGHT_CLASSES.map((c) => (
                    <option key={c.label} value={c.label}>
                      {c.label} ({c.range})
                    </option>
                  ))}
                </select>
              </DetailField>

              <DetailField label="Experience" error={detailErrors.experience}>
                <select
                  name="experience"
                  value={details.experience}
                  onChange={onDetailChange}
                  className={cn("w-full rounded-xl px-3 py-3", detailErrors.experience && "!border-red-500")}
                >
                  <option value="">Select…</option>
                  {EXPERIENCE_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </DetailField>

              <DetailField label="Years of experience (optional)">
                <input
                  name="experienceYears"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={50}
                  placeholder="e.g. 2"
                  value={details.experienceYears}
                  onChange={onDetailChange}
                  className="w-full rounded-xl px-3 py-3"
                />
              </DetailField>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="btn-blood-ghost flex-1">
                  Back
                </button>
                <button type="submit" className="btn-blood flex-1">
                  Next
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 — SELFIE */}
          {step === 2 && (
            <div>
              <SelfieCapture onUploaded={setSelfiePath} uploadedPath={selfiePath} />
              <div className="mx-auto mt-8 flex max-w-md gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-blood-ghost flex-1">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!selfiePath}
                  className="btn-blood flex-1"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — PAYMENT */}
          {step === 3 && (
            <div className="mx-auto max-w-lg space-y-5">
              <div className="fc-card space-y-3 p-6 text-sm">
                <Row label="Name" value={details.name} />
                <Row label="Division" value={details.weightClass} />
                <Row
                  label="Experience"
                  value={
                    details.experienceYears
                      ? `${details.experience} · ${details.experienceYears} yr`
                      : details.experience
                  }
                />
                <Row label="Selfie" value={selfiePath ? "Captured ✓" : "Missing"} />
              </div>

              <OrderSummary type="boxer" />

              <CouponField value={coupon} onChange={setCoupon} disabled={loading} />

              {serverError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {serverError}
                </p>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-blood-ghost flex-1">
                  Back
                </button>
                <button type="button" onClick={pay} disabled={loading} className="btn-blood flex-1">
                  {loading
                    ? hasCoupon
                      ? "Booking…"
                      : "Opening payment…"
                    : hasCoupon
                    ? "Apply coupon & book"
                    : `Pay ₹${PRICING.boxer.price} — UPI`}
                </button>
              </div>
              <p className="text-center text-xs text-[var(--fc-muted)]">
                Secure payment via Razorpay. Ticket emailed on success.
              </p>
            </div>
          )}

          <p className="mt-8 text-center text-sm">
            <Link href="/fightclub/enter" className="text-[var(--fc-muted)] hover:text-[var(--fc-ember)]">
              ← Wrong door? Go back
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function DetailField({
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--fc-line)] pb-2 last:border-0 last:pb-0">
      <span className="text-[var(--fc-muted)]">{label}</span>
      <span className="font-medium text-[var(--fc-text)]">{value}</span>
    </div>
  );
}
