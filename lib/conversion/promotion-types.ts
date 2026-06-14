import { z } from "zod";

export const PromotionSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  discount: z.number(), // percentage
  title: z.string(),
  description: z.string(),
  validFrom: z.date(),
  validUntil: z.date(),
  maxUses: z.number().nullable(),
  usedCount: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Promotion = z.infer<typeof PromotionSchema>;

export const CreatePromotionSchema = z.object({
  code: z.string().min(1).max(50),
  discount: z.number().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().max(500),
  validFrom: z.date(),
  validUntil: z.date(),
  maxUses: z.number().nullable().optional(),
});

export type CreatePromotion = z.infer<typeof CreatePromotionSchema>;
