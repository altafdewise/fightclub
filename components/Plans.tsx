"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";
import { PricingCountryCodeSelect } from "@/components/PricingCountryCodeSelect";
import { Reveal } from "@/components/Reveal";
import {
  coachingPlans,
  countryOptions,
  DEFAULT_CURRENCY,
  formatCurrency,
  getCountryFromPhoneCode,
  getPhoneCountryOption,
  getPhonePlaceholder,
  getCurrencyFromPhoneCode,
  getPaymentLink,
  getPaymentProviderFromPhoneCode,
  getPlanById,
  getPriceForPlan,
  getSavingsLabel,
  preferredContactMethods,
  trainingExperienceOptions,
  type CurrencyCode,
  type PhoneCountryKey,
  type PlanId,
} from "@/lib/pricing";
import { cn } from "@/utils/cn";

type LeadFormState = {
  fullName: string;
  phoneCountryKey: PhoneCountryKey;
  phoneNumber: string;
  email: string;
  country: string;
  fitnessGoal: string;
  preferredContactMethod: string;
  trainingExperience: string;
};

type LeadFormErrors = Partial<Record<keyof LeadFormState, string>>;

const phonePattern = /[0-9]/g;

function getDefaultPhoneCountryKey(): PhoneCountryKey {
  if (typeof window === "undefined") return "US";

  const language = window.navigator.language || "";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const region = language.split("-")[1]?.toUpperCase();

  const regionMap: Record<string, PhoneCountryKey> = {
    AU: "AU",
    BD: "BD",
    CA: "CA",
    DE: "DE",
    ES: "ES",
    FR: "FR",
    GB: "GB",
    IN: "IN",
    IT: "IT",
    LK: "LK",
    MY: "MY",
    NL: "NL",
    NP: "NP",
    NZ: "NZ",
    PK: "PK",
    SA: "SA",
    SG: "SG",
    ZA: "ZA",
    AE: "AE",
  };

  if (region && regionMap[region]) return regionMap[region];
  if (timeZone === "Asia/Kolkata") return "IN";
  return "US";
}

function createDefaultForm(phoneCountryKey: PhoneCountryKey): LeadFormState {
  const option = getPhoneCountryOption(phoneCountryKey);

  return {
    fullName: "",
    phoneCountryKey,
    phoneNumber: "",
    email: "",
    country: option.country,
    fitnessGoal: "",
    preferredContactMethod: preferredContactMethods[0].value,
    trainingExperience: trainingExperienceOptions[0].value,
  };
}

function validateLeadForm(form: LeadFormState): LeadFormErrors {
  const errors: LeadFormErrors = {};
  const digits = (form.phoneNumber.match(phonePattern) || []).join("");

  if (form.fullName.trim().length < 2) {
    errors.fullName = "Enter your full name.";
  }

  if (digits.length < 8 || digits.length > 15) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email.";
  }

  return errors;
}

function getWhatsAppLink(planTitle: string) {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/[^\d]/g, "");
  if (!number) return "";
  const message = encodeURIComponent(`I want help choosing the ${planTitle} option.`);
  return `https://wa.me/${number}?text=${message}`;
}

