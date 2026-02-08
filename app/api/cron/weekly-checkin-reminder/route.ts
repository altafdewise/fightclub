import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function ensureCronAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = req.headers.get("x-cron-secret");
  return header === secret;
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL) return;
  await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
  });
}

export async function GET(req: NextRequest) {
  if (!ensureCronAuthorized(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Clients needing weekly reminder (no check-in in last 7 days)
    const weekly = await query<{ client_id: string; email: string | null; name: string | null }>(
      `WITH latest AS (
         SELECT DISTINCT ON (client_id) client_id, created_at
         FROM weekly_checkins
         ORDER BY client_id, created_at DESC
       )
       SELECT c.id AS client_id, c.email, c.name
       FROM clients c
       LEFT JOIN latest l ON l.client_id = c.id
       WHERE (l.created_at IS NULL OR l.created_at < CURRENT_DATE - INTERVAL '7 days')
      `
    );

    for (const row of weekly.rows) {
      if (!row.email) continue;
      await sendEmail(
        row.email,
        "Your weekly check-in is due",
        `<p>Hi ${row.name || "there"}, your weekly check-in is due. Take a minute to submit it so your coach can help you stay on track.</p>`
      );
    }

    // Inactive clients (no daily submission in last 3 days)
    const inactive = await query<{ client_id: string; email: string | null; name: string | null }>(
      `WITH last_submit AS (
         SELECT client_id, MAX(date) AS last_date
         FROM client_day_summaries
         WHERE is_submitted = true
         GROUP BY client_id
       )
       SELECT c.id AS client_id, c.email, c.name
       FROM clients c
       LEFT JOIN last_submit ls ON ls.client_id = c.id
       WHERE ls.last_date IS NULL OR ls.last_date < CURRENT_DATE - INTERVAL '3 days'`
    );

    for (const row of inactive.rows) {
      if (!row.email) continue;
      await sendEmail(
        row.email,
        "We noticed you’ve been inactive",
        `<p>Hi ${row.name || "there"}, we haven't seen activity the last few days. Let's get back on track—start with today's checklist or a quick check-in.</p>`
      );
    }

    // Streak reminder: if client had 5+ day streak but missed yesterday
    const streakData = await query<{ client_id: string; date: string; is_submitted: boolean; email: string | null; name: string | null }>(
      `SELECT cds.client_id, cds.date, cds.is_submitted, c.email, c.name
       FROM client_day_summaries cds
       JOIN clients c ON c.id = cds.client_id
       WHERE date >= CURRENT_DATE - INTERVAL '6 days'
       ORDER BY cds.client_id, cds.date`
    );

    const streakMap = new Map<string, { email: string | null; name: string | null; days: { date: string; is_submitted: boolean }[] }>();
    for (const row of streakData.rows) {
      const entry = streakMap.get(row.client_id) || { email: row.email, name: row.name, days: [] };
      entry.days.push({ date: row.date, is_submitted: row.is_submitted });
      streakMap.set(row.client_id, entry);
    }

    for (const [clientId, info] of streakMap.entries()) {
      if (!info.email) continue;
      const days = info.days;
      // Build map for quick lookup
      const dayMap = new Map(days.map((d) => [d.date, d.is_submitted]));
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayKey = yesterday.toISOString().slice(0, 10);
      if (dayMap.get(yesterdayKey)) continue; // submitted yesterday

      // Check previous 5 days streak
      let streak = 0;
      for (let i = 2; i <= 6; i += 1) {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (dayMap.get(key)) streak += 1;
        else break;
      }
      if (streak >= 5) {
        await sendEmail(
          info.email,
          "Don't break your streak",
          `<p>You were on a great streak—don't let it end today. Log your checklist and keep the momentum going.</p>`
        );
      }
    }

    return NextResponse.json({ ok: true, weekly: weekly.rows.length, inactive: inactive.rows.length });
  } catch (error) {
    console.error("[weekly-checkin-reminder]", error);
    return NextResponse.json({ message: "Error running cron" }, { status: 500 });
  }
}
