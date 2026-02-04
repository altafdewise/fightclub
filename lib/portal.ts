import { query, transaction } from "./db";
import { todayKey, lastNDaysKeys } from "./date";

async function getTemplateItems(clientId: string) {
  const templateChecklist = await query<{ id: string }>(
    "SELECT id FROM daily_checklists WHERE client_id = $1 AND date = 'template' LIMIT 1",
    [clientId]
  );

  if (templateChecklist.rows.length === 0) {
    return { checklistId: null, items: [] as { label: string; sort_order: number }[] };
  }

  const items = await query<{ label: string; sort_order: number }>(
    `SELECT label, sort_order
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1
     ORDER BY sort_order ASC`,
    [templateChecklist.rows[0].id]
  );

  return { checklistId: templateChecklist.rows[0].id, items: items.rows };
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
          .map((item, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3}, false)`)
          .join(", ");
        const params = [checklistId, ...template.items.flatMap((item) => [item.label, item.sort_order])];
        await client.query(
          `INSERT INTO daily_checklist_items (daily_checklist_id, label, sort_order, checked) VALUES ${values}`,
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
        .map((item, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3}, false)`)
        .join(", ");
      const params = [checklistId, ...missing.flatMap((item) => [item.label, item.sort_order])];
      await query(
        `INSERT INTO daily_checklist_items (daily_checklist_id, label, sort_order, checked) VALUES ${values}`,
        params
      );
    }
  }

  return { checklistId, templateItems: template.items };
}

export async function getTodayPayload(clientId: string) {
  const date = todayKey();
  const { checklistId } = await ensureDailyChecklist(clientId, date);

  const items = await query<{ id: string; label: string; checked: boolean }>(
    `SELECT id, label, checked
     FROM daily_checklist_items
     WHERE daily_checklist_id = $1
     ORDER BY sort_order ASC`,
    [checklistId]
  );

  const note = await query<{ note: string | null }>(
    "SELECT note FROM trainer_notes WHERE client_id = $1 LIMIT 1",
    [clientId]
  );

  return {
    date,
    note: note.rows[0]?.note || "",
    items: items.rows,
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
