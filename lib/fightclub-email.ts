interface FightclubEmailProps {
  bookingId: string;
  name: string;
  tickets: number;
  whatsappUrl: string;
}

export function fightclubEmailHtml({
  bookingId,
  name,
  tickets,
  whatsappUrl,
}: FightclubEmailProps): string {
  const rules = [
    "You tap, it stops. Until then nobody's saving you.",
    "No judges, no scorecards. The crowd decides.",
    "No weight classes — you find your match on the night.",
    "No headgear. No excuses.",
    "Women's bouts are happening. This ring doesn't discriminate.",
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fight Club Hyderabad — Season One</title>
</head>
<body style="margin:0;padding:0;background:#050607;font-family:'Helvetica Neue',Arial,sans-serif;color:#f4f4f0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050607;padding:32px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:rgba(255,255,255,0.04);padding:40px 40px 32px;border-bottom:3px solid #e63c1e;text-align:center;">
              <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.2em;color:#e63c1e;text-transform:uppercase;font-weight:600;">
                Fight Club Hyderabad
              </p>
              <h1 style="margin:0 0 4px;font-size:42px;font-weight:900;color:#f4f4f0;line-height:1;letter-spacing:-0.01em;">
                SEASON ONE
              </h1>
              <p style="margin:12px 0 0;font-size:15px;color:#9ea5b5;">
                You're in. See you in the ring.
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="background:#0d0d10;padding:32px 40px 0;">
              <p style="margin:0 0 8px;font-size:16px;color:#f4f4f0;">Hey ${escapeHtml(name)},</p>
              <p style="margin:0 0 32px;font-size:15px;color:#9ea5b5;line-height:1.7;">
                Your spot at Fight Club Hyderabad — Season One is locked in.
                Here's everything you need.
              </p>
            </td>
          </tr>

          <!-- Booking details -->
          <tr>
            <td style="background:#0d0d10;padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">
                ${[
                  { label: "Booking ID", value: bookingId, highlight: true, mono: true },
                  { label: "Name", value: escapeHtml(name), highlight: false, mono: false },
                  {
                    label: "Tickets",
                    value: `${tickets} &times; Free Admission`,
                    highlight: false,
                    mono: false,
                  },
                  { label: "Date &amp; Time", value: "Sunday · 6:00 PM", highlight: false, mono: false },
                  {
                    label: "Venue",
                    value: "B3 Underground Parking<br/>Chaitanyapuri, Hyderabad",
                    highlight: false,
                    mono: false,
                  },
                ]
                  .map(
                    ({ label, value, highlight, mono }, i, arr) => `
                <tr>
                  <td style="padding:14px 20px;${i < arr.length - 1 ? "border-bottom:1px solid rgba(255,255,255,0.07);" : ""}">
                    <p style="margin:0 0 3px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9ea5b5;font-weight:600;">
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

          <!-- WhatsApp CTA -->
          <tr>
            <td style="background:#0d0d10;padding:0 40px 32px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                style="background:#0d1a10;border:1px solid rgba(37,211,102,0.25);border-radius:4px;">
                <tr>
                  <td style="padding:24px 24px 8px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#25D366;font-weight:600;">
                      Don't miss a thing
                    </p>
                    <h2 style="margin:4px 0 12px;font-size:22px;font-weight:900;color:#f4f4f0;letter-spacing:-0.01em;">
                      Join our WhatsApp Broadcast
                    </h2>
                    <p style="margin:0 0 20px;font-size:14px;color:#9ea5b5;line-height:1.7;">
                      Get fight night updates, fighter line-ups, and last-minute changes
                      directly on your phone.
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

          <!-- Rules -->
          <tr>
            <td style="background:#0d0d10;padding:0 40px 40px;">
              <p style="margin:0 0 16px;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#e63c1e;font-weight:600;">
                What to expect
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${rules
                  .map(
                    (rule, i, arr) => `
                <tr>
                  <td style="padding:10px 0;${i < arr.length - 1 ? "border-bottom:1px solid rgba(255,255,255,0.06);" : ""}">
                    <span style="color:#e63c1e;margin-right:12px;font-weight:700;">&mdash;</span>
                    <span style="font-size:14px;color:#9ea5b5;line-height:1.6;">${rule}</span>
                  </td>
                </tr>`
                  )
                  .join("")}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#050607;padding:24px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#4a4a5a;">
                B3 Underground Parking, Chaitanyapuri, Hyderabad
              </p>
              <p style="margin:0 0 16px;font-size:12px;color:#4a4a5a;">
                Instagram:&nbsp;
                <a href="https://instagram.com/brutal.fit" style="color:#e63c1e;text-decoration:none;">@brutal.fit</a>
                &nbsp;&middot;&nbsp;
                <a href="${escapeHtml(whatsappUrl)}" style="color:#25D366;text-decoration:none;">WhatsApp Broadcast</a>
              </p>
              <p style="margin:0;font-size:11px;color:#2a2a3a;letter-spacing:0.08em;text-transform:uppercase;">
                Fight Club Hyderabad &mdash; Season One. You were invited.
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
