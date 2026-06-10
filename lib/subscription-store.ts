import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "subscriptions");

export interface SubscriptionRecord {
  userId: string;
  tier: "free" | "pro" | "max" | "team";
  status: "active" | "cancelled" | "expired";
  planId: string;
  provider: "creem" | "paddle";
  providerSubscriptionId: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
}

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(userId: string): string {
  return join(DATA_DIR, `${userId}.json`);
}

export function getSubscription(userId: string): SubscriptionRecord | null {
  ensureDir();
  const fp = filePath(userId);
  if (!existsSync(fp)) return null;
  try {
    return JSON.parse(readFileSync(fp, "utf-8"));
  } catch {
    return null;
  }
}

export function upsertSubscription(record: SubscriptionRecord): SubscriptionRecord {
  ensureDir();
  const now = new Date().toISOString();

  const existing = getSubscription(record.userId);
  const merged: SubscriptionRecord = {
    ...existing,
    ...record,
    updatedAt: now,
    createdAt: existing?.createdAt || now,
  };

  writeFileSync(filePath(record.userId), JSON.stringify(merged, null, 2));
  console.log(
    `[Subscription] ${merged.userId}: ${merged.tier} (${merged.status}) via ${merged.provider}`
  );
  return merged;
}

export function cancelSubscription(userId: string): SubscriptionRecord | null {
  const existing = getSubscription(userId);
  if (!existing) return null;
  return upsertSubscription({
    ...existing,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
  });
}

export function getAllSubscriptions(): SubscriptionRecord[] {
  ensureDir();
  try {
    const { readdirSync: rd } = require("fs");
    return rd(DATA_DIR)
      .filter((f: string) => f.endsWith(".json"))
      .map((f: string) => {
        try {
          return JSON.parse(readFileSync(join(DATA_DIR, f), "utf-8"));
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}