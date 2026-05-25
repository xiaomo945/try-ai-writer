import { useState, useCallback, useEffect } from "react";
import { plans } from "./pricing";

type UsageData = {
  date: string;
  claudeCount: number;
  deepseekCount: number;
};

const STORAGE_KEY = "use-ai-writer-usage";
const FREE_PLAN = plans[0]; // Free plan is always first

function getToday(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

/** Parse the daily limit from the Free plan's claudeLimit string (e.g. "10/day" → 10) */
function parseDailyLimit(limitStr: string): number {
  const match = limitStr.match(/(\d+)/);
  return match ? parseInt(match[1] ?? "10", 10) : 10;
}

const CLAUDE_DAILY_LIMIT = FREE_PLAN ? parseDailyLimit(FREE_PLAN.claudeLimit) : 10;
const DEEPSEEK_DAILY_LIMIT = FREE_PLAN ? parseDailyLimit(FREE_PLAN.deepseekLimit) : 10;

function readUsage(): UsageData {
  if (typeof window === "undefined") {
    return { date: getToday(), claudeCount: 0, deepseekCount: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), claudeCount: 0, deepseekCount: 0 };
    const parsed: UsageData = JSON.parse(raw) as UsageData;
    if (parsed.date !== getToday()) {
      return { date: getToday(), claudeCount: 0, deepseekCount: 0 };
    }
    return parsed;
  } catch {
    return { date: getToday(), claudeCount: 0, deepseekCount: 0 };
  }
}

function writeUsage(data: UsageData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // storage full or unavailable
  }
}

export type ModelType = "claude" | "deepseek";

export function useUsage() {
  const [usage, setUsage] = useState<UsageData>(readUsage);

  useEffect(() => {
    const data = readUsage();
    setUsage(data);
  }, []);

  const increment = useCallback((model: ModelType = "claude"): boolean => {
    const current = readUsage();

    if (model === "claude" && current.claudeCount >= CLAUDE_DAILY_LIMIT) return false;
    if (model === "deepseek" && current.deepseekCount >= DEEPSEEK_DAILY_LIMIT) return false;

    const updated: UsageData = {
      date: current.date,
      claudeCount: model === "claude" ? current.claudeCount + 1 : current.claudeCount,
      deepseekCount: model === "deepseek" ? current.deepseekCount + 1 : current.deepseekCount,
    };

    writeUsage(updated);
    setUsage(updated);
    return true;
  }, []);

  const used = usage.claudeCount + usage.deepseekCount;
  const limit = CLAUDE_DAILY_LIMIT + DEEPSEEK_DAILY_LIMIT;
  const canGenerate = used < limit;

  return {
    used,
    limit,
    claudeUsed: usage.claudeCount,
    claudeLimit: CLAUDE_DAILY_LIMIT,
    deepseekUsed: usage.deepseekCount,
    deepseekLimit: DEEPSEEK_DAILY_LIMIT,
    canGenerate,
    increment,
    planName: FREE_PLAN?.name ?? "Free",
  };
}
