import { query } from "./db";

export type WeeklyCheckin = {
  id: string;
  client_id: string;
  trainer_id: string | null;
  weight: number | null;
  energy_level: number | null;
  sleep_quality: number | null;
  workout_adherence: number | null;
  diet_adherence: number | null;
  notes: string | null;
  trainer_feedback: string | null;
  trainer_replied_at: string | null;
  created_at: string;
};

async function getAssignedTrainerId(clientId: string): Promise<string | null> {
  const res = await query<{ trainer_id: string }>(
    `SELECT trainer_id
     FROM client_trainer_assignments
     WHERE client_id = $1
     LIMIT 1`,
    [clientId]
  );
  return res.rows[0]?.trainer_id || null;
}

function getCurrentWeekBounds() {
  const now = new Date();
  const start = new Date(now);
  const day = start.getUTCDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  start.setUTCDate(start.getUTCDate() - daysFromMonday);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  return { start, end };
}

export function getNextWeekStart() {
  return getCurrentWeekBounds().end;
}

export function getDaysUntilNextWeek() {
  const nextWeekStart = getNextWeekStart();
  const now = new Date();
  const diff = nextWeekStart.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export async function getLastCheckin(clientId: string): Promise<WeeklyCheckin | null> {
  const res = await query<WeeklyCheckin>(
    `SELECT *
     FROM weekly_checkins
     WHERE client_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [clientId]
  );
  return res.rows[0] || null;
}

export async function getCurrentWeekCheckin(clientId: string): Promise<WeeklyCheckin | null> {
  const { start, end } = getCurrentWeekBounds();
  const res = await query<WeeklyCheckin>(
    `SELECT *
     FROM weekly_checkins
     WHERE client_id = $1
       AND created_at >= $2
       AND created_at < $3
     ORDER BY created_at DESC
     LIMIT 1`,
    [clientId, start.toISOString(), end.toISOString()]
  );
  return res.rows[0] || null;
}

export async function createCheckin(params: {
  clientId: string;
  weight?: number | null;
  energyLevel?: number | null;
  sleepQuality?: number | null;
  workoutAdherence?: number | null;
  dietAdherence?: number | null;
  notes?: string | null;
}): Promise<WeeklyCheckin> {
  const trainerId = await getAssignedTrainerId(params.clientId);

  const res = await query<WeeklyCheckin>(
    `INSERT INTO weekly_checkins (
       client_id,
       trainer_id,
       weight,
       energy_level,
       sleep_quality,
       workout_adherence,
       diet_adherence,
       notes
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      params.clientId,
      trainerId,
      params.weight ?? null,
      params.energyLevel ?? null,
      params.sleepQuality ?? null,
      params.workoutAdherence ?? null,
      params.dietAdherence ?? null,
      params.notes ?? null,
    ]
  );

  return res.rows[0];
}

export async function getTrainerPendingCheckins(trainerId: string) {
  const res = await query<WeeklyCheckin & { client_name: string }>(
    `SELECT wc.*, c.name AS client_name
     FROM weekly_checkins wc
     JOIN clients c ON c.id = wc.client_id
     WHERE wc.trainer_id = $1
     ORDER BY wc.created_at DESC`,
    [trainerId]
  );
  return res.rows;
}

export async function addTrainerFeedback(checkinId: string, trainerId: string, feedback: string) {
  const res = await query<WeeklyCheckin>(
    `UPDATE weekly_checkins
     SET trainer_feedback = $1,
         trainer_replied_at = NOW()
     WHERE id = $2 AND trainer_id = $3
     RETURNING *`,
    [feedback, checkinId, trainerId]
  );
  return res.rows[0] || null;
}

export async function getClientCheckinHistory(clientId: string) {
  const res = await query<WeeklyCheckin>(
    `SELECT *
     FROM weekly_checkins
     WHERE client_id = $1
     ORDER BY created_at DESC`,
    [clientId]
  );
  return res.rows;
}

export async function getCheckinById(id: string) {
  const res = await query<WeeklyCheckin & { client_name: string }>(
    `SELECT wc.*, c.name AS client_name
     FROM weekly_checkins wc
     JOIN clients c ON c.id = wc.client_id
     WHERE wc.id = $1
     LIMIT 1`,
    [id]
  );
  return res.rows[0] || null;
}
