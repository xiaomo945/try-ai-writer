import { DailyReward, REWARD_CONFIGS } from "./daily-reward-types";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const dailyRewards = new Map<string, DailyReward>();

function getTodayString(): string {
  return new Date().toISOString().substring(0, 10);
}

export async function getDailyReward(userId: string): Promise<DailyReward | null> {
  return (
    Array.from(dailyRewards.values()).find((r) => r.userId === userId) || null
  );
}

export async function initializeDailyReward(userId: string): Promise<DailyReward> {
  const existing = await getDailyReward(userId);
  if (existing) return existing;

  const now = new Date();
  const id = randomUUID();
  const reward: DailyReward = {
    id,
    userId,
    loginStreak: 0,
    lastLoginDate: getTodayString(),
    totalRewards: 0,
    claimedRewards: [],
    createdAt: now,
    updatedAt: now,
  };

  dailyRewards.set(id, reward);
  return reward;
}

export async function checkLoginStreak(
  userId: string
): Promise<{
  currentStreak: number;
  canClaim: boolean;
  nextReward: { streakDays: number; description: string } | null;
}> {
  let reward = await getDailyReward(userId);
  if (!reward) {
    reward = await initializeDailyReward(userId);
  }

  const today = getTodayString();
  const lastLogin = new Date(reward.lastLoginDate);
  const todayDate = new Date(today);
  const daysDiff = Math.floor(
    (todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
  );

  let currentStreak = reward.loginStreak;

  // If already logged in today
  if (daysDiff === 0) {
    const canClaim = false;
    const nextRewardConfig = REWARD_CONFIGS.find(
      (c) => c.streakDays > currentStreak
    );
    return {
      currentStreak,
      canClaim,
      nextReward: nextRewardConfig
        ? {
            streakDays: nextRewardConfig.streakDays,
            description: nextRewardConfig.description,
          }
        : null,
    };
  }

  // If missed a day
  if (daysDiff > 1) {
    currentStreak = 0;
  }

  const canClaim = true;
  const nextRewardConfig = REWARD_CONFIGS.find(
    (c) => c.streakDays > currentStreak
  );

  return {
    currentStreak,
    canClaim,
    nextReward: nextRewardConfig
      ? {
          streakDays: nextRewardConfig.streakDays,
          description: nextRewardConfig.description,
        }
      : null,
  };
}

export async function claimDailyReward(
  userId: string
): Promise<{
  success: boolean;
  reward: DailyReward | null;
  claimedReward: { rewardType: string; rewardValue: number } | null;
}> {
  let reward = await getDailyReward(userId);
  if (!reward) {
    reward = await initializeDailyReward(userId);
  }

  const today = getTodayString();
  const lastLogin = new Date(reward.lastLoginDate);
  const todayDate = new Date(today);
  const daysDiff = Math.floor(
    (todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Already claimed today
  if (daysDiff === 0) {
    return { success: false, reward, claimedReward: null };
  }

  // Update streak
  if (daysDiff > 1) {
    reward.loginStreak = 1;
  } else {
    reward.loginStreak += 1;
  }

  reward.lastLoginDate = today;

  // Check for rewards
  const rewardConfig = REWARD_CONFIGS.find(
    (c) => c.streakDays === reward.loginStreak
  );

  let claimedReward = null;
  if (rewardConfig) {
    claimedReward = {
      rewardType: rewardConfig.rewardType,
      rewardValue: rewardConfig.rewardValue,
    };

    reward.claimedRewards.push({
      date: today,
      rewardType: rewardConfig.rewardType,
      rewardValue: rewardConfig.rewardValue,
    });

    reward.totalRewards += rewardConfig.rewardValue;
  }

  reward.updatedAt = new Date();
  dailyRewards.set(reward.id, reward);

  return { success: true, reward, claimedReward };
}

export async function getLoginStreak(userId: string): Promise<number> {
  const reward = await getDailyReward(userId);
  if (!reward) return 0;

  const today = getTodayString();
  const lastLogin = new Date(reward.lastLoginDate);
  const todayDate = new Date(today);
  const daysDiff = Math.floor(
    (todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If missed a day, streak is broken
  if (daysDiff > 1) return 0;

  return reward.loginStreak;
}
