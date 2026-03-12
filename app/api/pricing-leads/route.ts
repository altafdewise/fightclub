import { NextResponse } from "next/server";
import { Resend } from "resend";
import { formatCurrency, getPlanById, getPriceForPlan } from "@/lib/pricing";
import {
  createPricingLead,
  ensurePricingLeadsTable,
  getPricingLeadSummary,
  markPricingLeadNotified,
  markPricingLeadNotificationError,
  validatePricingLead,
} from "@/lib/pricingLeads";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const toEmail = process.env.TO_EMAIL || "";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const leadInput = validatePricingLead(payload || {});

    await ensurePricingLeadsTable();

    const storedLead = await createPricingLead(leadInput);
    const price = getPriceForPlan(storedLead.planId, storedLead.currency);
    const plan = getPlanById(storedLead.planId);
    const { providerName, planTitle } = getPricingLeadSummary(storedLead);

    if (
      resend &&
      process.env.FROM_EMAIL &&
      isValidEmail(toEmail) &&
      price &&
      plan
    ) {
      try {
        const originalText = price.original ? formatCurrency(price.original, storedLead.currency) : "N/A";
        const currentText = formatCurrency(price.current, storedLead.currency);

        await resend.emails.send({
          from: process.env.FROM_EMAIL,
          to: [toEmail],
          subject: `New pricing lead - ${planTitle}`,
          html: `
            <p><strong>Lead ID:</strong> ${escapeHtml(storedLead.id)}</p>
            <p><strong>Name:</strong> ${escapeHtml(storedLead.fullName)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(storedLead.phoneNumber)}</p>
            <p><strong>Email:</strong> ${escapeHtml(storedLead.email)}</p>
            <p><strong>Country:</strong> ${escapeHtml(storedLead.country)}</p>
            <p><strong>Currency:</strong> ${escapeHtml(storedLead.currency)}</p>
            <p><strong>Plan:</strong> ${escapeHtml(planTitle)}</p>
            <p><strong>Price:</strong> ${escapeHtml(currentText)}</p>
            <p><strong>Original Price:</strong> ${escapeHtml(originalText)}</p>
            <p><strong>Payment Provider:</strong> ${escapeHtml(providerName)}</p>
            <p><strong>Fitness Goal:</strong> ${escapeHtml(storedLead.fitnessGoal || "(not provided)")}</p>
            <p><strong>Preferred Contact Method:</strong> ${escapeHtml(storedLead.preferredContactMethod || "(not provided)")}</p>
            <p><strong>Training Experience:</strong> ${escapeHtml(storedLead.trainingExperience || "(not provided)")}</p>
            <p><strong>Payment Link:</strong> ${escapeHtml(storedLead.paymentLink || "(not configured)")}</p>
          `,
          text: [
            `Lead ID: ${storedLead.id}`,
            `Name: ${storedLead.fullName}`,
            `Phone: ${storedLead.phoneNumber}`,
            `Email: ${storedLead.email}`,
            `Country: ${storedLead.country}`,
            `Currency: ${storedLead.currency}`,
            `Plan: ${planTitle}`,
            `Price: ${currentText}`,
            `Original Price: ${price.original ? originalText : "(none)"}`,
            `Payment Provider: ${providerName}`,
            `Fitness Goal: ${storedLead.fitnessGoal || "(not provided)"}`,
            `Preferred Contact Method: ${storedLead.preferredContactMethod || "(not provided)"}`,
            `Training Experience: ${storedLead.trainingExperience || "(not provided)"}`,
            `Payment Link: ${storedLead.paymentLink || "(not configured)"}`,
          ].join("\n"),
        });

        await markPricingLeadNotified(storedLead.id);
      } catch (emailError) {
        console.error("Pricing lead email failed:", emailError);
        await markPricingLeadNotificationError(
          storedLead.id,
          emailError instanceof Error ? emailError.message : "Unknown email error"
        );
      }
    }

    return NextResponse.json({
      ok: true,
      leadId: storedLead.id,
      planId: storedLead.planId,
      currency: storedLead.currency,
      provider: storedLead.provider,
      paymentLink: storedLead.paymentLink,
      price,
      plan: {
        title: plan?.title,
        support: plan?.support,
        inclusions: plan?.inclusions,
        description: plan?.description,
      },
    });
  } catch (error) {
    console.error("Pricing lead submission failed:", error);

    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unable to unlock pricing right now." },
      { status: 400 }
    );
  }
}
