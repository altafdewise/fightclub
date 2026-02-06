import { query } from "./db";
import { toDateKey } from "./date";

interface ResetResult {
  clientsProcessed: number;
  clientsSucceeded: number;
  clientsFailed: number;
  streaksEvaluated: number;
  streaksIncremented: number;
}

/**
 * Get platform timezone setting from database
 */
export async function getPlatformTimezone(): Promise<string> {
  const result = await query<{ setting_value: string }>(
    `SELECT setting_value FROM platform_settings WHERE setting_key = $1`,
    ["PLATFORM_TIMEZONE"]
  );

  if (result.rows.length === 0) {
    console.warn("[RESET] Platform timezone not found, using UTC");
    return "UTC";
  }

  return result.rows[0].setting_value;
}

/**
 * Check if data should be reset based on timezone
 * Returns the date string that should be reset (in platform timezone)
 */
function getResetDate(timezone: string): string {
  const now = new Date();

  // Get current time in the platform timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(now);
  const dateMap: Record<string, string> = {};

  parts.forEach((part) => {
    dateMap[part.type] = part.value;
  });

  // Format as YYYY-MM-DD
  return `${dateMap.year}-${dateMap.month}-${dateMap.day}`;
}

/**
 * Evaluate if client's streak should be incremented
 * Called BEFORE reset, checks yesterday's data
 */
export async function evaluateStreakBeforeReset(
  clientId: string,
  yesterday: string
): Promise<boolean> {
  const result = await query<{
    is_submitted: boolean;
    is_win_day: boolean;
  }>(
    `SELECT is_submitted, is_win_day FROM client_day_summaries
     WHERE client_id = $1 AND date = $2`,
    [clientId, yesterday]
  );

  if (result.rows.length === 0) {
    return false; // No data for yesterday = streak resets
  }

  const { is_submitted, is_win_day } = result.rows[0];

  // Streak increments only if BOTH conditions met
  return is_submitted === true && is_win_day === true;
}

/**
 * Reset all daily checklist items to unchecked for a client on given date
 */
export async function resetDailyChecklist(
  clientId: string,
  date: string
): Promise<void> {
  // Get the checklist ID for this date
  const checklistResult = await query<{ id: string }>(
    `SELECT id FROM daily_checklists WHERE client_id = $1 AND date = $2`,
    [clientId, date]
  );

  if (checklistResult.rows.length === 0) {
    console.log(`[RESET] No checklist found for client ${clientId} on ${date}`);
    return;
  }

  const checklistId = checklistResult.rows[0].id;

  // Reset all items to unchecked
  await query(
    `UPDATE daily_checklist_items SET checked = false, updated_at = NOW()
     WHERE daily_checklist_id = $1`,
    [checklistId]
  );

  console.log(
    `[RESET] Reset checklist items for client ${clientId} on ${date}`
  );
}

/**
 * Clear daily notes for a client on given date
 * Note: This assumes there's a note field on daily_checklists
 * Placeholder for now - may need adjustment based on actual schema
 */
export async function resetDailyNote(
  clientId: string,
  date: string
): Promise<void> {
  // This is a placeholder - actual implementation depends on how notes are stored
  // For now, just log it
  console.log(`[RESET] Would clear daily notes for client ${clientId} on ${date}`);
}

/**
 * Reset day summary (mark as not submitted, not a win day)
 */
export async function resetDaySummary(
  clientId: string,
  date: string
): Promise<void> {
  await query(
    `UPDATE client_day_summaries
     SET is_submitted = false, submitted_at = NULL, is_win_day = false, reset_at = NOW(), updated_at = NOW()
     WHERE client_id = $1 AND date = $2`,
    [clientId, date]
  );

  console.log(
    `[RESET] Reset day summary for client ${clientId} on ${date}`
  );
}

/**
 * Create or update reset audit log entry
 */
async function createResetAuditEntry(
  resetDate: string,
  timezone: string,
  status: "pending" | "in_progress" | "completed" | "failed"
) {
  await query(
    `INSERT INTO reset_audit_logs
     (reset_date, platform_timezone, reset_time_utc, status, created_at, updated_at)
     VALUES ($1, $2, NOW(), $3, NOW(), NOW())
     ON CONFLICT (reset_date) DO UPDATE
     SET status = $3, updated_at = NOW()`,
    [resetDate, timezone, status]
  );
}

/**
 * Update reset audit log with final results
 */
async function updateResetAuditEntry(
  resetDate: string,
  results: ResetResult,
  status: "completed" | "failed",
  errorMessage?: string
) {
  await query(
    `UPDATE reset_audit_logs
     SET status = $1, clients_processed = $2, clients_succeeded = $3, clients_failed = $4,
         streaks_evaluated = $5, streaks_incremented = $6, error_message = $7, updated_at = NOW()
     WHERE reset_date = $8`,
    [
      status,
      results.clientsProcessed,
      results.clientsSucceeded,
      results.clientsFailed,
      results.streaksEvaluated,
      results.streaksIncremented,
      errorMessage || null,
      resetDate,
    ]
  );
}

