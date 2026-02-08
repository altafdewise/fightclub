import { query } from "./db";
import { todayKey } from "./date";

export async function getClientsWithStats(trainerId?: string) {
  const clientsResult = await query<{
    id: string;
    name: string;
    username: string;
    email: string | null;
  }>(
    `SELECT c.id, c.name, c.username, c.email
     FROM clients c
     LEFT JOIN client_trainer_assignments cta ON cta.client_id = c.id
     WHERE $1::uuid IS NULL OR cta.trainer_id = $1
     ORDER BY c.created_at DESC` as string,
    [trainerId ?? null]
  );

  const today = todayKey();

  const stats = await Promise.all(
    clientsResult.rows.map(async (client) => {
      const todayChecklist = await query<{
        id: string;
        total: number;
        checked: number;
      }>(
        `SELECT dc.id,
                COUNT(dci.id)::int AS total,
                COALESCE(SUM(CASE WHEN dci.checked THEN 1 ELSE 0 END),0)::int AS checked
         FROM daily_checklists dc
         LEFT JOIN daily_checklist_items dci ON dci.daily_checklist_id = dc.id
         WHERE dc.client_id = $1 AND dc.date = $2
         GROUP BY dc.id`,
        [client.id, today]
      );

      const lastActivity = await query<{ updated_at: string }>(
        "SELECT updated_at FROM daily_checklists WHERE client_id = $1 ORDER BY updated_at DESC LIMIT 1",
        [client.id]
      );

      const total = todayChecklist.rows[0]?.total || 0;
      const checked = todayChecklist.rows[0]?.checked || 0;
      const completion = total > 0 ? Math.round((checked / total) * 100) : 0;

      return {
        id: client.id,
        name: client.name,
        username: client.username,
        email: client.email,
        todayCompletion: completion,
        lastActivity: lastActivity.rows[0]?.updated_at || null,
      };
    })
  );

  return stats;
}

export async function getClientDetail(clientId: string) {
  const clientResult = await query<{
    id: string;
    name: string;
    username: string;
    trainer_note: string | null;
  }>(
    `SELECT c.id, c.name, c.username, tn.note AS trainer_note
     FROM clients c
     LEFT JOIN trainer_notes tn ON tn.client_id = c.id
     WHERE c.id = $1`,
    [clientId]
  );

  if (clientResult.rows.length === 0) return null;

  const today = todayKey();
  const checklist = await query<{ id: string }>(
    "SELECT id FROM daily_checklists WHERE client_id = $1 AND date = $2 LIMIT 1",
    [clientId, today]
  );

  const checklistId = checklist.rows[0]?.id;

  const items = checklistId
    ? await query<{ id: string; label: string; sort_order: number; video_url: string | null }>(
        `SELECT id, label, sort_order, video_url
         FROM daily_checklist_items
         WHERE daily_checklist_id = $1
         ORDER BY sort_order ASC`,
        [checklistId]
      )
    : { rows: [] as { id: string; label: string; sort_order: number; video_url: string | null }[] };

  return {
    id: clientResult.rows[0].id,
    name: clientResult.rows[0].name,
    username: clientResult.rows[0].username,
    trainerDietNote: clientResult.rows[0].trainer_note,
    exerciseItems: items.rows.map((row, index) => ({
      id: row.id || `${clientId}-${index}`,
      label: row.label,
      sortOrder: row.sort_order,
      videoUrl: row.video_url ?? null,
    })),
  };
}

export async function getTrainerCount() {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM admins"
  );
  return parseInt(result.rows[0]?.count || "0", 10);
}

export async function getTrainersWithStats() {
  const trainersResult = await query<{
    id: string;
    username: string;
    created_at: string;
  }>("SELECT id, username, created_at FROM admins ORDER BY created_at DESC");

  const stats = trainersResult.rows.map((trainer) => ({
    id: trainer.id,
    username: trainer.username,
    joinedDate: trainer.created_at,
  }));

  return stats;
}
