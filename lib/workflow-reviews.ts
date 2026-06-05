"use client";

import { useState, useEffect, useCallback } from "react";

export interface WorkflowReview {
  id: string;
  workflowId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  helpfulCount: number;
  notHelpfulCount: number;
}

const STORAGE_KEY = "workflow_reviews";
const VOTES_KEY = "workflow_review_votes";

type SortBy = "time" | "rating" | "useful";

function getReviews(): WorkflowReview[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // Add default helpful counts if missing
    return parsed.map((review) => ({
      helpfulCount: 0,
      notHelpfulCount: 0,
      ...review,
    })) as WorkflowReview[];
  } catch {
    return [];
  }
}

function saveReviews(reviews: WorkflowReview[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function getVotes(): Record<string, "helpful" | "notHelpful"> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(VOTES_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function saveVotes(votes: Record<string, "helpful" | "notHelpful">): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
}

export function useWorkflowReviews(workflowId: string) {
  const [reviews, setReviews] = useState<WorkflowReview[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("time");

  const loadReviews = useCallback(() => {
    const allReviews = getReviews();
    setReviews(allReviews.filter(r => r.workflowId === workflowId));
  }, [workflowId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const sortedReviews = useCallback(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "useful":
        sorted.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case "time":
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [reviews, sortBy]);

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
      helpfulCount: 0,
      notHelpfulCount: 0,
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

  const voteHelpful = useCallback((reviewId: string, isHelpful: boolean) => {
    const allReviews = getReviews();
    const votes = getVotes();
    const voteKey = `user_${"Anonymous"}_${reviewId}`;
    const previousVote = votes[voteKey];

    const updatedReviews = allReviews.map(review => {
      if (review.id !== reviewId) return review;

      let newHelpfulCount = review.helpfulCount;
      let newNotHelpfulCount = review.notHelpfulCount;

      if (previousVote === "helpful") {
        newHelpfulCount -= 1;
      } else if (previousVote === "notHelpful") {
        newNotHelpfulCount -= 1;
      }

      if (isHelpful) {
        newHelpfulCount += 1;
        votes[voteKey] = "helpful";
      } else {
        newNotHelpfulCount += 1;
        votes[voteKey] = "notHelpful";
      }

      return {
        ...review,
        helpfulCount: Math.max(0, newHelpfulCount),
        notHelpfulCount: Math.max(0, newNotHelpfulCount),
      };
    });

    saveReviews(updatedReviews);
    saveVotes(votes);
    setReviews(updatedReviews.filter(r => r.workflowId === workflowId));
  }, [workflowId]);

  const getCurrentVote = useCallback((reviewId: string) => {
    const votes = getVotes();
    return votes[`user_Anonymous_${reviewId}`];
  }, []);

  return {
    reviews: sortedReviews(),
    averageRating,
    reviewCount: reviews.length,
    addReview,
    deleteReview,
    voteHelpful,
    getCurrentVote,
    sortBy,
    setSortBy,
  };
}
