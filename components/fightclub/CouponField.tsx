"use client";

import { cn } from "@/utils/cn";

// Discreet coupon field for offline cash sales at the gate.
// The actual code is validated server-side — this just collects input.
export function CouponField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <details className="rounded-xl border border-[var(--fc-line)] bg-[rgba(0,0,0,0.25)] open:bg-[rgba(0,0,0,0.35)]">
      <summary
        className={cn(
          "cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fc-muted)] hover:text-[var(--fc-ember)]",
          value && "text-[var(--fc-ember)]"
        )}
      >
        Have a coupon code?
      </summary>
      <div className="border-t border-[var(--fc-line)] p-4">
        <input
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="Enter code"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl px-3 py-3 text-sm font-mono uppercase tracking-[0.12em]"
        />
        <p className="mt-2 text-[11px] text-[var(--fc-muted)]">
          For offline cash sales. Code is validated at checkout.
        </p>
      </div>
    </details>
  );
}
