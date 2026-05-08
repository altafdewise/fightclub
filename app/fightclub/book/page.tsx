"use client";

import { useState, useRef } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/utils/cn";

type FormState = { name: string; email: string; phone: string; tickets: number };
type FieldErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!form.email.trim() || !/.+@.+\..+/.test(form.email))
    errors.email = "Enter a valid email address.";
  if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, "")))
    errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (form.tickets < 1 || form.tickets > 4) errors.tickets = "Choose between 1 and 4 tickets.";
  return errors;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open: () => void };
  }
}

export default function BookPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", tickets: 1 });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const razorpayReady = useRef(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "tickets" ? Number(value) : value }));
    if (errors[name as keyof FormState]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }
    setLoading(true);

    try {
      const orderRes = await fetch("/api/fightclub/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets: form.tickets }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Failed to create order.");

      if (orderData.free) {
        await confirmBooking({ orderId: orderData.orderId });
      } else {
        openRazorpay(orderData.orderId);
      }
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  function openRazorpay(orderId: string) {
    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Switch to rzp_live_ for production
      order_id: orderId,
      currency: "INR",
      name: "Fight Club Hyderabad",
      description: "Season One",
      prefill: { name: form.name, email: form.email, contact: form.phone },
      theme: { color: "#e63c1e" },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        await confirmBooking({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
      },
      modal: { ondismiss: () => setLoading(false) },
    });
    rzp.open();
  }

  async function confirmBooking({
    orderId,
    paymentId,
    signature,
  }: {
    orderId: string;
    paymentId?: string;
    signature?: string;
  }) {
    try {
      const res = await fetch("/api/fightclub/confirm-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          name: form.name,
          email: form.email,
          phone: form.phone,
          tickets: form.tickets,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Could not confirm booking.");
      router.push(
        `/fightclub/success?bookingId=${encodeURIComponent(data.bookingId)}&name=${encodeURIComponent(form.name)}&tickets=${form.tickets}`
      );
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Could not confirm booking.");
      setLoading(false);
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => { razorpayReady.current = true; }}
        strategy="lazyOnload"
      />
      <Navbar />
      <main className="section-space py-24">
        <div className="mx-auto max-w-lg">
          {/* Heading — centered */}
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#e63c1e]">
              Fight Club Hyderabad · Season One
            </p>
            <h1 className="text-[clamp(1.9rem,7vw,2.5rem)] font-semibold text-[var(--text)]">
              Book Your Spot
            </h1>
            <div className="mt-3 flex items-baseline justify-center gap-3">
              <span className="text-lg font-medium text-[#e63c1e] line-through">₹499</span>
              <span className="text-3xl font-bold text-[var(--text)]">₹0</span>
              <span className="text-sm text-[var(--muted)]">per ticket · Season One</span>
            </div>
          </div>

          {/* Form — inputs left-aligned for readability, card centered on page */}
          <form
            onSubmit={handleSubmit}
            noValidate
            className="glass space-y-5 rounded-3xl border border-[var(--border)] p-8 md:p-10"
          >
            {serverError && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {serverError}
              </p>
            )}

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-[var(--text)]">Full name</span>
              <input
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                className={cn("rounded-xl px-3 py-3", errors.name && "!border-red-500")}
              />
              {errors.name && <span className="text-sm text-red-300">{errors.name}</span>}
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-[var(--text)]">Email</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={cn("rounded-xl px-3 py-3", errors.email && "!border-red-500")}
              />
              {errors.email && <span className="text-sm text-red-300">{errors.email}</span>}
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-[var(--text)]">Phone (Indian mobile)</span>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                placeholder="9876543210"
                maxLength={10}
                value={form.phone}
                onChange={handleChange}
                className={cn("rounded-xl px-3 py-3", errors.phone && "!border-red-500")}
              />
              {errors.phone && <span className="text-sm text-red-300">{errors.phone}</span>}
            </label>

            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-[var(--text)]">Number of tickets</span>
              <select
                name="tickets"
                value={form.tickets}
                onChange={handleChange}
                className="rounded-xl px-3 py-3"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "ticket" : "tickets"}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
              <span className="text-sm text-[var(--muted)]">
                Total ({form.tickets} {form.tickets === 1 ? "ticket" : "tickets"})
              </span>
              <span className="flex items-baseline gap-2">
                <span className="text-sm text-[#e63c1e] line-through">₹{499 * form.tickets}</span>
                <span className="text-xl font-bold text-[var(--text)]">₹0</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "btn-fight inline-flex w-full items-center justify-center",
                loading && "pointer-events-none opacity-60"
              )}
            >
              {loading ? "Booking…" : "Confirm Booking — Free"}
            </button>

            <p className="text-center text-xs text-[var(--muted)]">
              Confirmation email sent instantly. Join the WhatsApp broadcast for fight night updates.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
