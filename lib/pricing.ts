export type CurrencyCode = "USD" | "INR";
export type PaymentProvider = "stripe" | "razorpay";
export type PlanId = "1m" | "3m" | "6m";

type PricePoint = {
  current: number;
  original?: number;
};

type CountryOption = {
  value: string;
  label: string;
  currency: CurrencyCode;
};

type ContactMethod = {
  value: string;
  label: string;
};

type TrainingExperience = {
  value: string;
  label: string;
};

type CoachingPlan = {
  id: PlanId;
  title: string;
  support: string;
  description: string;
  inclusions: string[];
  prices: Record<CurrencyCode, PricePoint>;
  eyebrow?: string;
  featured?: boolean;
};

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const currencyOptions: { value: CurrencyCode; label: string; support: string }[] = [
  { value: "USD", label: "USD", support: "International billing" },
  { value: "INR", label: "INR", support: "India billing" },
];

export const countryOptions: CountryOption[] = [
  { value: "India", label: "India", currency: "INR" },
  { value: "United States", label: "United States", currency: "USD" },
  { value: "United Kingdom", label: "United Kingdom", currency: "USD" },
  { value: "Canada", label: "Canada", currency: "USD" },
  { value: "Australia", label: "Australia", currency: "USD" },
  { value: "Singapore", label: "Singapore", currency: "USD" },
  { value: "United Arab Emirates", label: "United Arab Emirates", currency: "USD" },
  { value: "Other International", label: "Other International", currency: "USD" },
];

export const preferredContactMethods: ContactMethod[] = [
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Phone Call", label: "Phone Call" },
  { value: "Email", label: "Email" },
];

export const trainingExperienceOptions: TrainingExperience[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export const coachingPlans: CoachingPlan[] = [
  {
    id: "1m",
    title: "1-Month Coaching",
    support: "Built for focused short-term momentum.",
    description: "A focused reset for clients who need structure, accountability, and immediate traction.",
    eyebrow: "Starter commitment",
    inclusions: [
      "Personalized training structure",
      "Nutrition guidance",
      "Weekly check-ins",
      "Progress tracking",
      "Best for people starting or resetting",
    ],
    prices: {
      USD: { current: 199 },
      INR: { current: 16900 },
    },
  },
  {
    id: "3m",
    title: "3-Month Coaching",
    support: "Built for structure and momentum.",
    description: "The strongest entry point for serious progress, consistent execution, and visible change.",
    eyebrow: "Most popular",
    featured: true,
    inclusions: [
      "Personalized training plan",
      "Nutrition guidance",
      "Weekly check-ins and adjustments",
      "Progress tracking",
      "Better habit formation and measurable body transformation",
    ],
    prices: {
      USD: { current: 499, original: 600 },
      INR: { current: 41900, original: 49900 },
    },
  },
  {
    id: "6m",
    title: "6-Month Coaching",
    support: "Built for long-term transformation.",
    description: "A longer runway for deeper body composition change, stronger habits, and tighter accountability.",
    eyebrow: "Highest accountability",
    inclusions: [
      "Long-term personalized training",
      "Advanced nutrition strategy",
      "Weekly check-ins with deeper feedback",
      "Lifestyle and recovery support",
      "Higher accountability and a deeper transformation arc",
    ],
    prices: {
      USD: { current: 799, original: 1200 },
      INR: { current: 66900, original: 99900 },
    },
  },
];

export function getCountryOption(country: string) {
  return countryOptions.find((option) => option.value === country) || countryOptions[1];
}

export function getPriceForPlan(planId: PlanId, currency: CurrencyCode) {
  return coachingPlans.find((plan) => plan.id === planId)?.prices[currency];
}

export function getPlanById(planId: PlanId) {
  return coachingPlans.find((plan) => plan.id === planId);
}

export function getCurrencyFromCountry(country: string): CurrencyCode {
  return country === "India" ? "INR" : "USD";
}

export function getPaymentProvider(country: string, currency: CurrencyCode): PaymentProvider {
  return country === "India" || currency === "INR" ? "razorpay" : "stripe";
}

export function formatCurrency(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getSavingsLabel(planId: PlanId, currency: CurrencyCode) {
  const price = getPriceForPlan(planId, currency);
  if (!price?.original) return null;
  return formatCurrency(price.original - price.current, currency);
}

export function getPaymentLink(planId: PlanId, provider: PaymentProvider) {
  const envMap: Record<PaymentProvider, Record<PlanId, string | undefined>> = {
    stripe: {
      "1m": process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_1M,
      "3m": process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_3M,
      "6m": process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_6M,
    },
    razorpay: {
      "1m": process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK_1M,
      "3m": process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK_3M,
      "6m": process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_LINK_6M,
    },
  };

  return envMap[provider][planId] || "";
}
