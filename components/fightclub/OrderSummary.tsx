import { PRICING, type EntryType } from "@/lib/fightclub/config";

function formatRupees(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function OrderSummary({ type, quantity = 1 }: { type: EntryType; quantity?: number }) {
  const plan = PRICING[type];
  const unit = plan.price;
  const qty = type === "viewer" ? quantity : 1;
  const total = unit * qty;

  return (
    <div className="fc-card p-5">
      <div className="flex items-center justify-between gap-4 text-sm text-[var(--fc-muted)]">
        {type === "challenge" ? (
          <>
            <span>{plan.label}</span>
            <span className="text-lg font-bold text-[var(--fc-text)]">Razorpay</span>
          </>
        ) : (
          <>
            <span>
              {plan.label} · {formatRupees(unit)}
              {type === "viewer" && qty > 1 ? ` × ${qty}` : ""}
            </span>
            <span className="text-lg font-bold text-[var(--fc-text)]">
              {formatRupees(total)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
