/**
 * In-App Notification System
 * 
 * Uses Turso/SQLite for storage. No external service needed.
 * Free tier: Unlimited (self-hosted database)
 */

import { db } from './db';

export interface Notification {
  id?: string;
  userId: string;
  orgId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  createdAt?: string;
}

/**
 * Create notifications table SQL
 */
export const NOTIFICATIONS_SCHEMA = `
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    org_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read INTEGER DEFAULT 0,
    action_url TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
`;

/**
 * Create a new notification
 */
export async function createNotification(
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<Notification> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  await db.execute({
    sql: `INSERT INTO notifications (id, user_id, org_id, title, message, type, read, action_url, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, notification.userId, notification.orgId || null, notification.title, 
           notification.message, notification.type, 0, notification.actionUrl || null, now],
  });

  return { ...notification, id, createdAt: now };
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  options: { limit?: number; unreadOnly?: boolean } = {}
): Promise<Notification[]> {
  const { limit = 50, unreadOnly = false } = options;
  
  const where = unreadOnly ? 'AND read = 0' : '';
  const result = await db.execute({
    sql: `SELECT * FROM notifications WHERE user_id = ? ${where}
          ORDER BY created_at DESC LIMIT ?`,
    args: [userId, limit],
  });

  return result.rows.map(row => ({
    id: row.id as string,
    userId: row.user_id as string,
    orgId: row.org_id as string | undefined,
    title: row.title as string,
    message: row.message as string,
    type: row.type as Notification['type'],
    read: Boolean(row.read),
    actionUrl: row.action_url as string | undefined,
    createdAt: row.created_at as string,
  }));
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  await db.execute({
    sql: 'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
    args: [notificationId, userId],
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(userId: string): Promise<void> {
  await db.execute({
    sql: 'UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0',
    args: [userId],
  });
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string, userId: string): Promise<void> {
  await db.execute({
    sql: 'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    args: [notificationId, userId],
  });
}

/**
 * Get unread count
 */
export async function getUnreadCount(userId: string): Promise<number> {
  const result = await db.execute({
    sql: 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
    args: [userId],
  });
  return Number(result.rows[0]?.count || 0);
}

/**
 * Delete old notifications (cleanup job)
 */
export async function cleanupOldNotifications(daysOld: number = 30): Promise<number> {
  const result = await db.execute({
    sql: `DELETE FROM notifications WHERE created_at < datetime('now', '-' || ? || ' days')`,
    args: [daysOld],
  });
  return result.rowsAffected;
}
