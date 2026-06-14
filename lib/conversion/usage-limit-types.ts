import { z } from "zod";

export const UsageLimitSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  feature: z.string(),
  used: z.number(),
  limit: z.number(),
  resetAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UsageLimit = z.infer<typeof UsageLimitSchema>;

export const UsageLimitConfigSchema = z.object({
  feature: z.string(),
  freeLimit: z.number(),
  proLimit: z.number(),
  resetPeriod: z.enum(["daily", "monthly", "yearly"]),
});

export type UsageLimitConfig = z.infer<typeof UsageLimitConfigSchema>;

export const USAGE_LIMIT_CONFIGS: UsageLimitConfig[] = [
  {
    feature: "ai_generation",
    freeLimit: 5,
    proLimit: -1, // unlimited
    resetPeriod: "daily",
  },
  {
    feature: "brand_voice",
    freeLimit: 1,
    proLimit: -1,
    resetPeriod: "monthly",
  },
  {
    feature: "template_access",
    freeLimit: 5,
    proLimit: -1,
    resetPeriod: "monthly",
  },
];
