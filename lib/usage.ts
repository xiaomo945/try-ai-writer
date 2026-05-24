"use client";

import { useState, useCallback, useEffect } from "react";

type UsageData = {
  date: string;
  count: number;
};

const DAILY_LIMIT = 10;
const STORAGE_KEY = "use-ai-writer-usage";

function getToday(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

function readUsage(): UsageData {
  if (typeof window === "undefined") {
    return { date: getToday(), count: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), count: 0 };
    const parsed: UsageData = JSON.parse(raw) as UsageData;
    if (parsed.date !== getToday()) {
      return { date: getToday(), count: 0 };
    }
    return parsed;
  } catch {
    return { date: getToday(), count: 0 };
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

export function useUsage() {
  const [usage, setUsage] = useState<UsageData>(readUsage);

  useEffect(() => {
    const data = readUsage();
    setUsage(data);
  }, []);

  const increment = useCallback((): boolean => {
    const current = readUsage();
    if (current.count >= DAILY_LIMIT) return false;
    const updated: UsageData = { date: current.date, count: current.count + 1 };
    writeUsage(updated);
    setUsage(updated);
    return true;
  }, []);

  const canGenerate = usage.count < DAILY_LIMIT;

  return {
    used: usage.count,
    limit: DAILY_LIMIT,
    canGenerate,
    increment,
  };
}
