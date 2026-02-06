import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendUndertakingPDFParams {
  clientName: string;
  clientEmail: string;
  pdfBuffer: Buffer;
  agreedAt: Date;
}

export async function sendUndertakingPDF({
  clientName,
  clientEmail,
  pdfBuffer,
  agreedAt,
}: SendUndertakingPDFParams) {
  const filename = `BRUTAL-Undertaking-${clientName.replace(/\s+/g, "-")}-${agreedAt.toISOString().split("T")[0]}.pdf`;

  const { data, error } = await resend.emails.send({
    from: process.env.FROM_EMAIL || "BRUTAL <hello@brutal.fit>",
    to: ["purvik@brutal.fit"],
    cc: [clientEmail],
    subject: `Undertaking Agreement - ${clientName}`,
    html: `
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">New Undertaking Agreement Accepted</h2>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Client <strong>${clientName}</strong> (${clientEmail}) has reviewed and accepted the BRUTAL Coaching Undertaking Agreement.
            </p>

            <div style="background-color: #f9f9f9; border-left: 4px solid #000; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 13px;">
                <strong>Date Accepted:</strong> ${agreedAt.toLocaleString("en-US", {
          timeZone: "UTC",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} UTC
              </p>
            </div>

            <p style="color: #666; font-size: 14px;">
              The signed undertaking agreement is attached to this email. All required checkboxes were confirmed during submission.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

            <p style="color: #999; font-size: 12px;">
              This is an automated notification from the BRUTAL Client Portal system.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `New Undertaking Agreement Accepted\n\nClient ${clientName} (${clientEmail}) has accepted the BRUTAL Coaching Undertaking Agreement.\n\nDate Accepted: ${agreedAt.toLocaleString("en-US")}\n\nThe signed agreement is attached.`,
    attachments: [
      {
        filename,
        content: pdfBuffer.toString("base64"),
      },
    ],
  });

  if (error) {
    // Log error but don't throw - allow client to access portal even if email fails
    console.error("Failed to send undertaking PDF email:", error);
    return { success: false, error };
  }

  return { success: true, data };
}
