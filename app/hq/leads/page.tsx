import { requireHQ } from "@/lib/auth";
import { HQLeadsView } from "@/components/admin/HQLeadsView";
import { HQNavigation } from "@/components/admin/HQNavigation";
import { listPricingLeads } from "@/lib/pricingLeads";

export default async function HQLeadsPage() {
  await requireHQ();
  const leads = await listPricingLeads();

  return (
    <section className="section-space py-16 space-y-8">
      <HQNavigation />

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.15em] text-white/45 font-medium">Headquarters</p>
        <h1 className="text-3xl md:text-4xl font-bold text-white">Pricing Leads</h1>
        <p className="text-sm text-white/58">
          Review new leads, open details, and move them through contact to payment.
        </p>
      </div>

      <HQLeadsView initialLeads={leads} />
    </section>
  );
}
