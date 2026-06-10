import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "user-sync");

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function historyPath(userId: string): string {
  ensureDir();
  return join(DATA_DIR, `${userId}-history.json`);
}

interface HistoryEntry {
  id: string;
  title: string;
  content: string;
  mode: string;
  createdAt: string;
  wordCount: number;
}

export function getUserHistory(userId: string): HistoryEntry[] {
  const fp = historyPath(userId);
  if (!existsSync(fp)) return [];
  try {
    return JSON.parse(readFileSync(fp, "utf-8"));
  } catch {
    return [];
  }
}

export function saveUserHistory(userId: string, entries: HistoryEntry[]): void {
  // Keep last 200 entries to limit file size
  const trimmed = entries.slice(0, 200);
  writeFileSync(historyPath(userId), JSON.stringify(trimmed, null, 2));
}