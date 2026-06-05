import { FIGHTCLUB } from "@/lib/fightclub/config";

interface FightclubEmailProps {
  bookingId: string;
  name: string;
  type: "viewer" | "boxer";
  quantity?: number; // viewers only
  whatsappUrl: string;
}

export function fightclubEmailHtml({
  bookingId,
  name,
  type,
  quantity = 1,
  whatsappUrl,
}: FightclubEmailProps): string {
  const isBoxer = type === "boxer";

  const ticketValue = isBoxer
    ? "Boxer entry — you fight"
    : `${quantity} &times; Viewer admission`;

  const rows: Array<{ label: string; value: string; highlight?: boolean; mono?: boolean }> = [
    { label: "Booking ID", value: bookingId, highlight: true, mono: true },
    { label: "Name", value: escapeHtml(name) },
    { label: "Entry", value: ticketValue },
    { label: "Date &amp; Time", value: `${escapeHtml(FIGHTCLUB.date)} · ${escapeHtml(FIGHTCLUB.time)}` },
    { label: "Venue", value: escapeHtml(FIGHTCLUB.venue) },
    { label: "Format", value: escapeHtml(FIGHTCLUB.format) },
  ];

  const expectations = [
    "No judges, no scorecards. The crowd decides who wins.",
    "Surprise prize for the most entertaining fighter of the night.",
    "3 rounds. 3 minutes each. You tap, it stops.",
    "Bring an ID. Doors open before the first bell.",
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fight Club — Season One, Series Two</title>
</head>
<body style="margin:0;padding:0;background:#060606;font-family:'Helvetica Neue',Arial,sans-serif;color:#f4f4f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#060606;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0a0a0a;padding:40px 40px 32px;border-bottom:3px solid #8b0000;text-align:center;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.28em;color:#e63c1e;text-transform:uppercase;font-weight:700;">
                ${escapeHtml(FIGHTCLUB.season)}
              </p>
              <h1 style="margin:0 0 4px;font-size:46px;font-weight:900;color:#f4f4f0;line-height:0.95;letter-spacing:-0.02em;text-transform:uppercase;">
                Fight Club
              </h1>
              <p style="margin:12px 0 0;font-size:15px;color:#8a8a8a;">
                You&rsquo;re in. ${isBoxer ? "Step into the ring." : "See you ringside."}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="background:#0a0a0a;padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:16px;color:#f4f4f0;">Hey ${escapeHtml(name)},</p>
              <p style="margin:0 0 32px;font-size:15px;color:#8a8a8a;line-height:1.7;">
                Your ${isBoxer ? "fighter entry" : "spot"} for Fight Club &mdash; Season One, Series Two is locked in. Here&rsquo;s everything you need.
              </p>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="background:#0a0a0a;padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background:rgba(255,255,255,0.03);border:1px solid rgba(160,16,16,0.25);border-radius:4px;overflow:hidden;">
                ${rows
                  .map(
                    ({ label, value, highlight, mono }, i, arr) => `
                <tr>
                  <td style="padding:14px 20px;${i < arr.length - 1 ? "border-bottom:1px solid rgba(255,255,255,0.07);" : ""}">
                    <p style="margin:0 0 3px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#8a8a8a;font-weight:600;">
                      ${label}
                    </p>
                    <p style="margin:0;font-size:15px;color:${highlight ? "#e63c1e" : "#f4f4f0"};font-family:${mono ? "monospace" : "inherit"};font-weight:${highlight ? "700" : "400"};">
                      ${value}
                    </p>
                  </td>
                </tr>`
                  )
                  .join("")}
              </table>
            </td>
          </tr>

          ${
            isBoxer
              ? `<!-- Boxer wristband note -->
          <tr>
            <td style="background:#0a0a0a;padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background:rgba(139,0,0,0.12);border:1px solid rgba(230,60,30,0.3);border-radius:4px;">
                <tr>
                  <td style="padding:18px 20px;text-align:center;">
                    <p style="margin:0;font-size:14px;color:#f4f4f0;line-height:1.6;font-weight:600;">
                      Collect your wristband at the gate. 3 rounds. 3 minutes. The crowd decides.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ""
          }

          <!-- WhatsApp CTA -->
          <tr>
            <td style="background:#0a0a0a;padding:0 40px 32px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background:#0d1a10;border:1px solid rgba(37,211,102,0.25);border-radius:4px;">
                <tr>
                  <td style="padding:24px 24px 8px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#25D366;font-weight:600;">
                      Don&rsquo;t miss a thing
                    </p>
                    <h2 style="margin:4px 0 12px;font-size:22px;font-weight:900;color:#f4f4f0;letter-spacing:-0.01em;">
                      Join the WhatsApp Broadcast
                    </h2>
                    <p style="margin:0 0 20px;font-size:14px;color:#8a8a8a;line-height:1.7;">
                      Fight-night updates, line-ups, and last-minute changes straight to your phone.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 24px 24px;text-align:center;">
                    <a href="${escapeHtml(whatsappUrl)}"
                      style="display:inline-block;background:#25D366;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;text-decoration:none;letter-spacing:0.05em;border-radius:2px;">
                      Join WhatsApp Broadcast &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What to expect -->
          <tr>
            <td style="background:#0a0a0a;padding:0 40px 40px;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#e63c1e;font-weight:700;">
                What to expect
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${expectations
                  .map(
                    (line, i, arr) => `
                <tr>
                  <td style="padding:10px 0;${i < arr.length - 1 ? "border-bottom:1px solid rgba(255,255,255,0.06);" : ""}">
                    <span style="color:#e63c1e;margin-right:12px;font-weight:700;">&mdash;</span>
                    <span style="font-size:14px;color:#8a8a8a;line-height:1.6;">${escapeHtml(line)}</span>
                  </td>
                </tr>`
                  )
                  .join("")}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#060606;padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#4a4a4a;">
                ${escapeHtml(FIGHTCLUB.venue)}
              </p>
              <p style="margin:0 0 16px;font-size:12px;color:#4a4a4a;">
                Instagram:&nbsp;
                <a href="https://instagram.com/brutal.fit" style="color:#e63c1e;text-decoration:none;">@brutal.fit</a>
                &nbsp;&middot;&nbsp;
                <a href="${escapeHtml(whatsappUrl)}" style="color:#25D366;text-decoration:none;">WhatsApp Broadcast</a>
              </p>
              <p style="margin:0;font-size:11px;color:#2a2a2a;letter-spacing:0.08em;text-transform:uppercase;">
                Fight Club &mdash; Season One, Series Two.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
