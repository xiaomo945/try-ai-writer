"use client";

import { useState, useEffect, useCallback } from "react";

export interface WorkflowReview {
  id: string;
  workflowId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const STORAGE_KEY = "workflow_reviews";

function getReviews(): WorkflowReview[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed as WorkflowReview[];
  } catch {
    return [];
  }
}

function saveReviews(reviews: WorkflowReview[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function useWorkflowReviews(workflowId: string) {
  const [reviews, setReviews] = useState<WorkflowReview[]>([]);

  const loadReviews = useCallback(() => {
    const allReviews = getReviews();
    setReviews(allReviews.filter(r => r.workflowId === workflowId));
  }, [workflowId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const addReview = useCallback((rating: number, comment?: string) => {
    const newReview: WorkflowReview = {
      id: crypto.randomUUID(),
      workflowId,
      userId: "Anonymous",
      rating,
      comment: comment?.trim(),
      createdAt: new Date().toISOString(),
    };
    const allReviews = getReviews();
    allReviews.push(newReview);
    saveReviews(allReviews);
    setReviews(allReviews.filter(r => r.workflowId === workflowId));
  }, [workflowId]);

  const deleteReview = useCallback((reviewId: string) => {
    const allReviews = getReviews().filter(r => r.id !== reviewId);
    saveReviews(allReviews);
    setReviews(allReviews.filter(r => r.workflowId === workflowId));
  }, [workflowId]);

  return {
    reviews,
    averageRating,
    reviewCount: reviews.length,
    addReview,
    deleteReview,
  };
}
