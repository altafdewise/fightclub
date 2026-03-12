export type CurrencyCode = "USD" | "INR";
export type PaymentProvider = "stripe" | "razorpay";
export type PlanId = "1m" | "3m" | "6m";
export type CountryCodeValue = string;
export type PhoneCountryKey = string;

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
  { value: "", label: "Use country code", currency: "USD" },
  { value: "India", label: "India", currency: "INR" },
  { value: "United States", label: "United States", currency: "USD" },
  { value: "United Kingdom", label: "United Kingdom", currency: "USD" },
  { value: "Canada", label: "Canada", currency: "USD" },
  { value: "Australia", label: "Australia", currency: "USD" },
  { value: "Singapore", label: "Singapore", currency: "USD" },
  { value: "United Arab Emirates", label: "United Arab Emirates", currency: "USD" },
  { value: "Other International", label: "Other International", currency: "USD" },
];

export type PhoneCountryOption = {
  key: PhoneCountryKey;
  country: string;
  dialCode: CountryCodeValue;
  label: string;
  searchText: string;
  placeholder: string;
  currency: CurrencyCode;
};

export const phoneCountryCodeOptions: PhoneCountryOption[] = [
  { key: "US", country: "United States", dialCode: "+1", label: "+1 United States", searchText: "united states us usa international +1", placeholder: "5551234567", currency: "USD" },
  { key: "CA", country: "Canada", dialCode: "+1", label: "+1 Canada", searchText: "canada ca +1", placeholder: "4165551234", currency: "USD" },
  { key: "IN", country: "India", dialCode: "+91", label: "+91 India", searchText: "india in +91", placeholder: "9876543210", currency: "INR" },
  { key: "GB", country: "United Kingdom", dialCode: "+44", label: "+44 United Kingdom", searchText: "united kingdom uk britain gb +44", placeholder: "7400123456", currency: "USD" },
  { key: "AU", country: "Australia", dialCode: "+61", label: "+61 Australia", searchText: "australia au +61", placeholder: "412345678", currency: "USD" },
  { key: "AE", country: "United Arab Emirates", dialCode: "+971", label: "+971 United Arab Emirates", searchText: "uae united arab emirates ae dubai +971", placeholder: "501234567", currency: "USD" },
  { key: "SA", country: "Saudi Arabia", dialCode: "+966", label: "+966 Saudi Arabia", searchText: "saudi arabia sa +966", placeholder: "512345678", currency: "USD" },
  { key: "SG", country: "Singapore", dialCode: "+65", label: "+65 Singapore", searchText: "singapore sg +65", placeholder: "81234567", currency: "USD" },
  { key: "MY", country: "Malaysia", dialCode: "+60", label: "+60 Malaysia", searchText: "malaysia my +60", placeholder: "123456789", currency: "USD" },
  { key: "DE", country: "Germany", dialCode: "+49", label: "+49 Germany", searchText: "germany de deutschland +49", placeholder: "15123456789", currency: "USD" },
  { key: "FR", country: "France", dialCode: "+33", label: "+33 France", searchText: "france fr +33", placeholder: "612345678", currency: "USD" },
  { key: "NL", country: "Netherlands", dialCode: "+31", label: "+31 Netherlands", searchText: "netherlands nl holland +31", placeholder: "612345678", currency: "USD" },
  { key: "IT", country: "Italy", dialCode: "+39", label: "+39 Italy", searchText: "italy it +39", placeholder: "3123456789", currency: "USD" },
  { key: "ES", country: "Spain", dialCode: "+34", label: "+34 Spain", searchText: "spain es +34", placeholder: "612345678", currency: "USD" },
  { key: "ZA", country: "South Africa", dialCode: "+27", label: "+27 South Africa", searchText: "south africa za +27", placeholder: "821234567", currency: "USD" },
  { key: "NZ", country: "New Zealand", dialCode: "+64", label: "+64 New Zealand", searchText: "new zealand nz +64", placeholder: "211234567", currency: "USD" },
  { key: "PK", country: "Pakistan", dialCode: "+92", label: "+92 Pakistan", searchText: "pakistan pk +92", placeholder: "3012345678", currency: "USD" },
  { key: "BD", country: "Bangladesh", dialCode: "+880", label: "+880 Bangladesh", searchText: "bangladesh bd +880", placeholder: "1712345678", currency: "USD" },
  { key: "NP", country: "Nepal", dialCode: "+977", label: "+977 Nepal", searchText: "nepal np +977", placeholder: "9812345678", currency: "USD" },
  { key: "LK", country: "Sri Lanka", dialCode: "+94", label: "+94 Sri Lanka", searchText: "sri lanka lk +94", placeholder: "711234567", currency: "USD" },
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
  return countryOptions.find((option) => option.value === country) || countryOptions[2];
}

export function getPhoneCountryOption(key: PhoneCountryKey) {
  return phoneCountryCodeOptions.find((option) => option.key === key) || phoneCountryCodeOptions[0];
}

export function isSupportedDialCode(dialCode: CountryCodeValue) {
  return phoneCountryCodeOptions.some((option) => option.dialCode === dialCode);
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

export function getCountryFromPhoneCode(phoneCountryCode: CountryCodeValue) {
  return phoneCountryCodeOptions.find((option) => option.dialCode === phoneCountryCode)?.country || "United States";
}

export function getCurrencyFromPhoneCode(phoneCountryCode: CountryCodeValue): CurrencyCode {
  return phoneCountryCode === "+91" ? "INR" : "USD";
}

export function getPaymentProviderFromPhoneCode(phoneCountryCode: CountryCodeValue): PaymentProvider {
  return phoneCountryCode === "+91" ? "razorpay" : "stripe";
}

export function getPhonePlaceholder(phoneCountryCode: CountryCodeValue) {
  return phoneCountryCodeOptions.find((option) => option.dialCode === phoneCountryCode)?.placeholder || "5551234567";
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
