/**
 * Server-side referral store.
 *
 * The previous implementation wrote JSON files into `data/referrals` with
 * `fs.writeFileSync`. On Vercel that cannot work: serverless instances have an
 * ephemeral, non-shared filesystem, so a referral created by instance A is
 * invisible to instance B. Conversions silently never register -- the same
 * class of bug as the broken subscription store.
 *
 * This rewrite routes every read/write through `lib/kv.ts`, which abstracts
 * Redis (production) / filesystem (dev) / in-memory (fallback). A secondary
 * `referral-code:<CODE>` index makes `findReferrerByCode` an O(1) lookup
 * instead of a directory scan.
 */

import { kvGetJson, kvSetJson, kvListByPrefix } from "./kv";

const KEY_PREFIX = "referral:";
const CODE_INDEX_PREFIX = "referral-code:";
const REWARD_PREFIX = "referral-reward:";

export interface ReferralRecord {
  userId: string;
  code: string;
  createdAt: string;
  referralCount: number;
  successfulSubscriptions: number;
  referredBy?: string; // the referral code that brought this user
}

export interface ReferralRewards {
  referrerReward: { proDays: number; extraGenerations: number };
  refereeReward: { extraGenerations: number };
}

export const REFERRAL_REWARDS = {
  perReferral: {
    proDays: 3,
    extraGenerations: 5,
  },
  milestone: {
    threshold: 5, // 5 referrals = 1 month Pro
    proDays: 30,
  },
};

function recordKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

function codeKey(code: string): string {
  return `${CODE_INDEX_PREFIX}${code}`;
}

export async function getReferralRecord(
  userId: string
): Promise<ReferralRecord | null> {
  return kvGetJson<ReferralRecord>(recordKey(userId));
}

function generateCodeRaw(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${code}`;
}

export async function createReferralRecord(
  userId: string
): Promise<ReferralRecord> {
  const existing = await getReferralRecord(userId);
  if (existing) return existing;

  // Generate a code that is not already claimed (collision is astronomically
  // unlikely with 36^6 combos, but the index lets us guarantee uniqueness).
  let code = generateCodeRaw();
  for (let attempt = 0; attempt < 5; attempt++) {
    const owner = await kvGetJson<string>(codeKey(code));
    if (!owner) break;
    code = generateCodeRaw();
  }

  const record: ReferralRecord = {
    userId,
    code,
    createdAt: new Date().toISOString(),
    referralCount: 0,
    successfulSubscriptions: 0,
  };

  await kvSetJson(recordKey(userId), record);
  await kvSetJson(codeKey(code), userId);
  return record;
}

export async function incrementReferralCount(
  referrerId: string
): Promise<ReferralRecord | null> {
  const record = await getReferralRecord(referrerId);
  if (!record) return null;
  record.referralCount += 1;
  await kvSetJson(recordKey(referrerId), record);
  return record;
}

export async function incrementSuccessfulSubscriptions(
  userId: string
): Promise<ReferralRecord | null> {
  const record = await getReferralRecord(userId);
  if (!record) return null;
  record.successfulSubscriptions += 1;
  await kvSetJson(recordKey(userId), record);
  return record;
}

export function getReferralLink(code: string, baseUrl: string): string {
  return `${baseUrl}/?ref=${code}`;
}

export async function findReferrerByCode(
  code: string
): Promise<ReferralRecord | null> {
  const userId = await kvGetJson<string>(codeKey(code));
  if (!userId) return null;
  return getReferralRecord(userId);
}

export async function trackReferralConversion(
  newUserId: string,
  referralCode: string
): Promise<{ referrerId: string | null; rewards: ReferralRewards | null }> {
  const referrer = await findReferrerByCode(referralCode);
  if (!referrer) {
    return { referrerId: null, rewards: null };
  }

  // Update referrer stats
  await incrementReferralCount(referrer.userId);
  await incrementSuccessfulSubscriptions(referrer.userId);

  // Record who referred this new user
  const newUserRecord = await createReferralRecord(newUserId);
  newUserRecord.referredBy = referralCode;
  await kvSetJson(recordKey(newUserId), newUserRecord);

  const rewards: ReferralRewards = {
    referrerReward: {
      proDays: REFERRAL_REWARDS.perReferral.proDays,
      extraGenerations: REFERRAL_REWARDS.perReferral.extraGenerations,
    },
    refereeReward: {
      extraGenerations: REFERRAL_REWARDS.perReferral.extraGenerations,
    },
  };

  // Store pending rewards (KV-backed, survives redeploys)
  await kvSetJson(`${REWARD_PREFIX}${referrer.userId}:referrer`, {
    userId: referrer.userId,
    type: "referrer",
    proDays: rewards.referrerReward.proDays,
    extraGenerations: rewards.referrerReward.extraGenerations,
    rewardedAt: new Date().toISOString(),
    claimed: false,
  });
  await kvSetJson(`${REWARD_PREFIX}${newUserId}:referee`, {
    userId: newUserId,
    type: "referee",
    extraGenerations: rewards.refereeReward.extraGenerations,
    rewardedAt: new Date().toISOString(),
    claimed: false,
  });

  return { referrerId: referrer.userId, rewards };
}

export async function getAllReferralRecords(): Promise<ReferralRecord[]> {
  const keys = await kvListByPrefix(KEY_PREFIX);
  const records = await Promise.all(
    keys.map((k) => kvGetJson<ReferralRecord>(k))
  );
  return records.filter((r): r is ReferralRecord => r !== null);
}
