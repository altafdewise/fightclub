"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { AckChecklist, type AckResult } from "@/components/fightclub/AckChecklist";
import { OrderSummary } from "@/components/fightclub/OrderSummary";
import { SelfieCapture } from "@/components/fightclub/SelfieCapture";
import { Stepper } from "@/components/fightclub/Stepper";
import { startCheckout, type ChallengeCheckoutPayload } from "@/components/fightclub/checkout";
import { CHALLENGE, EXPERIENCE_OPTIONS, WEIGHT_CLASSES, weightClassFor } from "@/lib/fightclub/config";
import { cn } from "@/utils/cn";

const STEPS = ["Acknowledge", "Challenge Form", "Selfie", "Pay"];
const STANCES = ["Orthodox", "Southpaw", "Switch", "Not sure"] as const;

type Details = {
  name: string;
  email: string;
  phone: string;
  age: string;
  city: string;
  instagram: string;
  heightCm: string;
  weightKg: string;
  weightClass: string;
  stance: string;
  experience: string;
  experienceYears: string;
  fightRecord: string;
  trainingGym: string;
  coachName: string;
  strengths: string;
  injuries: string;
  medicalConditions: string;
  availability: string;
  challengeReason: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  termsAccepted: boolean;
};

const initialDetails: Details = {
  name: "",
  email: "",
  phone: "",
  age: "",
  city: "",
  instagram: "",
  heightCm: "",
  weightKg: "",
  weightClass: "",
  stance: "",
  experience: "",
  experienceYears: "",
  fightRecord: "",
  trainingGym: "",
  coachName: "",
  strengths: "",
  injuries: "",
  medicalConditions: "",
  availability: "",
  challengeReason: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  termsAccepted: false,
};

