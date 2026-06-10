"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/utils/cn";
import { BOOKINGS_OPEN, PRICING } from "@/lib/fightclub/config";
import { OrderSummary } from "@/components/fightclub/OrderSummary";
import { CouponField } from "@/components/fightclub/CouponField";
import { SoldOut } from "@/components/fightclub/SoldOut";
import { startCheckout } from "@/components/fightclub/checkout";

type FormState = { name: string; email: string; phone: string; quantity: number };
type FieldErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim() || !/.+@.+\..+/.test(form.email)) errors.email = "Enter a valid email.";
  if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Enter a valid 10 digit Indian mobile number.";
  if (form.quantity < 1 || form.quantity > PRICING.viewer.maxQty) errors.quantity = "Choose 1 to 4 tickets.";
  return errors;
}

export default function WatchPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", quantity: 1 });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [coupon, setCoupon] = useState("");
  const hasCoupon = coupon.trim().length > 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "quantity" ? Number(value) : value }));
    if (errors[name as keyof FormState]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);

    const result = await startCheckout({
      type: "viewer",
      quantity: form.quantity,
      person: { fullName: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() },
      couponCode: coupon.trim() || undefined,
      onError: (msg) => {
        setServerError(msg);
        setLoading(false);
      },
      onDismiss: () => setLoading(false),
    });

    if (result) {
      router.push(
        `/fightclub/success?bookingId=${encodeURIComponent(result.bookingId)}&name=${encodeURIComponent(form.name)}&type=viewer&qty=${form.quantity}`
      );
    }
  }

  if (!BOOKINGS_OPEN) return <SoldOut />;

  return (
    <>
      <Navbar />
      <main className="section-space py-24">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 text-center">
            <p className="fc-kicker mb-2">Spectator</p>
            <h1 className="fc-display text-[clamp(2.2rem,8vw,3rem)] text-[var(--fc-text)]">Watch</h1>
            <p className="mt-3 text-[var(--fc-muted)]">
              ₹{PRICING.viewer.price} per ticket. Ringside for the carnage.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="fc-card space-y-5 p-8 md:p-10">
            {serverError && (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {serverError}
              </p>
            )}

            <Field label="Full name" error={errors.name}>
              <input
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                className={cn("w-full rounded-xl px-3 py-3", errors.name && "!border-red-500")}
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={cn("w-full rounded-xl px-3 py-3", errors.email && "!border-red-500")}
              />
            </Field>

            <Field label="Phone (Indian mobile)" error={errors.phone}>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={form.phone}
                onChange={handleChange}
                className={cn("w-full rounded-xl px-3 py-3", errors.phone && "!border-red-500")}
              />
            </Field>

            <Field label="Number of tickets" error={errors.quantity}>
              <select
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className="w-full rounded-xl px-3 py-3"
              >
                {Array.from({ length: PRICING.viewer.maxQty }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "ticket" : "tickets"}
                  </option>
                ))}
              </select>
            </Field>

            <OrderSummary type="viewer" quantity={form.quantity} />

            <CouponField value={coupon} onChange={setCoupon} disabled={loading} />

            <button type="submit" disabled={loading} className="btn-blood w-full">
              {loading
                ? hasCoupon
                  ? "Booking…"
                  : "Opening payment…"
                : hasCoupon
                ? "Apply coupon & book"
                : `Pay INR ${PRICING.viewer.price * form.quantity} with UPI`}
            </button>

            <p className="text-center text-xs text-[var(--fc-muted)]">
              Secure payment via Razorpay. Ticket emailed instantly on success.
            </p>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link href="/fightclub/enter" className="text-[var(--fc-muted)] hover:text-[var(--fc-ember)]">
              Wrong door? Go back
            </Link>
          </p>
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
