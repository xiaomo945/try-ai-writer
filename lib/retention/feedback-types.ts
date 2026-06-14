import { z } from "zod";

export const FeedbackSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.enum(["bug", "feature", "improvement", "other"]),
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "in_progress", "resolved", "closed"]),
  rating: z.number().min(1).max(5).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;

export const CreateFeedbackSchema = z.object({
  type: z.enum(["bug", "feature", "improvement", "other"]),
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  priority: z.enum(["low", "medium", "high"]).optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type CreateFeedback = z.infer<typeof CreateFeedbackSchema>;
