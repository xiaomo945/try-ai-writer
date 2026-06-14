import { Feedback, CreateFeedback } from "./feedback-types";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const feedbacks = new Map<string, Feedback>();

export async function getFeedbacks(userId: string): Promise<Feedback[]> {
  return Array.from(feedbacks.values())
    .filter((f) => f.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getFeedback(id: string): Promise<Feedback | null> {
  return feedbacks.get(id) || null;
}

export async function createFeedback(
  userId: string,
  data: CreateFeedback
): Promise<Feedback> {
  const id = randomUUID();
  const now = new Date();

  const feedback: Feedback = {
    id,
    userId,
    type: data.type,
    title: data.title,
    description: data.description,
    priority: data.priority || "medium",
    status: "pending",
    rating: data.rating,
    createdAt: now,
    updatedAt: now,
  };

  feedbacks.set(id, feedback);
  return feedback;
}

export async function updateFeedbackStatus(
  id: string,
  status: "pending" | "in_progress" | "resolved" | "closed"
): Promise<Feedback | null> {
  const feedback = feedbacks.get(id);
  if (!feedback) return null;

  feedback.status = status;
  feedback.updatedAt = new Date();
  feedbacks.set(id, feedback);

  return feedback;
}

export async function getFeedbackStats(userId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageRating: number;
}> {
  const userFeedbacks = await getFeedbacks(userId);

  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  let totalRating = 0;
  let ratingCount = 0;

  for (const feedback of userFeedbacks) {
    byType[feedback.type] = (byType[feedback.type] || 0) + 1;
    byStatus[feedback.status] = (byStatus[feedback.status] || 0) + 1;

    if (feedback.rating) {
      totalRating += feedback.rating;
      ratingCount++;
    }
  }

  return {
    total: userFeedbacks.length,
    byType,
    byStatus,
    averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
  };
}
