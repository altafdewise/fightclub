import { query } from "./db";

export type NotificationType =
  | "checkin_reminder"
  | "checkin_received"
  | "trainer_reply"
  | "client_inactive"
  | "streak_warning"
  | "streak_saved"
  | "new_message";

export type UserType = "client" | "trainer" | "hq";

export type NotificationRow = {
  id: string;
  user_type: UserType;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType | string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

type CreateParams = {
  userType: UserType;
  userId: string;
  title: string;
  message: string;
  type: NotificationType | string;
  link?: string | null;
};

export async function createNotification(params: CreateParams): Promise<NotificationRow> {
  const result = await query<NotificationRow>(
    `INSERT INTO notifications (user_type, user_id, title, message, type, link)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_type, user_id, title, message, type, link, is_read, created_at`,
    [params.userType, params.userId, params.title, params.message, params.type, params.link ?? null]
  );
  return result.rows[0];
}

export async function markNotificationRead(id: string, userType: UserType, userId: string) {
  await query(
    `UPDATE notifications
     SET is_read = true
     WHERE id = $1 AND user_type = $2 AND user_id = $3`,
    [id, userType, userId]
  );
}

export async function markAllNotificationsRead(userType: UserType, userId: string) {
  await query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_type = $1 AND user_id = $2 AND is_read = false`,
    [userType, userId]
  );
}

export async function getUnreadCount(userType: UserType, userId: string): Promise<number> {
  const res = await query<{ count: string }>(
    `SELECT COUNT(*)::int AS count
     FROM notifications
     WHERE user_type = $1 AND user_id = $2 AND is_read = false`,
    [userType, userId]
  );
  return parseInt(res.rows[0]?.count || "0", 10);
}

export async function getNotifications(userType: UserType, userId: string, limit = 30): Promise<NotificationRow[]> {
  const res = await query<NotificationRow>(
    `SELECT id, user_type, user_id, title, message, type, link, is_read, created_at
     FROM notifications
     WHERE user_type = $1 AND user_id = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [userType, userId, limit]
  );
  return res.rows;
}
