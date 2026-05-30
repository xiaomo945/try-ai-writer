import type { MemoryItem } from "./memory-bank";
import type { BrandVoiceProfile as MatcherProfile } from "./style-matcher";
import { scoreStyleMatch } from "./style-matcher";
import type { StyleFingerprint } from "./style-fingerprint";
import { getFingerprintSummary } from "./style-fingerprint";

export interface WeeklyStyleReport {
  weekStart: string;
  weekEnd: string;
  newSamplesCount: number;
  styleMatchChange: {
    previous: number;
    current: number;
    direction: "up" | "down" | "stable";
  };
  topKeywords: string[];
  styleStability: number;
  evolutionSummary: string;
  fingerprintSummary: string;
}

function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getPreviousWeekBounds(): { start: Date; end: Date } {
  const { start } = getWeekBounds();
  const prevStart = new Date(start);
  prevStart.setDate(start.getDate() - 7);

  const prevEnd = new Date(prevStart);
  prevEnd.setDate(prevStart.getDate() + 6);
  prevEnd.setHours(23, 59, 59, 999);

  return { start: prevStart, end: prevEnd };
}

function countMemoriesInWeek(memories: MemoryItem[], weekStart: Date, weekEnd: Date): number {
  return memories.filter((m) => {
    const created = new Date(m.createdAt);
    return created >= weekStart && created <= weekEnd;
  }).length;
}

function extractTopKeywords(memories: MemoryItem[], weekStart: Date, weekEnd: Date, limit: number = 5): string[] {
  const weekMemories = memories.filter((m) => {
    const created = new Date(m.createdAt);
    return created >= weekStart && created <= weekEnd;
  });

  const keywordCounts: Record<string, number> = {};
  for (const memory of weekMemories) {
    for (const keyword of memory.keywords) {
      const lower = keyword.toLowerCase();
      keywordCounts[lower] = (keywordCounts[lower] || 0) + 1;
    }
  }

  return Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([keyword]) => keyword);
}

function calculateStyleStability(
  memories: MemoryItem[],
  profile: MatcherProfile,
  weekStart: Date,
  weekEnd: Date
): number {
  const weekMemories = memories.filter((m) => {
    const created = new Date(m.createdAt);
    return created >= weekStart && created <= weekEnd;
  });

  if (weekMemories.length < 2) return 100;

  const scores = weekMemories.map((m) => scoreStyleMatch(m.content, profile).score);
  const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  return Math.max(0, Math.min(100, Math.round(100 - stdDev * 2)));
}

export function generateWeeklyStyleReport(
  memories: MemoryItem[],
  profile: MatcherProfile,
  fingerprint?: StyleFingerprint
): WeeklyStyleReport {
  const { start: weekStart, end: weekEnd } = getWeekBounds();
  const { start: prevStart, end: prevEnd } = getPreviousWeekBounds();

  const newSamplesCount = countMemoriesInWeek(memories, weekStart, weekEnd);
  const topKeywords = extractTopKeywords(memories, weekStart, weekEnd);
  const styleStability = calculateStyleStability(memories, profile, weekStart, weekEnd);

  const currentWeekMemories = memories.filter((m) => {
    const created = new Date(m.createdAt);
    return created >= weekStart && created <= weekEnd;
  });
  const prevWeekMemories = memories.filter((m) => {
    const created = new Date(m.createdAt);
    return created >= prevStart && created <= prevEnd;
  });

  let currentScore = 0;
  let previousScore = 0;

  if (currentWeekMemories.length > 0) {
    const scores = currentWeekMemories.map((m) => scoreStyleMatch(m.content, profile).score);
    currentScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  }

  if (prevWeekMemories.length > 0) {
    const scores = prevWeekMemories.map((m) => scoreStyleMatch(m.content, profile).score);
    previousScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  }

  const direction: "up" | "down" | "stable" =
    currentScore > previousScore + 5 ? "up" : currentScore < previousScore - 5 ? "down" : "stable";

  const fingerprintSummary = fingerprint ? getFingerprintSummary(fingerprint) : "风格指纹尚未生成";

  let evolutionSummary: string;
  if (newSamplesCount === 0) {
    evolutionSummary = "本周还没有新的写作记录，开始写作来获取你的第一份进化报告 ✨";
  } else if (direction === "up") {
    evolutionSummary = `本周你的数字分身学习了${newSamplesCount}个新习惯，风格匹配度从${previousScore}%提升到${currentScore}%`;
  } else if (direction === "down") {
    evolutionSummary = `本周你的数字分身学习了${newSamplesCount}个新习惯，风格匹配度从${previousScore}%变为${currentScore}%，继续写作来提升匹配度`;
  } else {
    evolutionSummary = `本周你的数字分身学习了${newSamplesCount}个新习惯，风格匹配度稳定在${currentScore}%`;
  }

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    newSamplesCount,
    styleMatchChange: {
      previous: previousScore,
      current: currentScore,
      direction,
    },
    topKeywords,
    styleStability,
    evolutionSummary,
    fingerprintSummary,
  };
}
