import type { MemoryItem } from "./memory-bank";

export interface WeeklyInsights {
  thisWeekGenerations: number;
  lastWeekGenerations: number;
  generationChange: number; // percentage
  mostUsedMode: string;
  memoryGrowth: number;
  styleMatchAverage: number;
  styleMatchChange: number;
}

export function getWeeklyInsights(
  records: Array<{ mode: string; createdAt: string; result?: string; styleMatch?: number }>,
  memories: MemoryItem[],
  weeklyStats: { thisWeekCount: number; lastWeekCount: number },
): WeeklyInsights | null {
  // Calculate this week's data
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekRecords = records.filter(
    (r) => new Date(r.createdAt) > oneWeekAgo,
  );

  if (thisWeekRecords.length === 0 && weeklyStats.thisWeekCount === 0 && memories.filter((m) => new Date(m.createdAt) > oneWeekAgo).length === 0) {
    return null;
  }

  // Calculate most used mode
  const modeCounts: { [key: string]: number } = {};
  thisWeekRecords.forEach((r) => {
    const current = modeCounts[r.mode] ?? 0;
    modeCounts[r.mode] = current + 1;
  });

  let mostUsedMode = "blog";
  let maxCount = 0;
  Object.entries(modeCounts).forEach(([mode, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedMode = mode;
    }
  });

  // Calculate memory growth this week
  const thisWeekMemories = memories.filter(
    (m) => new Date(m.createdAt) > oneWeekAgo,
  );
  const lastWeekMemories = memories.filter(
    (m) => new Date(m.createdAt) > twoWeeksAgo && new Date(m.createdAt) <= oneWeekAgo,
  );
  const memoryGrowth = thisWeekMemories.length;

  // Calculate style match
  const thisWeekStyleMatches = thisWeekRecords
    .map((r) => r.styleMatch ?? 0)
    .filter((v) => v > 0);
  const styleMatchAverage = thisWeekStyleMatches.length > 0
    ? thisWeekStyleMatches.reduce((a, b) => a + b, 0) / thisWeekStyleMatches.length
    : 0;

  // Calculate last week's style matches for comparison
  const lastWeekRecords = records.filter(
    (r) => new Date(r.createdAt) > twoWeeksAgo && new Date(r.createdAt) <= oneWeekAgo,
  );
  const lastWeekStyleMatches = lastWeekRecords
    .map((r) => r.styleMatch ?? 0)
    .filter((v) => v > 0);
  const lastWeekStyleMatchAverage = lastWeekStyleMatches.length > 0
    ? lastWeekStyleMatches.reduce((a, b) => a + b, 0) / lastWeekStyleMatches.length
    : 0;

  const styleMatchChange = lastWeekStyleMatchAverage > 0
    ? ((styleMatchAverage - lastWeekStyleMatchAverage) / lastWeekStyleMatchAverage) * 100
    : 100;

  const generationChange = weeklyStats.lastWeekCount > 0
    ? ((weeklyStats.thisWeekCount - weeklyStats.lastWeekCount) / weeklyStats.lastWeekCount) * 100
    : weeklyStats.thisWeekCount > 0 ? 100 : 0;

  return {
    thisWeekGenerations: weeklyStats.thisWeekCount,
    lastWeekGenerations: weeklyStats.lastWeekCount,
    generationChange,
    mostUsedMode,
    memoryGrowth,
    styleMatchAverage: Math.round(styleMatchAverage),
    styleMatchChange,
  };
}
