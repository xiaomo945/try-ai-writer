import { StyleEvolution, StyleAnalysis } from "./analysis-types";
import { randomUUID } from "crypto";

// In-memory storage for style evolution tracking
const styleEvolutions = new Map<string, StyleEvolution[]>();

// Record style evolution
export function recordStyleEvolution(analysis: StyleAnalysis): StyleEvolution {
  const evolution: StyleEvolution = {
    id: randomUUID(),
    userId: analysis.userId,
    analysisId: analysis.id,
    timestamp: analysis.analyzedAt,
    overallScore: analysis.overallScore,
    toneScore: analysis.tone.toneScore,
    readabilityScore: analysis.readability.fleschReadingEase,
    engagementScore: analysis.engagement.engagementScore,
  };

  const userEvolutions = styleEvolutions.get(analysis.userId) || [];
  userEvolutions.push(evolution);

  // Keep only last 100 entries per user
  if (userEvolutions.length > 100) {
    userEvolutions.splice(0, userEvolutions.length - 100);
  }

  styleEvolutions.set(analysis.userId, userEvolutions);
  return evolution;
}

// Get style evolution history for a user
export function getStyleEvolutionHistory(
  userId: string,
  limit: number = 50
): StyleEvolution[] {
  const evolutions = styleEvolutions.get(userId) || [];
  return evolutions
    .slice(-limit)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
}

// Calculate style trends
export function calculateStyleTrends(
  userId: string,
  days: number = 30
): {
  overallTrend: number;
  toneTrend: number;
  readabilityTrend: number;
  engagementTrend: number;
  period: number;
} {
  const history = getStyleEvolutionHistory(userId, 100);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentEvolutions = history.filter((e) => e.timestamp >= cutoffDate);

  if (recentEvolutions.length < 2) {
    return {
      overallTrend: 0,
      toneTrend: 0,
      readabilityTrend: 0,
      engagementTrend: 0,
      period: days,
    };
  }

  // Calculate trend using linear regression slope
  const calculateTrend = (values: number[]): number => {
    if (values.length < 2) return 0;
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, v) => sum + v, 0);
    const sumXY = values.reduce((sum, v, i) => sum + i * v, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  };

  const overallTrend = calculateTrend(recentEvolutions.map((e) => e.overallScore));
  const toneTrend = calculateTrend(recentEvolutions.map((e) => e.toneScore));
  const readabilityTrend = calculateTrend(recentEvolutions.map((e) => e.readabilityScore));
  const engagementTrend = calculateTrend(recentEvolutions.map((e) => e.engagementScore));

  return {
    overallTrend,
    toneTrend,
    readabilityTrend,
    engagementTrend,
    period: days,
  };
}

// Get style evolution summary
export function getStyleEvolutionSummary(userId: string): {
  totalAnalyses: number;
  firstAnalysis: StyleEvolution | null;
  latestAnalysis: StyleEvolution | null;
  improvement: {
    overall: number;
    tone: number;
    readability: number;
    engagement: number;
  };
} {
  const history = getStyleEvolutionHistory(userId, 1000);

  if (history.length === 0) {
    return {
      totalAnalyses: 0,
      firstAnalysis: null,
      latestAnalysis: null,
      improvement: {
        overall: 0,
        tone: 0,
        readability: 0,
        engagement: 0,
      },
    };
  }

  const first = history[0]!;
  const latest = history[history.length - 1]!;

  return {
    totalAnalyses: history.length,
    firstAnalysis: first,
    latestAnalysis: latest,
    improvement: {
      overall: latest.overallScore - first.overallScore,
      tone: latest.toneScore - first.toneScore,
      readability: latest.readabilityScore - first.readabilityScore,
      engagement: latest.engagementScore - first.engagementScore,
    },
  };
}
