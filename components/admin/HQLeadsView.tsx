"use client";

import { useState } from "react";
import { Mail, MessageCircle, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { getPlanById, type CurrencyCode, type PaymentProvider, type PlanId } from "@/lib/pricing";
import { type PricingLeadRecord, type PricingLeadStatus } from "@/lib/pricingLeads";

type HQLeadsViewProps = {
  initialLeads: PricingLeadRecord[];
};

const statusLabels: Record<PricingLeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  paid: "Paid",
};

const statusClasses: Record<PricingLeadStatus, string> = {
  new: "border-white/12 bg-white/[0.04] text-white/75",
  contacted: "border-[rgba(201,168,106,0.2)] bg-[rgba(201,168,106,0.08)] text-[var(--gold)]",
  paid: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatPlan(planId: PlanId) {
  return getPlanById(planId)?.title || planId;
}

function formatProvider(provider: PaymentProvider) {
  return provider === "razorpay" ? "Razorpay" : "Stripe";
}

function formatCurrency(code: CurrencyCode) {
  return code === "INR" ? "INR" : "USD";
}

function toWhatsAppHref(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}`;
}

export function HQLeadsView({ initialLeads }: HQLeadsViewProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) || null;

  const updateStatus = async (leadId: string, status: PricingLeadStatus) => {
    setError(null);
    setUpdatingStatus(`${leadId}:${status}`);

    try {
      const response = await fetch(`/api/hq/leads/${leadId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Unable to update lead.");
      }

      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? data.lead : lead)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update lead.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {leads.length === 0 ? (
        <div className="rounded-[24px] border border-white/15 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-6 md:p-8 text-center text-white/60">
          No pricing leads yet.
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[24px] border border-white/12 bg-[rgba(10,12,15,0.92)] shadow-[0_0_60px_-10px_rgba(255,255,255,0.06)] lg:block">
            <div className="grid grid-cols-[1.1fr_0.95fr_1fr_0.9fr_0.9fr_0.7fr_0.9fr_0.7fr_1.3fr] gap-4 border-b border-white/8 px-5 py-4 text-xs uppercase tracking-[0.14em] text-white/40">
              <span>Name</span>
              <span>Timestamp</span>
              <span>Phone</span>
              <span>Country</span>
              <span>Plan</span>
              <span>Currency</span>
              <span>Checkout</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {leads.map((lead) => (
              <div
                key={lead.id}
                className="grid grid-cols-[1.1fr_0.95fr_1fr_0.9fr_0.9fr_0.7fr_0.9fr_0.7fr_1.3fr] gap-4 border-b border-white/6 px-5 py-4 text-sm text-white/75 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{lead.full_name}</p>
                  <p className="truncate text-xs text-white/45">{lead.email}</p>
                </div>
                <span className="text-white/55">{formatDate(lead.created_at)}</span>
                <span className="truncate">{lead.phone_number}</span>
                <span className="truncate">{lead.country}</span>
                <span className="truncate">{formatPlan(lead.plan_id)}</span>
                <span>{formatCurrency(lead.currency)}</span>
                <span>{formatProvider(lead.provider)}</span>
                <span className={cn("inline-flex h-fit w-fit rounded-full border px-3 py-1 text-xs font-semibold", statusClasses[lead.status])}>
                  {statusLabels[lead.status]}
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08]"
                  >
                    View
                  </button>
                  <a
                    href={toWhatsAppHref(lead.phone_number)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08]"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${lead.email}`}
                    className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08]"
                  >
                    Email
                  </a>
                  <button
                    type="button"
                    onClick={() => updateStatus(lead.id, "contacted")}
                    disabled={updatingStatus === `${lead.id}:contacted`}
                    className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08] disabled:opacity-50"
                  >
                    Mark Contacted
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(lead.id, "paid")}
                    disabled={updatingStatus === `${lead.id}:paid`}
                    className="rounded-lg border border-[rgba(201,168,106,0.2)] bg-[rgba(201,168,106,0.08)] px-3 py-2 text-xs font-semibold text-[var(--gold)] transition hover:bg-[rgba(201,168,106,0.14)] disabled:opacity-50"
                  >
                    Mark Paid
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:hidden">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-[24px] border border-white/12 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-5 shadow-[0_0_50px_-12px_rgba(255,255,255,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{lead.full_name}</h3>
                    <p className="text-sm text-white/50">{lead.email}</p>
                  </div>
                  <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-semibold", statusClasses[lead.status])}>
                    {statusLabels[lead.status]}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-white/65">
                  <p>{lead.phone_number}</p>
                  <p>{lead.country}</p>
                  <p>{formatPlan(lead.plan_id)}</p>
                  <p>{formatCurrency(lead.currency)} • {formatProvider(lead.provider)}</p>
                  <p>{formatDate(lead.created_at)}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08]"
                  >
                    View
                  </button>
                  <a
                    href={toWhatsAppHref(lead.phone_number)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08]"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${lead.email}`}
                    className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08]"
                  >
                    Email
                  </a>
                  <button
                    type="button"
                    onClick={() => updateStatus(lead.id, "contacted")}
                    disabled={updatingStatus === `${lead.id}:contacted`}
                    className="rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.08] disabled:opacity-50"
                  >
                    Mark Contacted
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(lead.id, "paid")}
                    disabled={updatingStatus === `${lead.id}:paid`}
                    className="rounded-lg border border-[rgba(201,168,106,0.2)] bg-[rgba(201,168,106,0.08)] px-3 py-2 text-xs font-semibold text-[var(--gold)] transition hover:bg-[rgba(201,168,106,0.14)] disabled:opacity-50"
                  >
                    Mark Paid
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedLead ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-end bg-black/70 backdrop-blur-sm md:items-stretch" onClick={() => setSelectedLeadId(null)}>
          <div
            className="max-h-[92svh] w-full overflow-y-auto rounded-t-[24px] border border-white/10 bg-[rgba(9,11,14,0.98)] p-5 shadow-[-20px_0_60px_rgba(0,0,0,0.45)] sm:p-6 md:h-full md:max-h-none md:max-w-xl md:rounded-none md:border-l md:border-t-0"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/45">Lead Details</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{selectedLead.full_name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadId(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/75 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-8 grid gap-4">
              {[
                ["Lead ID", selectedLead.id],
                ["Full Name", selectedLead.full_name],
                ["Email", selectedLead.email],
                ["Phone", selectedLead.phone_number],
                ["Country", selectedLead.country],
                ["Fitness Goal", selectedLead.fitness_goal || "N/A"],
                ["Preferred Contact", selectedLead.preferred_contact_method || "N/A"],
                ["Training Experience", selectedLead.training_experience || "N/A"],
                ["Selected Plan", formatPlan(selectedLead.plan_id)],
                ["Currency", formatCurrency(selectedLead.currency)],
                ["Checkout Method", formatProvider(selectedLead.provider)],
                ["Status", statusLabels[selectedLead.status]],
                ["Submitted", formatDate(selectedLead.created_at)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">{label}</p>
                  <p className="mt-2 break-words text-sm text-white/82">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={toWhatsAppHref(selectedLead.phone_number)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`mailto:${selectedLead.email}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
