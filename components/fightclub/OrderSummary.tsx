import { PRICING, type EntryType } from "@/lib/fightclub/config";

export function OrderSummary({ type, quantity = 1 }: { type: EntryType; quantity?: number }) {
  const unit = type === "viewer" ? PRICING.viewer.price : PRICING.boxer.price;
  const qty = type === "viewer" ? quantity : 1;
  const total = unit * qty;

  return (
    <div className="fc-card p-5">
      <div className="flex items-center justify-between text-sm text-[var(--fc-muted)]">
        <span>
          {type === "viewer" ? PRICING.viewer.label : PRICING.boxer.label} · ₹{unit}
          {type === "viewer" && qty > 1 ? ` × ${qty}` : ""}
        </span>
        <span className="text-lg font-bold text-[var(--fc-text)]">₹{total}</span>
      </div>
    </div>
  );
}
