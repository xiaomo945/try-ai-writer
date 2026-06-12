"use client";

import { useState, useCallback, useEffect } from "react";
import { createStorage } from "./storage";

const storage = createStorage("history");

type HistoryRecord = {
  id: string;
  title: string;
  mode: string;
  result: string;
  createdAt: string;
};

const MAX_RECORDS = 20;

function readHistory(): HistoryRecord[] {
  return storage.get<HistoryRecord[]>("records") ?? [];
}

function writeHistory(records: HistoryRecord[]): void {
  storage.set("records", records.slice(0, MAX_RECORDS));
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
