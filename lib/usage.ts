"use client";

import { useState, useCallback, useEffect } from "react";

type UsageData = {
  date: string;
  count: number;
  adBonus: number;
  adWatched: number;
};

const DAILY_LIMIT = 10;
const AD_BONUS_PER_WATCH = 5;
const MAX_AD_WATCHES = 3;
const STORAGE_KEY = "use-ai-writer-usage";

function getToday(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

function readUsage(): UsageData {
  if (typeof window === "undefined") {
    return { date: getToday(), count: 0, adBonus: 0, adWatched: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: getToday(), count: 0, adBonus: 0, adWatched: 0 };
    const parsed: UsageData = JSON.parse(raw) as UsageData;
    if (parsed.date !== getToday()) {
      return { date: getToday(), count: 0, adBonus: 0, adWatched: 0 };
    }
    return parsed;
  } catch {
    return { date: getToday(), count: 0, adBonus: 0, adWatched: 0 };
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
    const totalLimit = DAILY_LIMIT + current.adBonus;
    if (current.count >= totalLimit) return false;
    const updated: UsageData = { ...current, count: current.count + 1 };
    writeUsage(updated);
    setUsage(updated);
    return true;
  }, []);

  const watchAd = useCallback((): boolean => {
    const current = readUsage();
    if (current.adWatched >= MAX_AD_WATCHES) return false;
    const updated: UsageData = {
      ...current,
      adWatched: current.adWatched + 1,
      adBonus: current.adBonus + AD_BONUS_PER_WATCH,
    };
    writeUsage(updated);
    setUsage(updated);
    return true;
  }, []);

  const totalLimit = DAILY_LIMIT + usage.adBonus;
  const canGenerate = usage.count < totalLimit;
  const canWatchAd = usage.adWatched < MAX_AD_WATCHES;

  return {
    used: usage.count,
    limit: totalLimit,
    baseLimit: DAILY_LIMIT,
    adBonus: usage.adBonus,
    adWatched: usage.adWatched,
    maxAdWatches: MAX_AD_WATCHES,
    canGenerate,
    canWatchAd,
    increment,
    watchAd,
  };
}
