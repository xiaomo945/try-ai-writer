import { z } from "zod";

export const UsageReminderSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["inactive", "streak_warning", "feature_suggestion"]),
  message: z.string(),
  actionUrl: z.string().optional(),
  read: z.boolean(),
  createdAt: z.date(),
  readAt: z.date().nullable(),
});

export type UsageReminder = z.infer<typeof UsageReminderSchema>;

export const ReminderConfigSchema = z.object({
  inactiveDays: z.number(),
  message: z.string(),
  actionUrl: z.string().optional(),
});

export type ReminderConfig = z.infer<typeof ReminderConfigSchema>;

export const REMINDER_CONFIGS: ReminderConfig[] = [
  {
    inactiveDays: 3,
    message: "好久不见！我们想念你。回来看看有什么新内容吧。",
    actionUrl: "/write",
  },
  {
    inactiveDays: 7,
    message: "你已经一周没来了！你的连续登录记录即将中断，快来保持记录吧。",
    actionUrl: "/dashboard",
  },
  {
    inactiveDays: 14,
    message: "我们推出了新功能，快来体验吧！",
    actionUrl: "/templates",
  },
];
