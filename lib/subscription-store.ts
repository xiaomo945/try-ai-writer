import { kvGetJson, kvSetJson, kvListByPrefix } from "./kv";

const KEY_PREFIX = "subscription:";

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

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function getSubscription(
  userId: string
): Promise<SubscriptionRecord | null> {
  return kvGetJson<SubscriptionRecord>(keyFor(userId));
}

export async function upsertSubscription(
  record: SubscriptionRecord
): Promise<SubscriptionRecord> {
  const now = new Date().toISOString();
  const existing = await getSubscription(record.userId);
  const merged: SubscriptionRecord = {
    ...existing,
    ...record,
    updatedAt: now,
    createdAt: existing?.createdAt || now,
  };

  await kvSetJson(keyFor(record.userId), merged);
  console.log(
    `[Subscription] ${merged.userId}: ${merged.tier} (${merged.status}) via ${merged.provider}`
  );
  return merged;
}

export async function cancelSubscription(
  userId: string
): Promise<SubscriptionRecord | null> {
  const existing = await getSubscription(userId);
  if (!existing) return null;
  return upsertSubscription({
    ...existing,
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
  });
}

export async function getAllSubscriptions(): Promise<SubscriptionRecord[]> {
  const keys = await kvListByPrefix(KEY_PREFIX);
  const records = await Promise.all(
    keys.map((k) => kvGetJson<SubscriptionRecord>(k))
  );
  return records.filter((r): r is SubscriptionRecord => r !== null);
}
