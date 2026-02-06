import { requireClient } from "@/lib/auth";
import { getUndertakingByClientId } from "@/lib/portal";
import { generateUndertakingPDF } from "@/lib/pdfGenerator";

export async function GET(request: Request) {
  try {
    // Validate session
    const client = await requireClient();

    // Get undertaking record
    const undertaking = await getUndertakingByClientId(client.id);

    if (!undertaking) {
      return new Response(
        JSON.stringify({ message: "No undertaking found for this client." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Regenerate PDF from stored data
    const agreedAtDate = new Date(undertaking.agreedAt);
    let pdfBuffer: Buffer;

    try {
      pdfBuffer = await generateUndertakingPDF(
        {
          id: client.id,
          name: client.name,
          email: client.email || undefined,
        },
        agreedAtDate
      );
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return new Response(
        JSON.stringify({ message: "Failed to generate PDF." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return PDF file
    const filename = `BRUTAL-Undertaking-${client.name.replace(/\s+/g, "-")}-${agreedAtDate.toISOString().split("T")[0]}.pdf`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Undertaking download error:", error);

    // Handle auth errors
    if (error.message?.includes("not authenticated")) {
      return new Response(
        JSON.stringify({ message: "Not authenticated." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: error.message || "Internal server error." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
