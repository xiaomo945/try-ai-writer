import { UpdateNotification, UserNotificationStatus } from "./update-notification-types";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const notifications = new Map<string, UpdateNotification>();
const userStatuses = new Map<string, UserNotificationStatus>();

// Initialize some default notifications
function initializeNotifications() {
  if (notifications.size > 0) return;

  const now = new Date();

  const notif1: UpdateNotification = {
    id: randomUUID(),
    title: "全新品牌声音分析功能上线",
    description: "现在您可以分析文本的语气、词汇、可读性等多维度指标，并与行业标杆对比。",
    type: "feature",
    version: "2.0.0",
    actionUrl: "/brand-voice",
    publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    isActive: true,
  };

  const notif2: UpdateNotification = {
    id: randomUUID(),
    title: "团队协作功能优化",
    description: "改进了团队成员管理界面，支持批量邀请和权限管理。",
    type: "improvement",
    version: "2.0.1",
    actionUrl: "/teams",
    publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    isActive: true,
  };

  const notif3: UpdateNotification = {
    id: randomUUID(),
    title: "每日登录奖励系统",
    description: "连续登录可获得积分、功能访问权限和折扣券等奖励。",
    type: "feature",
    version: "2.0.2",
    actionUrl: "/dashboard",
    publishedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    isActive: true,
  };

  notifications.set(notif1.id, notif1);
  notifications.set(notif2.id, notif2);
  notifications.set(notif3.id, notif3);
}

initializeNotifications();

export async function getActiveNotifications(): Promise<UpdateNotification[]> {
  return Array.from(notifications.values())
    .filter((n) => n.isActive)
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export async function getUserNotificationStatus(
  userId: string,
  notificationId: string
): Promise<UserNotificationStatus | null> {
  return (
    Array.from(userStatuses.values()).find(
      (s) => s.userId === userId && s.notificationId === notificationId
    ) || null
  );
}

export async function getUnreadNotifications(
  userId: string
): Promise<Array<UpdateNotification & { status: UserNotificationStatus | null }>> {
  const activeNotifications = await getActiveNotifications();
  const result = [];

  for (const notif of activeNotifications) {
    const status = await getUserNotificationStatus(userId, notif.id);
    if (!status || !status.read) {
      result.push({ ...notif, status });
    }
  }

  return result;
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<UserNotificationStatus> {
  const existing = await getUserNotificationStatus(userId, notificationId);

  if (existing) {
    existing.read = true;
    existing.readAt = new Date();
    userStatuses.set(existing.id, existing);
    return existing;
  }

  const id = randomUUID();
  const status: UserNotificationStatus = {
    id,
    userId,
    notificationId,
    read: true,
    dismissed: false,
    readAt: new Date(),
    dismissedAt: null,
  };

  userStatuses.set(id, status);
  return status;
}

export async function dismissNotification(
  userId: string,
  notificationId: string
): Promise<UserNotificationStatus> {
  const existing = await getUserNotificationStatus(userId, notificationId);

  if (existing) {
    existing.dismissed = true;
    existing.dismissedAt = new Date();
    userStatuses.set(existing.id, existing);
    return existing;
  }

  const id = randomUUID();
  const status: UserNotificationStatus = {
    id,
    userId,
    notificationId,
    read: true,
    dismissed: true,
    readAt: new Date(),
    dismissedAt: new Date(),
  };

  userStatuses.set(id, status);
  return status;
}

export async function getAllNotificationsWithStatus(
  userId: string
): Promise<Array<UpdateNotification & { status: UserNotificationStatus | null }>> {
  const activeNotifications = await getActiveNotifications();
  const result = [];

  for (const notif of activeNotifications) {
    const status = await getUserNotificationStatus(userId, notif.id);
    result.push({ ...notif, status });
  }

  return result;
}
