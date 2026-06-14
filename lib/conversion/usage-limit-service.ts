import { UsageLimit, USAGE_LIMIT_CONFIGS } from "./usage-limit-types";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const usageLimits = new Map<string, UsageLimit>();

function getResetDate(period: "daily" | "monthly" | "yearly"): Date {
  const now = new Date();
  const reset = new Date(now);

  switch (period) {
    case "daily":
      reset.setDate(reset.getDate() + 1);
      reset.setHours(0, 0, 0, 0);
      break;
    case "monthly":
      reset.setMonth(reset.getMonth() + 1);
      reset.setDate(1);
      reset.setHours(0, 0, 0, 0);
      break;
    case "yearly":
      reset.setFullYear(reset.getFullYear() + 1);
      reset.setMonth(0);
      reset.setDate(1);
      reset.setHours(0, 0, 0, 0);
      break;
  }

  return reset;
}

export async function getUsageLimit(
  userId: string,
  feature: string
): Promise<UsageLimit | null> {
  return (
    Array.from(usageLimits.values()).find(
      (limit) => limit.userId === userId && limit.feature === feature
    ) || null
  );
}

export async function initializeUsageLimit(
  userId: string,
  feature: string
): Promise<UsageLimit> {
  const config = USAGE_LIMIT_CONFIGS.find((c) => c.feature === feature);
  if (!config) {
    throw new Error(`Unknown feature: ${feature}`);
  }

  const id = randomUUID();
  const now = new Date();
  const limit: UsageLimit = {
    id,
    userId,
    feature,
    used: 0,
    limit: config.freeLimit,
    resetAt: getResetDate(config.resetPeriod),
    createdAt: now,
    updatedAt: now,
  };

  usageLimits.set(id, limit);
  return limit;
}

export async function checkUsageLimit(
  userId: string,
  feature: string
): Promise<{
  canUse: boolean;
  usageLimit: UsageLimit | null;
  remaining: number;
}> {
  let limit = await getUsageLimit(userId, feature);

  if (!limit) {
    limit = await initializeUsageLimit(userId, feature);
  }

  // Check if reset time has passed
  const now = new Date();
  if (now >= limit.resetAt) {
    const config = USAGE_LIMIT_CONFIGS.find((c) => c.feature === feature);
    if (config) {
      limit.used = 0;
      limit.resetAt = getResetDate(config.resetPeriod);
      limit.updatedAt = now;
      usageLimits.set(limit.id, limit);
    }
  }

  const remaining = limit.limit === -1 ? -1 : limit.limit - limit.used;
  const canUse = remaining === -1 || remaining > 0;

  return { canUse, usageLimit: limit, remaining };
}

export async function incrementUsage(
  userId: string,
  feature: string,
  amount: number = 1
): Promise<{
  success: boolean;
  usageLimit: UsageLimit | null;
  remaining: number;
}> {
  const check = await checkUsageLimit(userId, feature);

  if (!check.canUse) {
    return { success: false, usageLimit: check.usageLimit, remaining: 0 };
  }

  if (check.usageLimit) {
    check.usageLimit.used += amount;
    check.usageLimit.updatedAt = new Date();
    usageLimits.set(check.usageLimit.id, check.usageLimit);

    const remaining =
      check.usageLimit.limit === -1
        ? -1
        : check.usageLimit.limit - check.usageLimit.used;

    return { success: true, usageLimit: check.usageLimit, remaining };
  }

  return { success: false, usageLimit: null, remaining: 0 };
}

export async function upgradeUsageLimit(
  userId: string,
  feature: string
): Promise<UsageLimit | null> {
  const limit = await getUsageLimit(userId, feature);
  const config = USAGE_LIMIT_CONFIGS.find((c) => c.feature === feature);

  if (!limit || !config) return null;

  limit.limit = config.proLimit;
  limit.updatedAt = new Date();
  usageLimits.set(limit.id, limit);

  return limit;
}

export async function getUserUsageLimits(
  userId: string
): Promise<UsageLimit[]> {
  return Array.from(usageLimits.values()).filter(
    (limit) => limit.userId === userId
  );
}
