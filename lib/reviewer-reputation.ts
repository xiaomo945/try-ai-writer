"use client";

export interface ReviewerReputation {
  userId: string;
  totalReviews: number;
  averageRating: number;
  helpfulVotesReceived: number;
  reputation: number;
  level: "新手" | "活跃" | "专家" | "大师";
}

const STORAGE_KEY = "reviewer_reputations";
const COMMUNITY_AVG_RATING = 4.2;

function getReputations(): Record<string, ReviewerReputation> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
}

function saveReputations(reputations: Record<string, ReviewerReputation>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reputations));
}

export function calculateReputation(userId: string): ReviewerReputation {
  const reputations = getReputations();
  const existing = reputations[userId];

  // Get reviews for this user
  let totalReviews = existing?.totalReviews || 0;
  let helpfulVotesReceived = existing?.helpfulVotesReceived || 0;
  let averageRating = existing?.averageRating || 0;

  // Recalculate from actual review data
  if (typeof window !== "undefined") {
    try {
      const reviewsData = localStorage.getItem("workflow_reviews");
      if (reviewsData) {
        const allReviews = JSON.parse(reviewsData);
        const userReviews = allReviews.filter(
          (review: { userId: string }) => review.userId === userId
        );

        if (userReviews.length > 0) {
          totalReviews = userReviews.length;
          averageRating =
            userReviews.reduce(
              (sum: number, review: { rating: number }) => sum + review.rating,
              0
            ) / userReviews.length;
          helpfulVotesReceived = userReviews.reduce(
            (sum: number, review: { helpfulCount: number }) =>
              sum + (review.helpfulCount || 0),
            0
          );
        }
      }
    } catch {
      // Ignore errors
    }
  }

  // Calculate reputation score (0-100)
  const reviewScore = Math.min(totalReviews * 5, 40);
  const helpfulScore = Math.min(helpfulVotesReceived * 2, 30);
  const ratingDeviation = Math.abs(averageRating - COMMUNITY_AVG_RATING);
  const ratingScore = Math.max(0, 30 - ratingDeviation * 10);

  const reputation = Math.min(100, reviewScore + helpfulScore + ratingScore);

  // Determine level
  let level: ReviewerReputation["level"];
  if (reputation <= 20) {
    level = "新手";
  } else if (reputation <= 50) {
    level = "活跃";
  } else if (reputation <= 80) {
    level = "专家";
  } else {
    level = "大师";
  }

  const result: ReviewerReputation = {
    userId,
    totalReviews,
    averageRating,
    helpfulVotesReceived,
    reputation,
    level,
  };

  // Save to storage
  reputations[userId] = result;
  saveReputations(reputations);

  return result;
}

export function getReviewerLevel(userId: string): ReviewerReputation["level"] | null {
  const reputations = getReputations();
  const existing = reputations[userId];

  if (!existing) {
    return null;
  }

  return existing.level;
}

export function getReviewerReputation(userId: string): ReviewerReputation | null {
  const reputations = getReputations();
  return reputations[userId] || null;
}

export function updateReviewerOnVote(
  userId: string,
  reviewId: string,
  isHelpful: boolean
): void {
  const reputations = getReputations();
  const existing = reputations[userId];

  if (!existing) {
    // Initialize reputation
    calculateReputation(userId);
    return;
  }

  // Recalculate reputation
  calculateReputation(userId);
}
