import { z } from "zod";

export const UpdateNotificationSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  type: z.enum(["feature", "improvement", "bugfix", "announcement"]),
  version: z.string().optional(),
  imageUrl: z.string().optional(),
  actionUrl: z.string().optional(),
  publishedAt: z.date(),
  isActive: z.boolean(),
});

export type UpdateNotification = z.infer<typeof UpdateNotificationSchema>;

export const UserNotificationStatusSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  notificationId: z.string().uuid(),
  read: z.boolean(),
  dismissed: z.boolean(),
  readAt: z.date().nullable(),
  dismissedAt: z.date().nullable(),
});

export type UserNotificationStatus = z.infer<typeof UserNotificationStatusSchema>;
