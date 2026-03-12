import { query } from "@/lib/db";
import {
  type CurrencyCode,
  type PaymentProvider,
  type PlanId,
  getCountryOption,
  getCurrencyFromCountry,
  getPaymentLink,
  getPaymentProvider,
  getPlanById,
} from "@/lib/pricing";

export type PricingLeadInput = {
  fullName: string;
  phoneNumber: string;
  email: string;
  country: string;
  currency: CurrencyCode;
  planId: PlanId;
  fitnessGoal?: string;
  preferredContactMethod?: string;
  trainingExperience?: string;
};

export type StoredPricingLead = PricingLeadInput & {
  id: string;
  provider: PaymentProvider;
  paymentLink: string;
};

const phoneDigits = /[0-9]/g;

function cleanValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validatePricingLead(input: Record<string, unknown>) {
  const fullName = cleanValue(input.fullName);
  const phoneNumber = cleanValue(input.phoneNumber);
  const email = cleanValue(input.email).toLowerCase();
  const country = cleanValue(input.country);
  const requestedCurrency = cleanValue(input.currency) as CurrencyCode;
  const planId = cleanValue(input.planId) as PlanId;
  const fitnessGoal = cleanValue(input.fitnessGoal);
  const preferredContactMethod = cleanValue(input.preferredContactMethod);
  const trainingExperience = cleanValue(input.trainingExperience);

  if (fullName.length < 2) {
    throw new Error("Enter your full name.");
  }

  const numericPhone = (phoneNumber.match(phoneDigits) || []).join("");
  if (numericPhone.length < 8 || numericPhone.length > 15) {
    throw new Error("Enter a valid phone number.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  if (!getPlanById(planId)) {
    throw new Error("Choose a valid coaching plan.");
  }

  const normalizedCountry = getCountryOption(country).value;
  const normalizedCurrency = requestedCurrency === "INR" || normalizedCountry === "India" ? "INR" : "USD";

  return {
    fullName,
    phoneNumber,
    email,
    country: normalizedCountry,
    currency: normalizedCurrency,
    planId,
    fitnessGoal,
    preferredContactMethod,
    trainingExperience,
  } satisfies PricingLeadInput;
}

export async function ensurePricingLeadsTable() {
  await query(`
    create table if not exists pricing_leads (
      id uuid primary key default gen_random_uuid(),
      full_name text not null,
      phone_number text not null,
      email text not null,
      country text not null,
      currency text not null check (currency in ('USD', 'INR')),
      plan_id text not null check (plan_id in ('1m', '3m', '6m')),
      provider text not null check (provider in ('stripe', 'razorpay')),
      fitness_goal text null,
      preferred_contact_method text null,
      training_experience text null,
      payment_link text null,
      admin_notified_at timestamptz null,
      notification_error text null,
      created_at timestamptz not null default now()
    )
  `);

  await query(`
    create index if not exists pricing_leads_created_at_idx
      on pricing_leads (created_at desc)
  `);
}

export async function createPricingLead(input: PricingLeadInput): Promise<StoredPricingLead> {
  const derivedCurrency = input.country === "India" ? "INR" : getCurrencyFromCountry(input.country);
  const currency = input.currency === "INR" || derivedCurrency === "INR" ? "INR" : "USD";
  const provider = getPaymentProvider(input.country, currency);
  const paymentLink = getPaymentLink(input.planId, provider);

  const inserted = await query<{
    id: string;
  }>(
    `insert into pricing_leads (
      full_name,
      phone_number,
      email,
      country,
      currency,
      plan_id,
      provider,
      fitness_goal,
      preferred_contact_method,
      training_experience,
      payment_link
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    returning id`,
    [
      input.fullName,
      input.phoneNumber,
      input.email,
      input.country,
      currency,
      input.planId,
      provider,
      input.fitnessGoal || null,
      input.preferredContactMethod || null,
      input.trainingExperience || null,
      paymentLink || null,
    ]
  );

  return {
    ...input,
    currency,
    id: inserted.rows[0].id,
    provider,
    paymentLink,
  };
}

export async function markPricingLeadNotified(leadId: string) {
  await query(
    `update pricing_leads
     set admin_notified_at = now(), notification_error = null
     where id = $1`,
    [leadId]
  );
}

export async function markPricingLeadNotificationError(leadId: string, message: string) {
  await query(
    `update pricing_leads
     set notification_error = $2
     where id = $1`,
    [leadId, message.slice(0, 500)]
  );
}

export function getPricingLeadSummary(lead: StoredPricingLead) {
  const plan = getPlanById(lead.planId);

  return {
    planTitle: plan?.title || lead.planId,
    providerName: lead.provider === "razorpay" ? "Razorpay" : "Stripe",
  };
}