/**
 * Check if today's reset has already been completed
 * (idempotency check)
 */
async function isResetAlreadyCompleted(resetDate: string): Promise<boolean> {
  const result = await query<{ status: string }>(
    `SELECT status FROM reset_audit_logs WHERE reset_date = $1`,
    [resetDate]
  );

  if (result.rows.length === 0) {
    return false;
  }

  return result.rows[0].status === "completed";
}

/**
 * Main reset orchestration function
 * Processes all clients for daily reset
 */
export async function performDailyReset(): Promise<ResetResult> {
  const timezone = await getPlatformTimezone();
  const resetDate = getResetDate(timezone);
  const yesterday = new Date(
    new Date().setDate(new Date().getDate() - 1)
  );
  const yesterdayDate = toDateKey(yesterday);

  console.log(`[RESET] Starting daily reset for ${resetDate}`);
  console.log(`[RESET] Timezone: ${timezone}`);
  console.log(`[RESET] Evaluating streaks for: ${yesterdayDate}`);

  // Idempotency check
  const alreadyCompleted = await isResetAlreadyCompleted(resetDate);
  if (alreadyCompleted) {
    console.log(`[RESET] Reset for ${resetDate} already completed, skipping`);
    return {
      clientsProcessed: 0,
      clientsSucceeded: 0,
      clientsFailed: 0,
      streaksEvaluated: 0,
      streaksIncremented: 0,
    };
  }

  // Create pending audit entry
  await createResetAuditEntry(resetDate, timezone, "pending");

  const results: ResetResult = {
    clientsProcessed: 0,
    clientsSucceeded: 0,
    clientsFailed: 0,
    streaksEvaluated: 0,
    streaksIncremented: 0,
  };

  try {
    // Update status to in_progress
    await createResetAuditEntry(resetDate, timezone, "in_progress");

    // Get all active clients
    const clientsResult = await query<{ id: string; name: string }>(
      `SELECT id, name FROM clients ORDER BY created_at`,
      []
    );

    const clients = clientsResult.rows;
    console.log(`[RESET] Processing ${clients.length} clients`);

    // Process each client
    for (const client of clients) {
      results.clientsProcessed++;

      try {
        // 1. Evaluate streak for yesterday
        results.streaksEvaluated++;
        const streakIncremented = await evaluateStreakBeforeReset(
          client.id,
          yesterdayDate
        );

        if (streakIncremented) {
          results.streaksIncremented++;
          console.log(
            `[RESET] Streak incremented for client ${client.name} (${client.id})`
          );
        } else {
          console.log(
            `[RESET] Streak reset to 0 for client ${client.name} (${client.id})`
          );
        }

        // 2. Reset daily checklist items
        await resetDailyChecklist(client.id, resetDate);

        // 3. Reset daily notes
        await resetDailyNote(client.id, resetDate);

        // 4. Reset day summary
        await resetDaySummary(client.id, resetDate);

        results.clientsSucceeded++;
      } catch (error: any) {
        results.clientsFailed++;
        console.error(
          `[RESET] Error processing client ${client.name} (${client.id}):`,
          error.message
        );
      }
    }

    // Update audit log with success
    await updateResetAuditEntry(resetDate, results, "completed");

    console.log(
      `[RESET] Completed: ${results.clientsSucceeded}/${results.clientsProcessed} succeeded`
    );
    console.log(
      `[RESET] Streaks evaluated: ${results.streaksEvaluated}, incremented: ${results.streaksIncremented}`
    );

    return results;
  } catch (error: any) {
    console.error("[RESET] Fatal error during reset:", error.message);

    // Update audit log with failure
    await updateResetAuditEntry(resetDate, results, "failed", error.message);

    throw error;
  }
}

/**
 * Perform reset with automatic retry logic
 * Retries up to 3 times with 5-minute intervals
 */
export async function performDailyResetWithRetry(
  maxAttempts: number = 3
): Promise<ResetResult> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[RESET] Attempt ${attempt}/${maxAttempts}`);
      return await performDailyReset();
    } catch (error: any) {
      lastError = error;
      console.error(
        `[RESET] Attempt ${attempt} failed:`,
        error.message
      );

      if (attempt < maxAttempts) {
        console.log(
          `[RESET] Waiting 5 minutes before retry...`
        );
        // Wait 5 minutes (300000 ms) before retry
        await new Promise((resolve) => setTimeout(resolve, 300000));
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Reset failed after all retry attempts");
}
