import { query, transaction } from "./db";
import { todayKey, lastNDaysKeys, toDateKey } from "./date";

type DayStats = {
  totalItems: number;
  completedItems: number;
  completionPct: number;
  isWinDay: boolean;
};

type DaySummaryRow = {
  date: string;
  total_items: number;
  completed_items: number;
  completion_pct: number;
  is_submitted: boolean;
  is_win_day: boolean;
  submitted_at: string | null;
};

async function getTemplateItems(clientId: string) {
  const templateChecklist = await query<{ id: string }>(
    "SELECT id FROM daily_checklists WHERE client_id = $1 AND date = 'template' LIMIT 1",
    [clientId]
  );

  if (templateChecklist.rows.length === 0) {
    return { checklistId: null, items: [] as { label: string; sort_order: number; video_url: string | null }[] };
  }

  const items = await query<{ label: string; sort_order: number; video_url: string | null }>(
    `SELECT label, sort_order, video_url
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1
     ORDER BY sort_order ASC`,
    [templateChecklist.rows[0].id]
  );

  return { checklistId: templateChecklist.rows[0].id, items: items.rows };
}

export async function calculateDayStats(clientId: string, date: string): Promise<DayStats> {
  const { checklistId } = await ensureDailyChecklist(clientId, date);
  const counts = await query<{ total: number; checked: number }>(
    `SELECT COUNT(*)::int AS total,
            COALESCE(SUM(CASE WHEN checked THEN 1 ELSE 0 END),0)::int AS checked
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1`,
    [checklistId]
  );
  const totalItems = counts.rows[0]?.total || 0;
  const completedItems = counts.rows[0]?.checked || 0;
  const completionPct = totalItems > 0 ? Math.floor((completedItems / totalItems) * 100) : 0;
  const isWinDay = completionPct >= 60;
  return { totalItems, completedItems, completionPct, isWinDay };
}

export async function upsertDaySummary(
  clientId: string,
  date: string,
  stats: DayStats,
  options?: { submitted?: boolean }
) {
  const baseFields = {
    total: stats.totalItems,
    completed: stats.completedItems,
    pct: stats.completionPct,
    win: stats.isWinDay,
  };

  if (options?.submitted) {
    await query(
      `INSERT INTO client_day_summaries
        (client_id, date, total_items, completed_items, completion_pct, is_win_day, is_submitted, submitted_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
       ON CONFLICT (client_id, date)
       DO UPDATE SET
         total_items = EXCLUDED.total_items,
         completed_items = EXCLUDED.completed_items,
         completion_pct = EXCLUDED.completion_pct,
         is_win_day = EXCLUDED.is_win_day,
         is_submitted = true,
         submitted_at = NOW(),
         updated_at = NOW()`,
      [clientId, date, baseFields.total, baseFields.completed, baseFields.pct, baseFields.win]
    );
    return;
  }

  await query(
    `INSERT INTO client_day_summaries
      (client_id, date, total_items, completed_items, completion_pct, is_win_day, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (client_id, date)
     DO UPDATE SET
       total_items = EXCLUDED.total_items,
       completed_items = EXCLUDED.completed_items,
       completion_pct = EXCLUDED.completion_pct,
       is_win_day = EXCLUDED.is_win_day,
       updated_at = NOW()`,
    [clientId, date, baseFields.total, baseFields.completed, baseFields.pct, baseFields.win]
  );
}

export async function getDaySummary(clientId: string, date: string) {
  const summary = await query<DaySummaryRow>(
    `SELECT date, total_items, completed_items, completion_pct, is_submitted, is_win_day, submitted_at
     FROM client_day_summaries
     WHERE client_id = $1 AND date = $2
     LIMIT 1`,
    [clientId, date]
  );
  return summary.rows[0] || null;
}

export async function getStreaks(clientId: string) {
  const today = new Date();
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 365);

  const startKey = toDateKey(start);
  const endKey = toDateKey(today);

  const summaries = await query<Pick<DaySummaryRow, "date" | "is_submitted" | "is_win_day">>(
    `SELECT date, is_submitted, is_win_day
     FROM client_day_summaries
     WHERE client_id = $1 AND date BETWEEN $2 AND $3`,
    [clientId, startKey, endKey]
  );

  const map = new Map(
    summaries.rows.map((row) => {
      const dateKey = toDateKey(new Date(row.date as unknown as string));
      return [
        dateKey,
        { isSubmitted: row.is_submitted, isWinDay: row.is_win_day },
      ] as const;
    })
  );

  let best = 0;
  let run = 0;
  const cursor = new Date(start);
  while (cursor <= today) {
    const key = toDateKey(cursor);
    const entry = map.get(key);
    if (entry?.isSubmitted && entry.isWinDay) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  let current = 0;
  const todayKey = toDateKey(today);
  const todayEntry = map.get(todayKey);
  const anchor = new Date(today);

  if (todayEntry?.isSubmitted) {
    if (!todayEntry.isWinDay) {
      return { current: 0, best };
    }
  } else {
    anchor.setUTCDate(anchor.getUTCDate() - 1);
  }

  while (true) {
    const key = toDateKey(anchor);
    const entry = map.get(key);
    if (entry?.isSubmitted && entry.isWinDay) {
      current += 1;
      anchor.setUTCDate(anchor.getUTCDate() - 1);
      continue;
    }
    break;
  }

  return { current, best };
}

