"use client";

import type { EntryType } from "@/lib/fightclub/config";

declare global {
  interface Window {
    // Must match the same global declaration in app/fightclub/book/page.tsx.
    Razorpay: new (options: Record<string, any>) => { open: () => void }; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

/** Loads the Razorpay checkout script once. */
export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface CheckoutPerson {
  fullName: string;
  email: string;
  phone: string;
}

export interface ConfirmExtras {
  // Boxer-only payload merged into the confirm request.
  boxer?: {
    weightKg: number | null;
    weightClass: string | null;
    experience: string | null;
    experienceYears: number | null;
    selfieUrl: string | null;
  };
  acknowledgementId?: string;
}

/**
 * Creates an order, opens Razorpay (UPI highlighted), verifies + confirms
 * server-side, and returns the booking id. Records failed/abandoned attempts.
 */
export async function startCheckout(opts: {
  type: EntryType;
  quantity?: number;
  person: CheckoutPerson;
  extras?: ConfirmExtras;
  couponCode?: string;
  onError: (msg: string) => void;
  onDismiss: () => void;
}): Promise<{ bookingId: string; type: string } | null> {
  // 1. Create order — server computes amount and decides whether this is a
  //    coupon comp (free, no Razorpay) or a real Razorpay round-trip
  //    (including the PBC1 ₹1 coupon, which still pays through Razorpay).
  const orderRes = await fetch("/api/fightclub/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: opts.type,
      quantity: opts.quantity,
      fullName: opts.person.fullName,
      email: opts.person.email,
      phone: opts.person.phone,
      couponCode: opts.couponCode || undefined,
      // Boxer extras need to ride along on the coupon path because there
      // is no second confirm-booking call to attach them.
      boxer: opts.extras?.boxer,
      acknowledgementId: opts.extras?.acknowledgementId,
    }),
  });
  const order = await orderRes.json();
  if (!orderRes.ok) {
    opts.onError(order.message || "Could not create order.");
    return null;
  }

  // Coupon comp path — booking was already inserted + emailed server-side.
  if (order.free === true && order.bookingId) {
    return { bookingId: String(order.bookingId), type: String(order.type || opts.type) };
  }

  // Need the payment gateway now (regular price or the ₹1 PBC1 coupon).
  const ok = await loadRazorpay();
  if (!ok) {
    opts.onError("Could not load the payment gateway. Check your connection.");
    return null;
  }

  // 2. Open Razorpay and resolve when the server confirms (or null on dismiss).
  return new Promise((resolve) => {
    const rzp = new window.Razorpay({
      key: order.keyId, // public checkout key — swap to rzp_live_ via env
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "Fight Club",
      description: opts.type === "boxer" ? "Boxer entry · Series Two" : "Viewer admission · Series Two",
      prefill: {
        name: opts.person.fullName,
        email: opts.person.email,
        contact: opts.person.phone,
      },
      theme: { color: "#8b0000" },
      config: {
        // Surface UPI first in the checkout.
        display: {
          blocks: { upi: { name: "Pay via UPI", instruments: [{ method: "upi" }] } },
          sequence: ["block.upi"],
          preferences: { show_default_blocks: true },
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const confirmRes = await fetch("/api/fightclub/confirm-booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              boxer: opts.extras?.boxer,
              acknowledgementId: opts.extras?.acknowledgementId,
            }),
          });
          const data = await confirmRes.json();
          if (!confirmRes.ok) {
            opts.onError(data.message || "Could not confirm booking.");
            resolve(null);
            return;
          }
          resolve({ bookingId: data.bookingId, type: data.type });
        } catch {
          opts.onError("Could not confirm booking.");
          resolve(null);
        }
      },
      modal: {
        ondismiss: () => {
          // Record the abandonment so it shows up in admin.
          void fetch("/api/fightclub/mark-failed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ razorpay_order_id: order.orderId }),
          });
          opts.onDismiss();
          resolve(null);
        },
      },
    });
    rzp.open();
  });
}