export default function Plans() {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [leadUnlocked, setLeadUnlocked] = useState(false);
  const [form, setForm] = useState<LeadFormState>(() => createDefaultForm("US"));
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "details">("form");

  const selectedPhoneOption = getPhoneCountryOption(form.phoneCountryKey);
  const selectedPlan = selectedPlanId ? getPlanById(selectedPlanId) : null;
  const selectedPrice = selectedPlanId ? getPriceForPlan(selectedPlanId, currency) : null;
  const selectedProvider = selectedPlanId ? getPaymentProviderFromPhoneCode(selectedPhoneOption.dialCode) : null;
  const paymentLink = selectedPlanId && selectedProvider ? getPaymentLink(selectedPlanId, selectedProvider) : "";
  const coachLink = selectedPlan ? getWhatsAppLink(selectedPlan.title) : "";

  useEffect(() => {
    const detectedKey = getDefaultPhoneCountryKey();
    const detectedOption = getPhoneCountryOption(detectedKey);
    setForm((prev) => ({
      ...prev,
      phoneCountryKey: detectedKey,
      country: detectedOption.country,
    }));
    setCurrency(detectedOption.currency);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const openPlan = (planId: PlanId) => {
    setSelectedPlanId(planId);
    setSubmitError("");
    setErrors({});
    setStep(leadUnlocked ? "details" : "form");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSubmitError("");
    setErrors({});
  };

  const handleInputChange = (key: keyof LeadFormState, value: string) => {
    setForm((prev) => {
      if (key === "phoneCountryKey") {
        const currentOption = getPhoneCountryOption(prev.phoneCountryKey);
        const nextOption = getPhoneCountryOption(value);
        setCurrency(nextOption.currency);
        return {
          ...prev,
          phoneCountryKey: nextOption.key,
          country:
            !prev.country || prev.country === currentOption.country
              ? nextOption.country
              : prev.country,
        };
      }
      if (key === "country") {
        const nextCurrency =
          value === "India" || getPhoneCountryOption(prev.phoneCountryKey).dialCode === "+91"
            ? "INR"
            : getCurrencyFromPhoneCode(getPhoneCountryOption(prev.phoneCountryKey).dialCode);
        setCurrency(nextCurrency);
        return { ...prev, country: value };
      }
      if (key === "phoneNumber") {
        return { ...prev, phoneNumber: value.replace(/\D/g, "") };
      }
      return { ...prev, [key]: value };
    });

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedPlanId) return;

    const nextErrors = validateLeadForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/pricing-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phoneCountryCode: selectedPhoneOption.dialCode,
          country: form.country || selectedPhoneOption.country,
          currency,
          planId: selectedPlanId,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to unlock pricing right now.");
      }

      setLeadUnlocked(true);
      setStep("details");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to unlock pricing right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="pricing" className="py-24 relative">
      <div className="section-space">
        <Reveal>
          <div className="text-center mb-8 md:mb-10">
            <p className="text-muted mb-1">Choose a coaching commitment.</p>
            <h2 className="text-3xl md:text-4xl font-bold text-text">Pricing & Commitments</h2>
            <p className="mt-4 text-sm text-white/55 max-w-2xl mx-auto leading-relaxed">
              Unlock plan details and pricing after a short form.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
          {coachingPlans.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 90}>
              <article
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent p-8 md:p-10 backdrop-blur-xl transition-all duration-500 shadow-[0_0_60px_-10px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-white/20 hover:from-white/[0.1] hover:via-white/[0.05] hover:shadow-[0_0_80px_-10px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]",
                  plan.featured && "border-[rgba(201,168,106,0.22)] shadow-[0_0_70px_-18px_rgba(201,168,106,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]"
                )}
              >
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {!plan.featured ? (
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-white/55">
                          {plan.eyebrow}
                        </span>
                      ) : null}
                      {plan.featured ? (
                        <span className="rounded-full border border-[rgba(201,168,106,0.28)] bg-[rgba(201,168,106,0.1)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
                          Most Popular
                        </span>
                      ) : null}
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-text">{plan.title}</h3>
                      <p className="mt-2 text-sm md:text-base text-white/60">{plan.support}</p>
                    </div>
                  </div>
                </div>

                <p className="mb-8 text-sm leading-relaxed text-white/62">{plan.description}</p>

                <button
                  type="button"
                  onClick={() => openPlan(plan.id)}
                  className="mb-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-5 py-4 text-sm font-semibold text-white transition-all duration-300 hover:border-white/30 hover:bg-white/[0.15] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.2)]"
                >
                  <LockKeyhole className="h-4 w-4" />
                  Unlock Pricing
                </button>

                <div className="flex-grow">
                  <ul className="space-y-4">
                    {plan.inclusions.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(201,168,106,0.16)]">
                          <Check className="h-3 w-3 text-[var(--gold)]" />
                        </div>
                        <span className="text-sm text-white/72">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {isOpen && selectedPlan && selectedPrice ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 px-0 backdrop-blur-md md:items-center md:px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pricing-modal-title"
          onClick={closeModal}
        >
          <div
            className="relative flex max-h-[92svh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,15,17,0.98),rgba(7,8,10,0.98))] shadow-[0_30px_90px_rgba(0,0,0,0.6)] md:rounded-[32px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute inset-x-0 top-0 mx-auto mt-3 h-1.5 w-14 rounded-full bg-white/15 md:hidden" />
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/75 transition hover:border-white/20 hover:text-white"
              aria-label="Close pricing modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid gap-0 overflow-y-auto md:grid-cols-[0.92fr_1.08fr]">
              <div className="border-b border-white/8 bg-white/[0.02] p-6 md:border-b-0 md:border-r md:p-8">
                <p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-white/45">Pricing Access</p>
                <h3 id="pricing-modal-title" className="text-2xl md:text-3xl font-semibold">
                  {selectedPlan.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/62">{selectedPlan.description}</p>

                <div className="mt-6 rounded-[22px] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">What this includes</p>
                  <ul className="mt-4 space-y-3">
                    {selectedPlan.inclusions.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-white/74">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {step === "form" ? (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Step 1</p>
                      <h4 className="mt-2 text-2xl font-semibold text-white">Unlock plan details</h4>
                      <p className="mt-2 text-sm leading-relaxed text-white/58">
                        View plan details and pricing after a quick form.
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex flex-col gap-2 text-sm text-white/80 md:col-span-2">
                        Full Name *
                        <input
                          value={form.fullName}
                          onChange={(event) => handleInputChange("fullName", event.target.value)}
                          className={cn(
                            "rounded-[14px] px-4 py-3.5",
                            errors.fullName && "border-red-300/70 focus:border-red-300 focus:shadow-none"
                          )}
                          placeholder="Your full name"
                        />
                        {errors.fullName ? <span className="text-xs text-red-300">{errors.fullName}</span> : null}
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-white/80 md:col-span-2">
                        <span className="text-[var(--gold)]">Phone Number *</span>
                        <div
                          className={cn(
                            "relative z-20 flex items-stretch rounded-[16px] border bg-[rgba(201,168,106,0.06)] transition duration-300 focus-within:border-[rgba(201,168,106,0.42)] focus-within:shadow-[0_0_0_3px_rgba(201,168,106,0.14)]",
                            errors.phoneNumber ? "border-red-300/70" : "border-[rgba(201,168,106,0.28)]"
                          )}
                        >
                          <div className="w-[148px] shrink-0 border-r border-white/10 sm:w-[188px]">
                            <PricingCountryCodeSelect
                              value={form.phoneCountryKey}
                              onChange={(nextValue) => handleInputChange("phoneCountryKey", nextValue)}
                              invalid={!!errors.phoneNumber}
                            />
                          </div>
                          <input
                            value={form.phoneNumber}
                            onChange={(event) => handleInputChange("phoneNumber", event.target.value)}
                            inputMode="tel"
                            className={cn(
                              "min-w-0 flex-1 rounded-r-[14px] border-0 bg-transparent px-4 py-3.5 text-white placeholder:text-white/30 focus:border-0 focus:outline-none focus:ring-0 focus:shadow-none"
                            )}
                            placeholder={getPhonePlaceholder(selectedPhoneOption.dialCode)}
                          />
                        </div>
                        {errors.phoneNumber ? <span className="text-xs text-red-300">{errors.phoneNumber}</span> : null}
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-white/80">
                        Email *
                        <input
                          value={form.email}
                          onChange={(event) => handleInputChange("email", event.target.value)}
                          type="email"
                          className={cn(
                            "rounded-[14px] px-4 py-3.5",
                            errors.email && "border-red-300/70 focus:border-red-300 focus:shadow-none"
                          )}
                          placeholder="you@example.com"
                        />
                        {errors.email ? <span className="text-xs text-red-300">{errors.email}</span> : null}
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-white/80">
                        Country
                        <select
                          value={form.country}
                          onChange={(event) => handleInputChange("country", event.target.value)}
                          className="rounded-[14px] px-4 py-3.5"
                        >
                          {countryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-white/80">
                        Fitness Goal
                        <input
                          value={form.fitnessGoal}
                          onChange={(event) => handleInputChange("fitnessGoal", event.target.value)}
                          className="rounded-[14px] px-4 py-3.5"
                          placeholder="Fat loss, strength, body recomposition"
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-white/80">
                        Preferred Contact
                        <select
                          value={form.preferredContactMethod}
                          onChange={(event) => handleInputChange("preferredContactMethod", event.target.value)}
                          className="rounded-[14px] px-4 py-3.5"
                        >
                          {preferredContactMethods.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="flex flex-col gap-2 text-sm text-white/80 md:col-span-2">
                        Current Training Experience
                        <select
                          value={form.trainingExperience}
                          onChange={(event) => handleInputChange("trainingExperience", event.target.value)}
                          className="rounded-[14px] px-4 py-3.5"
                        >
                          {trainingExperienceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    {submitError ? <p className="text-sm text-red-300">{submitError}</p> : null}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="submit"
                        disabled={submitting}
                        className={cn(
                          "inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-70",
                          submitting && "hover:bg-white"
                        )}
                      >
                        {submitting ? "Unlocking..." : "Unlock Pricing"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Step 2</p>
                      <h4 className="mt-2 text-2xl font-semibold text-white">Plan details unlocked</h4>
                      <p className="mt-2 text-sm leading-relaxed text-white/58">
                        Your pricing is shown in {currency}. Checkout automatically routes through{" "}
                        {selectedProvider === "razorpay" ? "Razorpay" : "Stripe"} based on your region.
                      </p>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <div className="flex flex-wrap items-start justify-between gap-5">
                        <div>
                          <p className="text-xs uppercase tracking-[0.16em] text-white/45">{selectedPlan.support}</p>
                          <h5 className="mt-2 text-2xl font-semibold text-white">{selectedPlan.title}</h5>
                        </div>
                        <div className="rounded-full border border-[rgba(201,168,106,0.24)] bg-[rgba(201,168,106,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--gold)]">
                          {selectedProvider === "razorpay" ? "Razorpay Checkout" : "Stripe Checkout"}
                        </div>
                      </div>

                      <div className="mt-6">
                        {selectedPrice.original ? (
                          <div className="flex items-end gap-3">
                            <span className="text-lg text-white/35 line-through">
                              {formatCurrency(selectedPrice.original, currency)}
                            </span>
                            <span className="text-4xl font-bold text-white">
                              {formatCurrency(selectedPrice.current, currency)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-4xl font-bold text-white">
                            {formatCurrency(selectedPrice.current, currency)}
                          </div>
                        )}

                        {selectedPrice.original ? (
                          <p className="mt-3 text-sm text-[var(--gold)]">
                            Save {getSavingsLabel(selectedPlan.id, currency)} with this commitment.
                          </p>
                        ) : (
                          <p className="mt-3 text-sm text-white/56">A focused reset without a longer lock-in.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-[rgba(201,168,106,0.14)] bg-[rgba(201,168,106,0.06)] p-5">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--gold)]" />
                        <div>
                          <p className="text-sm font-semibold text-white">Secure checkout</p>
                          <p className="mt-1 text-sm leading-relaxed text-white/58">
                            Encrypted payment flow. Your coach receives your details after enrollment so onboarding can start quickly.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      {paymentLink ? (
                        <a
                          href={paymentLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-white/92"
                        >
                          Continue with {selectedProvider === "razorpay" ? "Razorpay" : "Stripe"}
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-5 py-3.5 text-sm font-semibold text-white/45"
                        >
                          Checkout link pending configuration
                        </button>
                      )}

                      {coachLink ? (
                        <a
                          href={coachLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
                        >
                          Talk to Coach
                        </a>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/55">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="transition hover:text-white"
                      >
                        Compare another plan
                      </button>
                      <span className="text-white/20">/</span>
                      <button
                        type="button"
                        onClick={() => setStep("form")}
                        className="transition hover:text-white"
                      >
                        Edit your details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
