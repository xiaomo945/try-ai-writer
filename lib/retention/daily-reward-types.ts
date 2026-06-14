import { z } from "zod";

export const DailyRewardSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  loginStreak: z.number(),
  lastLoginDate: z.string(), // YYYY-MM-DD
  totalRewards: z.number(),
  claimedRewards: z.array(z.object({
    date: z.string(),
    rewardType: z.string(),
    rewardValue: z.number(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DailyReward = z.infer<typeof DailyRewardSchema>;

export const RewardConfigSchema = z.object({
  streakDays: z.number(),
  rewardType: z.enum(["credits", "feature_access", "discount"]),
  rewardValue: z.number(),
  description: z.string(),
});

export type RewardConfig = z.infer<typeof RewardConfigSchema>;

export const REWARD_CONFIGS: RewardConfig[] = [
  {
    streakDays: 1,
    rewardType: "credits",
    rewardValue: 10,
    description: "首次登录奖励10积分",
  },
  {
    streakDays: 3,
    rewardType: "credits",
    rewardValue: 30,
    description: "连续3天登录奖励30积分",
  },
  {
    streakDays: 7,
    rewardType: "feature_access",
    rewardValue: 1,
    description: "连续7天登录解锁高级模板1天",
  },
  {
    streakDays: 14,
    rewardType: "discount",
    rewardValue: 20,
    description: "连续14天登录获得20%折扣券",
  },
  {
    streakDays: 30,
    rewardType: "credits",
    rewardValue: 200,
    description: "连续30天登录奖励200积分",
  },
];