export default function ChallengePurvikPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [ack, setAck] = useState<AckResult | null>(null);
  const [details, setDetails] = useState<Details>(initialDetails);
  const [errors, setErrors] = useState<Partial<Record<keyof Details, string>>>({});
  const [selfiePath, setSelfiePath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [clientNow, setClientNow] = useState<number | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setClientNow(Date.now()), 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const offerExpired =
    clientNow !== null && clientNow > new Date(CHALLENGE.deadlineIso).getTime();

  function onAcknowledged(result: AckResult) {
    setAck(result);
    setDetails((current) => ({ ...current, name: result.fullName }));
    setStep(1);
  }

  function onDetailChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setDetails((current) => {
      const next = { ...current, [name]: value };
      if (name === "weightKg") {
        const kg = Number(value);
        next.weightClass = Number.isFinite(kg) && kg > 0 ? weightClassFor(kg) : "";
      }
      return next;
    });
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function onTermsChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDetails((current) => ({ ...current, termsAccepted: e.target.checked }));
    setErrors((current) => ({ ...current, termsAccepted: undefined }));
  }

  function submitDetails(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateDetails(details);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setStep(2);
  }

  async function pay() {
    setServerError("");
    if (offerExpired) {
      setServerError(`The Purvik challenge offer closed on ${CHALLENGE.deadlineLabel}.`);
      return;
    }
    if (!ack || !selfiePath) {
      setServerError("Complete the acknowledgement and selfie before payment.");
      return;
    }

    setLoading(true);
    const payload = buildChallengePayload(details, selfiePath);
    const result = await startCheckout({
      type: "challenge",
      person: {
        fullName: details.name.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
      },
      extras: {
        acknowledgementId: ack.acknowledgementId,
        challenge: payload,
      },
      onError: (message) => {
        setServerError(message);
        setLoading(false);
      },
      onDismiss: () => setLoading(false),
    });

    if (result) {
      router.push(
        `/fightclub/success?bookingId=${encodeURIComponent(result.bookingId)}&name=${encodeURIComponent(details.name)}&type=challenge`
      );
    }
  }

  return (
    <>
      <Navbar />
      <main className="section-space py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <p className="fc-kicker mb-2">Premium challenge</p>
            <h1 className="fc-display text-[clamp(2.6rem,10vw,5rem)] text-[var(--fc-text)]">
              Challenge {CHALLENGE.targetName}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[var(--fc-muted)] sm:text-base">
              Valid till {CHALLENGE.deadlineLabel}. Detailed profile, acknowledgement, selfie, and Razorpay payment are required.
            </p>
          </div>

          <Stepper steps={STEPS} current={step} />

          {offerExpired && (
            <p className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300">
              This limited offer closed on {CHALLENGE.deadlineLabel}. Challenge payments are disabled.
            </p>
          )}

          {step === 0 && <AckChecklist onDone={onAcknowledged} initialName={details.name} />}

          {step === 1 && (
            <form onSubmit={submitDetails} noValidate className="fc-card mx-auto max-w-4xl space-y-8 p-6 sm:p-8">
              <FormBlock title="Identity">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Full legal name" error={errors.name}>
                    <input
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={details.name}
                      onChange={onDetailChange}
                      className={fieldClass(errors.name)}
                    />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={details.email}
                      onChange={onDetailChange}
                      className={fieldClass(errors.email)}
                    />
                  </Field>
                  <Field label="Phone (Indian mobile)" error={errors.phone}>
                    <input
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9876543210"
                      value={details.phone}
                      onChange={onDetailChange}
                      className={fieldClass(errors.phone)}
                    />
                  </Field>
                  <Field label="Age" error={errors.age}>
                    <input
                      name="age"
                      type="number"
                      inputMode="numeric"
                      min={18}
                      max={60}
                      value={details.age}
                      onChange={onDetailChange}
                      className={fieldClass(errors.age)}
                    />
                  </Field>
                  <Field label="City / area" error={errors.city}>
                    <input
                      name="city"
                      type="text"
                      placeholder="Hyderabad, Saroornagar, etc."
                      value={details.city}
                      onChange={onDetailChange}
                      className={fieldClass(errors.city)}
                    />
                  </Field>
                  <Field label="Instagram handle (optional)">
                    <input
                      name="instagram"
                      type="text"
                      placeholder="@username"
                      value={details.instagram}
                      onChange={onDetailChange}
                      className={fieldClass()}
                    />
                  </Field>
                </div>
              </FormBlock>

              <FormBlock title="Fight Profile">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Height (cm)" error={errors.heightCm}>
                    <input
                      name="heightCm"
                      type="number"
                      inputMode="numeric"
                      min={120}
                      max={220}
                      value={details.heightCm}
                      onChange={onDetailChange}
                      className={fieldClass(errors.heightCm)}
                    />
                  </Field>
                  <Field label="Current weight (kg)" error={errors.weightKg}>
                    <input
                      name="weightKg"
                      type="number"
                      inputMode="decimal"
                      min={35}
                      max={160}
                      value={details.weightKg}
                      onChange={onDetailChange}
                      className={fieldClass(errors.weightKg)}
                    />
                  </Field>
                  <Field label="Weight division" error={errors.weightClass}>
                    <select
                      name="weightClass"
                      value={details.weightClass}
                      onChange={onDetailChange}
                      className={fieldClass(errors.weightClass)}
                    >
                      <option value="">Select division...</option>
                      {WEIGHT_CLASSES.map((c) => (
                        <option key={c.label} value={c.label}>
                          {c.label} ({c.range})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Stance" error={errors.stance}>
                    <select name="stance" value={details.stance} onChange={onDetailChange} className={fieldClass(errors.stance)}>
                      <option value="">Select stance...</option>
                      {STANCES.map((stance) => (
                        <option key={stance} value={stance}>
                          {stance}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Experience level" error={errors.experience}>
                    <select
                      name="experience"
                      value={details.experience}
                      onChange={onDetailChange}
                      className={fieldClass(errors.experience)}
                    >
                      <option value="">Select...</option>
                      {EXPERIENCE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Years training" error={errors.experienceYears}>
                    <input
                      name="experienceYears"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={50}
                      value={details.experienceYears}
                      onChange={onDetailChange}
                      className={fieldClass(errors.experienceYears)}
                    />
                  </Field>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Field label="Fight record" error={errors.fightRecord}>
                    <input
                      name="fightRecord"
                      type="text"
                      placeholder="e.g. 2 amateur fights, 1 win 1 loss, smoker bouts, none"
                      value={details.fightRecord}
                      onChange={onDetailChange}
                      className={fieldClass(errors.fightRecord)}
                    />
                  </Field>
                  <Field label="Gym / training place" error={errors.trainingGym}>
                    <input
                      name="trainingGym"
                      type="text"
                      placeholder="Gym, academy, or independent"
                      value={details.trainingGym}
                      onChange={onDetailChange}
                      className={fieldClass(errors.trainingGym)}
                    />
                  </Field>
                  <Field label="Coach name (optional)">
                    <input
                      name="coachName"
                      type="text"
                      value={details.coachName}
                      onChange={onDetailChange}
                      className={fieldClass()}
                    />
                  </Field>
                  <Field label="Availability before fight night" error={errors.availability}>
                    <input
                      name="availability"
                      type="text"
                      placeholder="When can we call / verify / match you?"
                      value={details.availability}
                      onChange={onDetailChange}
                      className={fieldClass(errors.availability)}
                    />
                  </Field>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <Field label="Fighting strengths" error={errors.strengths}>
                    <textarea
                      name="strengths"
                      rows={4}
                      placeholder="Style, power, speed, cardio, wrestling background, etc."
                      value={details.strengths}
                      onChange={onDetailChange}
                      className={fieldClass(errors.strengths)}
                    />
                  </Field>
                  <Field label={`Why challenge ${CHALLENGE.targetName}?`} error={errors.challengeReason}>
                    <textarea
                      name="challengeReason"
                      rows={4}
                      placeholder="Tell us why this match should happen."
                      value={details.challengeReason}
                      onChange={onDetailChange}
                      className={fieldClass(errors.challengeReason)}
                    />
                  </Field>
                </div>
              </FormBlock>

              <FormBlock title="Safety and Contact">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Injuries" error={errors.injuries}>
                    <textarea
                      name="injuries"
                      rows={4}
                      placeholder="Write None if you have none."
                      value={details.injuries}
                      onChange={onDetailChange}
                      className={fieldClass(errors.injuries)}
                    />
                  </Field>
                  <Field label="Medical conditions" error={errors.medicalConditions}>
                    <textarea
                      name="medicalConditions"
                      rows={4}
                      placeholder="Write None if you have none."
                      value={details.medicalConditions}
                      onChange={onDetailChange}
                      className={fieldClass(errors.medicalConditions)}
                    />
                  </Field>
                  <Field label="Emergency contact name" error={errors.emergencyContactName}>
                    <input
                      name="emergencyContactName"
                      type="text"
                      value={details.emergencyContactName}
                      onChange={onDetailChange}
                      className={fieldClass(errors.emergencyContactName)}
                    />
                  </Field>
                  <Field label="Emergency contact phone" error={errors.emergencyContactPhone}>
                    <input
                      name="emergencyContactPhone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={details.emergencyContactPhone}
                      onChange={onDetailChange}
                      className={fieldClass(errors.emergencyContactPhone)}
                    />
                  </Field>
                </div>

                <label
                  className={cn(
                    "mt-5 flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition",
                    details.termsAccepted
                      ? "border-[var(--fc-blood-bright)] bg-[rgba(139,0,0,0.12)]"
                      : "border-[var(--fc-line)] bg-[rgba(0,0,0,0.25)]",
                    errors.termsAccepted && "!border-red-500"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={details.termsAccepted}
                    onChange={onTermsChange}
                    className="mt-0.5 h-5 w-5 flex-shrink-0 accent-[#a01010]"
                  />
                  <span className="text-sm font-medium leading-relaxed text-[var(--fc-text)]">
                    I understand this is a premium challenge entry against {CHALLENGE.targetName}, valid only until {CHALLENGE.deadlineLabel}, and that Fight Club may contact me to verify safety, eligibility, and match readiness.
                  </span>
                </label>
                {errors.termsAccepted && <p className="mt-2 text-sm text-red-300">{errors.termsAccepted}</p>}
              </FormBlock>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/fightclub" className="btn-blood-ghost flex-1 text-center">
                  Back
                </Link>
                <button type="submit" className="btn-blood flex-1">
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div>
              <SelfieCapture onUploaded={setSelfiePath} uploadedPath={selfiePath} />
              <div className="mx-auto mt-8 flex max-w-md gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-blood-ghost flex-1">
                  Back
                </button>
                <button type="button" onClick={() => setStep(3)} disabled={!selfiePath} className="btn-blood flex-1">
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mx-auto max-w-2xl space-y-5">
              <div className="fc-card space-y-3 p-6 text-sm">
                <Row label="Challenger" value={details.name} />
                <Row label="Target" value={CHALLENGE.targetName} />
                <Row label="Division" value={details.weightClass} />
                <Row label="Fight record" value={details.fightRecord} />
                <Row label="Emergency contact" value={`${details.emergencyContactName} · ${details.emergencyContactPhone}`} />
                <Row label="Selfie" value={selfiePath ? "Captured" : "Missing"} />
              </div>

              <OrderSummary type="challenge" />

              {serverError && (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {serverError}
                </p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => setStep(2)} className="btn-blood-ghost flex-1">
                  Back
                </button>
                <button type="button" onClick={pay} disabled={loading || offerExpired} className="btn-blood flex-1">
                  {loading ? "Opening payment..." : "Proceed to Payment"}
                </button>
              </div>
              <p className="text-center text-xs text-[var(--fc-muted)]">
                Secure payment via Razorpay. Offer valid only until {CHALLENGE.deadlineLabel}.
              </p>
            </div>
          )}

          <p className="mt-8 text-center text-sm">
            <Link href="/fightclub" className="text-[var(--fc-muted)] hover:text-[var(--fc-ember)]">
              Back to Fight Club
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function validateDetails(details: Details): Partial<Record<keyof Details, string>> {
  const nextErrors: Partial<Record<keyof Details, string>> = {};
  const phone = details.phone.replace(/\s/g, "");
  const emergencyPhone = details.emergencyContactPhone.replace(/\s/g, "");
  const age = Number(details.age);
  const height = Number(details.heightCm);
  const weight = Number(details.weightKg);
  const years = Number(details.experienceYears);

  if (!details.name.trim()) nextErrors.name = "Full name is required.";
  if (!details.email.trim() || !/.+@.+\..+/.test(details.email)) nextErrors.email = "Valid email required.";
  if (!/^[6-9]\d{9}$/.test(phone)) nextErrors.phone = "Valid 10 digit Indian mobile required.";
  if (!Number.isFinite(age) || age < 18 || age > 60) nextErrors.age = "Age must be between 18 and 60.";
  if (!details.city.trim()) nextErrors.city = "City or area is required.";
  if (!Number.isFinite(height) || height < 120 || height > 220) nextErrors.heightCm = "Enter a realistic height.";
  if (!Number.isFinite(weight) || weight < 35 || weight > 160) nextErrors.weightKg = "Enter a realistic weight.";
  if (!details.weightClass) nextErrors.weightClass = "Weight division is required.";
  if (!details.stance) nextErrors.stance = "Stance is required.";
  if (!details.experience) nextErrors.experience = "Experience level is required.";
  if (!Number.isFinite(years) || years < 0 || years > 50) nextErrors.experienceYears = "Enter training years.";
  if (!details.fightRecord.trim()) nextErrors.fightRecord = "Fight record is required.";
  if (!details.trainingGym.trim()) nextErrors.trainingGym = "Training place is required.";
  if (details.strengths.trim().length < 10) nextErrors.strengths = "Add at least 10 characters.";
  if (!details.injuries.trim()) nextErrors.injuries = "Write None if you have none.";
  if (!details.medicalConditions.trim()) nextErrors.medicalConditions = "Write None if you have none.";
  if (!details.availability.trim()) nextErrors.availability = "Availability is required.";
  if (details.challengeReason.trim().length < 20) nextErrors.challengeReason = "Add at least 20 characters.";
  if (!details.emergencyContactName.trim()) nextErrors.emergencyContactName = "Emergency contact is required.";
  if (!/^[6-9]\d{9}$/.test(emergencyPhone)) {
    nextErrors.emergencyContactPhone = "Valid 10 digit Indian mobile required.";
  }
  if (!details.termsAccepted) nextErrors.termsAccepted = "Accept the challenge terms to continue.";

  return nextErrors;
}

function buildChallengePayload(details: Details, selfiePath: string): ChallengeCheckoutPayload {
  return {
    targetName: CHALLENGE.targetName,
    age: Number(details.age),
    city: details.city.trim(),
    instagram: details.instagram.trim() || null,
    heightCm: Number(details.heightCm),
    weightKg: Number(details.weightKg),
    weightClass: details.weightClass,
    stance: details.stance,
    experience: details.experience,
    experienceYears: Number(details.experienceYears),
    fightRecord: details.fightRecord.trim(),
    trainingGym: details.trainingGym.trim(),
    coachName: details.coachName.trim() || null,
    strengths: details.strengths.trim(),
    injuries: details.injuries.trim(),
    medicalConditions: details.medicalConditions.trim(),
    availability: details.availability.trim(),
    challengeReason: details.challengeReason.trim(),
    emergencyContactName: details.emergencyContactName.trim(),
    emergencyContactPhone: details.emergencyContactPhone.trim(),
    selfieUrl: selfiePath,
    termsAccepted: details.termsAccepted,
  };
}

function fieldClass(error?: string) {
  return cn("w-full rounded-xl px-3 py-3 text-sm", error && "!border-red-500");
}

function FormBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-[var(--fc-ember)]">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-[var(--fc-text)]">{label}</span>
      {children}
      {error && <span className="text-sm text-red-300">{error}</span>}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--fc-line)] pb-2 last:border-0 last:pb-0">
      <span className="text-[var(--fc-muted)]">{label}</span>
      <span className="text-right font-medium text-[var(--fc-text)]">{value}</span>
    </div>
  );
}
