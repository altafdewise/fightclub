import { requireClient } from "@/lib/auth";
import { createUndertaking, checkUndertakingExists } from "@/lib/portal";
import { generateUndertakingPDF } from "@/lib/pdfGenerator";
import { sendUndertakingPDF } from "@/lib/emailClient";

export async function POST(request: Request) {
  try {
    // Validate session
    const client = await requireClient();

    // Check if undertaking already exists
    const alreadyAgreed = await checkUndertakingExists(client.id);
    if (alreadyAgreed) {
      return new Response(
        JSON.stringify({
          message: "You have already accepted the undertaking agreement.",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate request body
    const body = await request.json();
    const { checkboxes } = body;

    if (!checkboxes) {
      return new Response(
        JSON.stringify({ message: "Missing checkboxes data." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verify all checkboxes are true
    const allChecked =
      checkboxes.medicalNotTreatment &&
      checkboxes.disclosedHealthInfo &&
      checkboxes.trainerNodiagnose &&
      checkboxes.acceptResponsibility &&
      checkboxes.informOfChanges &&
      checkboxes.finalAgreement;

    if (!allChecked) {
      return new Response(
        JSON.stringify({
          message: "Please confirm all checkboxes before submitting.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate PDF
    const agreedAt = new Date();
    let pdfBuffer: Buffer;

    try {
      pdfBuffer = await generateUndertakingPDF(
        {
          id: client.id,
          name: client.name,
          email: client.email || undefined,
        },
        agreedAt
      );
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return new Response(
        JSON.stringify({ message: "Failed to generate PDF." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Send email (non-blocking - log errors but don't fail)
    try {
      await sendUndertakingPDF({
        clientName: client.name,
        clientEmail: client.email || "",
        pdfBuffer,
        agreedAt,
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      // Continue - don't block client access if email fails
    }

    // Store undertaking in database
    // For now, store as simple string path - could be moved to S3 in future
    const pdfPath = `undertakings/${client.id}-${agreedAt.getTime()}.pdf`;

    try {
      const undertaking = await createUndertaking(client.id, pdfPath);

      return new Response(
        JSON.stringify({
          ok: true,
          message: "Undertaking agreement accepted successfully.",
          pdfUrl: pdfPath,
          agreedAt: undertaking.agreedAt,
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ message: "Failed to save agreement to database." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Undertaking submit error:", error);

    // Handle auth errors
    if (error.message?.includes("not authenticated")) {
      return new Response(
        JSON.stringify({ message: "Not authenticated." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ message: error.message || "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
