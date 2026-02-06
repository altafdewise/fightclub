import { jsPDF } from "jspdf";
import { UNDERTAKING_TEXT } from "./undertakingContent";

interface Client {
  id: string;
  name: string;
  email?: string;
}

export async function generateUndertakingPDF(
  client: Client,
  agreedAt: Date
): Promise<Buffer> {
  try {
    // Create PDF document (A4 size, millimeters units)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Set default font
    doc.setFont("Arial", "normal");

    // Header
    doc.setFontSize(20);
    doc.setFont("Arial", "bold");
    doc.text("BRUTAL COACHING", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Subtitle
    doc.setFontSize(14);
    doc.text("Undertaking Agreement", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;

    // Client Info
    doc.setFontSize(10);
    doc.setFont("Arial", "normal");
    doc.text(`Client: ${client.name}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Email: ${client.email || "Not provided"}`, margin, yPosition);
    yPosition += 6;
    doc.text(
      `Date Accepted: ${agreedAt.toLocaleString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })} UTC`,
      margin,
      yPosition
    );
    yPosition += 8;

    // Divider line
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    // Agreement Text
    doc.setFontSize(9);
    const paragraphs = UNDERTAKING_TEXT.split("\n\n");

    paragraphs.forEach((paragraph) => {
      const lines = paragraph.split("\n");
      lines.forEach((line) => {
        if (line.trim()) {
          // Check if it's a header (ALL CAPS, length > 3)
          if (line === line.toUpperCase() && line.length > 3) {
            doc.setFont("Arial", "bold");
            doc.setFontSize(10);
          } else {
            doc.setFont("Arial", "normal");
            doc.setFontSize(9);
          }

          // Split long lines to fit page width
          const splitText = doc.splitTextToSize(line, contentWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 4;

          // Check if we need a new page
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
        }
      });
      yPosition += 3;
    });

    // Add new page for confirmation section if needed
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Divider line
    doc.setDrawColor(51, 51, 51);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    // Confirmation Section
    doc.setFont("Arial", "bold");
    doc.setFontSize(11);
    doc.text("CONFIRMATION OF ACCEPTANCE", margin, yPosition);
    yPosition += 8;

    doc.setFont("Arial", "normal");
    doc.setFontSize(9);
    const confirmationText = `Client: ${client.name} confirmed the following acceptance on ${agreedAt.toLocaleDateString("en-US")}:`;
    const splitConfirmation = doc.splitTextToSize(confirmationText, contentWidth);
    doc.text(splitConfirmation, margin, yPosition);
    yPosition += splitConfirmation.length * 4 + 2;

    // Checklist items
    const checkmarks = [
      "Understanding that fitness coaching is not medical treatment",
      "Disclosure of all medical conditions, injuries, and medications",
      "Understanding that trainer does not diagnose or prescribe",
      "Personal responsibility for participation and recovery",
      "Commitment to inform trainer of any health changes",
      "Reading, understanding, and accepting this undertaking",
    ];

    checkmarks.forEach((item) => {
      const splitItem = doc.splitTextToSize(`✓ ${item}`, contentWidth - 5);
      doc.text(splitItem, margin + 3, yPosition);
      yPosition += splitItem.length * 4 + 1;

      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    });

    yPosition += 3;

    // Footer
    doc.setFont("Arial", "normal");
    doc.setFontSize(8);
    doc.setTextColor(102, 102, 102);
    doc.text(
      `Generated: ${agreedAt.toLocaleString("en-US", {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })} UTC`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );

    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    return pdfBuffer;
  } catch (error) {
    throw error;
  }
}
