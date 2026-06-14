import { UsageReminder, REMINDER_CONFIGS } from "./reminder-types";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const reminders = new Map<string, UsageReminder>();
const lastActivity = new Map<string, Date>();

export async function recordUserActivity(userId: string): Promise<void> {
  lastActivity.set(userId, new Date());
}

export async function getLastActivity(userId: string): Promise<Date | null> {
  return lastActivity.get(userId) || null;
}

export async function getUnreadReminders(userId: string): Promise<UsageReminder[]> {
  return Array.from(reminders.values())
    .filter((r) => r.userId === userId && !r.read)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getAllReminders(userId: string): Promise<UsageReminder[]> {
  return Array.from(reminders.values())
    .filter((r) => r.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function checkAndGenerateReminders(userId: string): Promise<UsageReminder[]> {
  const lastAct = await getLastActivity(userId);
  if (!lastAct) return [];

  const now = new Date();
  const daysInactive = Math.floor(
    (now.getTime() - lastAct.getTime()) / (1000 * 60 * 60 * 24)
  );

  const newReminders: UsageReminder[] = [];

  for (const config of REMINDER_CONFIGS) {
    if (daysInactive >= config.inactiveDays) {
      // Check if we already sent this reminder recently
      const existingReminder = Array.from(reminders.values()).find(
        (r) =>
          r.userId === userId &&
          r.type === "inactive" &&
          r.message === config.message &&
          r.createdAt.getTime() > now.getTime() - config.inactiveDays * 24 * 60 * 60 * 1000
      );

      if (!existingReminder) {
        const id = randomUUID();
        const reminder: UsageReminder = {
          id,
          userId,
          type: "inactive",
          message: config.message,
          actionUrl: config.actionUrl,
          read: false,
          createdAt: now,
          readAt: null,
        };
        reminders.set(id, reminder);
        newReminders.push(reminder);
      }
    }
  }

  return newReminders;
}

export async function markReminderAsRead(id: string): Promise<UsageReminder | null> {
  const reminder = reminders.get(id);
  if (!reminder) return null;

  reminder.read = true;
  reminder.readAt = new Date();
  reminders.set(id, reminder);

  return reminder;
}

export async function markAllRemindersAsRead(userId: string): Promise<void> {
  const userReminders = Array.from(reminders.values()).filter(
    (r) => r.userId === userId && !r.read
  );

  for (const reminder of userReminders) {
    reminder.read = true;
    reminder.readAt = new Date();
    reminders.set(reminder.id, reminder);
  }
}

export async function createFeatureSuggestion(
  userId: string,
  message: string,
  actionUrl?: string
): Promise<UsageReminder> {
  const id = randomUUID();
  const now = new Date();
  const reminder: UsageReminder = {
    id,
    userId,
    type: "feature_suggestion",
    message,
    actionUrl,
    read: false,
    createdAt: now,
    readAt: null,
  };

  reminders.set(id, reminder);
  return reminder;
}
