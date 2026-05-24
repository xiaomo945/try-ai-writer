"use client";

import { useState, useCallback, useEffect } from "react";

type HistoryRecord = {
  id: string;
  title: string;
  mode: string;
  result: string;
  createdAt: string;
};

const MAX_RECORDS = 20;
const STORAGE_KEY = "use-ai-writer-history";

function readHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: HistoryRecord[] = JSON.parse(raw) as HistoryRecord[];
    return parsed.slice(0, MAX_RECORDS);
  } catch {
    return [];
  }
}

function writeHistory(records: HistoryRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
  } catch {
    // storage full or unavailable
  }
}

export function useHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>(readHistory);

  useEffect(() => {
    setRecords(readHistory());
  }, []);

  const addRecord = useCallback((record: Omit<HistoryRecord, "id" | "createdAt">): HistoryRecord => {
    const newRecord: HistoryRecord = {
      ...record,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...readHistory()].slice(0, MAX_RECORDS);
    writeHistory(updated);
    setRecords(updated);
    return newRecord;
  }, []);

  const deleteRecord = useCallback((id: string): void => {
    const updated = readHistory().filter((r) => r.id !== id);
    writeHistory(updated);
    setRecords(updated);
  }, []);

  const clearAll = useCallback((): void => {
    writeHistory([]);
    setRecords([]);
  }, []);

  return { records, addRecord, deleteRecord, clearAll };
}