export async function ensureDailyChecklist(clientId: string, date: string) {
  const existing = await query<{ id: string }>(
    "SELECT id FROM daily_checklists WHERE client_id = $1 AND date = $2 LIMIT 1",
    [clientId, date]
  );

  const template = await getTemplateItems(clientId);

  if (existing.rows.length === 0) {
    const created = await transaction(async (client) => {
      const createdChecklist = await client.query<{ id: string }>(
        "INSERT INTO daily_checklists (client_id, date) VALUES ($1, $2) RETURNING id",
        [clientId, date]
      );

      const checklistId = createdChecklist.rows[0].id;

      if (template.items.length > 0) {
        const values = template.items
          .map((item, index) => `($1, $${index * 3 + 2}, $${index * 3 + 3}, false, $${index * 3 + 4})`)
          .join(", ");
        const params = [
          checklistId,
          ...template.items.flatMap((item) => [item.label, item.sort_order, item.video_url ?? null]),
        ];
        await client.query(
          `INSERT INTO daily_checklist_items (daily_checklist_id, label, sort_order, checked, video_url) VALUES ${values}`,
          params
        );
      }

      return checklistId;
    });

    return { checklistId: created, templateItems: template.items };
  }

  const checklistId = existing.rows[0].id;

  if (template.items.length > 0) {
    const existingItems = await query<{ label: string }>(
      "SELECT label FROM daily_checklist_items WHERE daily_checklist_id = $1",
      [checklistId]
    );
    const existingLabels = new Set(existingItems.rows.map((row) => row.label));
    const missing = template.items.filter((item) => !existingLabels.has(item.label));

    if (missing.length > 0) {
      const values = missing
        .map((item, index) => `($1, $${index * 3 + 2}, $${index * 3 + 3}, false, $${index * 3 + 4})`)
        .join(", ");
      const params = [
        checklistId,
        ...missing.flatMap((item) => [item.label, item.sort_order, item.video_url ?? null]),
      ];
      await query(
        `INSERT INTO daily_checklist_items (daily_checklist_id, label, sort_order, checked, video_url) VALUES ${values}`,
        params
      );
    }
  }

  return { checklistId, templateItems: template.items };
}

export async function getTodayPayload(clientId: string) {
  const date = todayKey();
  const { checklistId } = await ensureDailyChecklist(clientId, date);

  const stats = await calculateDayStats(clientId, date);
  await upsertDaySummary(clientId, date, stats);
  const summary = await getDaySummary(clientId, date);

  const items = await query<{ id: string; label: string; checked: boolean; video_url: string | null }>(
    `SELECT id, label, checked, video_url
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1
     ORDER BY sort_order ASC`,
    [checklistId]
  );

  const note = await query<{ note: string | null }>(
    "SELECT note FROM trainer_notes WHERE client_id = $1 LIMIT 1",
    [clientId]
  );

  // Check if data is stale (reset occurred after last update)
  // const isResetDetected = summary?.reset_at
  //   ? new Date(summary.reset_at) > new Date(summary.updated_at)
  //   : false;

  return {
    date,
    note: note.rows[0]?.note || "",
    items: items.rows.map((item) => ({
      id: item.id,
      label: item.label,
      checked: item.checked,
      videoUrl: item.video_url ?? null,
    })),
    summary: summary
      ? {
          date: summary.date,
          totalItems: summary.total_items,
          completedItems: summary.completed_items,
          completionPct: summary.completion_pct,
          isSubmitted: summary.is_submitted,
          isWinDay: summary.is_win_day,
        }
      : {
          date,
          totalItems: stats.totalItems,
          completedItems: stats.completedItems,
          completionPct: stats.completionPct,
          isSubmitted: false,
          isWinDay: stats.isWinDay,
        },
  };
}

export async function getHistoryPayload(clientId: string) {
  const dates = lastNDaysKeys(7);
  const checklists = await query<{
    date: string;
    total: number;
    checked: number;
  }>(
    `SELECT dc.date,
            COUNT(dci.id)::int AS total,
            COALESCE(SUM(CASE WHEN dci.checked THEN 1 ELSE 0 END),0)::int AS checked
     FROM daily_checklists dc
     LEFT JOIN daily_checklist_items dci ON dci.daily_checklist_id = dc.id
     WHERE dc.client_id = $1 AND dc.date = ANY($2)
     GROUP BY dc.date`,
    [clientId, dates]
  );

  const map = new Map(checklists.rows.map((row) => [row.date, row]));

  return dates.map((date) => {
    const row = map.get(date);
    const total = row?.total || 0;
    const checked = row?.checked || 0;
    const completion = total > 0 ? Math.round((checked / total) * 100) : 0;
    return { date, completion, total, checked };
  });
}

// Undertaking agreement functions
export async function checkUndertakingExists(clientId: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    `SELECT id FROM client_undertakings
     WHERE client_id = $1 AND all_checkboxes_confirmed = true
     LIMIT 1`,
    [clientId]
  );
  return result.rows.length > 0;
}

export async function createUndertaking(
  clientId: string,
  pdfUrl: string
): Promise<{ id: string; agreedAt: string }> {
  const result = await query<{ id: string; agreed_at: string }>(
    `INSERT INTO client_undertakings (client_id, all_checkboxes_confirmed, pdf_url)
     VALUES ($1, true, $2)
     RETURNING id, agreed_at`,
    [clientId, pdfUrl]
  );

  if (result.rows.length === 0) {
    throw new Error("Failed to create undertaking");
  }

  return {
    id: result.rows[0].id,
    agreedAt: result.rows[0].agreed_at,
  };
}

export async function getUndertakingByClientId(clientId: string): Promise<{
  id: string;
  agreedAt: string;
  pdfUrl: string | null;
} | null> {
  const result = await query<{
    id: string;
    agreed_at: string;
    pdf_url: string | null;
  }>(
    `SELECT id, agreed_at, pdf_url FROM client_undertakings
     WHERE client_id = $1 LIMIT 1`,
    [clientId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    id: result.rows[0].id,
    agreedAt: result.rows[0].agreed_at,
    pdfUrl: result.rows[0].pdf_url,
  };
}

