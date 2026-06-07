import { PRICING, type EntryType } from "@/lib/fightclub/config";

export function OrderSummary({ type, quantity = 1 }: { type: EntryType; quantity?: number }) {
  const plan = PRICING[type];
  const unit = plan.price;
  const qty = type === "viewer" ? quantity : 1;
  const total = unit * qty;

  return (
    <div className="fc-card p-5">
      <div className="flex items-center justify-between gap-4 text-sm text-[var(--fc-muted)]">
        <span>
          {plan.label} · ₹{unit.toLocaleString("en-IN")}
          {type === "viewer" && qty > 1 ? ` × ${qty}` : ""}
        </span>
        <span className="text-lg font-bold text-[var(--fc-text)]">₹{total.toLocaleString("en-IN")}</span>
      </div>
    </div>
  );
}
