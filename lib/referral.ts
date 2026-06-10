import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "referrals");

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

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(userId: string): string {
  return join(DATA_DIR, `${userId}.json`);
}

export function getReferralRecord(userId: string): ReferralRecord | null {
  ensureDir();
  const fp = filePath(userId);
  if (!existsSync(fp)) return null;
  try {
    return JSON.parse(readFileSync(fp, "utf-8"));
  } catch {
    return null;
  }
}

export function createReferralRecord(userId: string): ReferralRecord {
  ensureDir();
  const existing = getReferralRecord(userId);
  if (existing) return existing;

  const code = generateReferralCode(userId);
  const record: ReferralRecord = {
    userId,
    code,
    createdAt: new Date().toISOString(),
    referralCount: 0,
    successfulSubscriptions: 0,
  };

  writeFileSync(filePath(userId), JSON.stringify(record, null, 2));
  return record;
}

export function incrementReferralCount(referrerId: string): ReferralRecord | null {
  const record = getReferralRecord(referrerId);
  if (!record) return null;
  record.referralCount += 1;
  writeFileSync(filePath(referrerId), JSON.stringify(record, null, 2));
  return record;
}

export function incrementSuccessfulSubscriptions(userId: string): ReferralRecord | null {
  const record = getReferralRecord(userId);
  if (!record) return null;
  record.successfulSubscriptions += 1;
  writeFileSync(filePath(userId), JSON.stringify(record, null, 2));
  return record;
}

export function getReferralLink(code: string, baseUrl: string): string {
  return `${baseUrl}/?ref=${code}`;
}

function generateReferralCode(userId: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${code}`;
}

export function findReferrerByCode(code: string): ReferralRecord | null {
  ensureDir();
  try {
    const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const record: ReferralRecord = JSON.parse(
        readFileSync(join(DATA_DIR, file), "utf-8")
      );
      if (record.code === code) return record;
    }
  } catch {
    // directory might not exist
  }
  return null;
}

export function trackReferralConversion(
  newUserId: string,
  referralCode: string
): { referrerId: string | null; rewards: ReferralRewards | null } {
  const referrer = findReferrerByCode(referralCode);
  if (!referrer) {
    return { referrerId: null, rewards: null };
  }

  // Update referrer stats
  incrementReferralCount(referrer.userId);
  incrementSuccessfulSubscriptions(referrer.userId);

  // Record who referred this new user
  const newUserRecord = createReferralRecord(newUserId);
  newUserRecord.referredBy = referralCode;
  writeFileSync(filePath(newUserId), JSON.stringify(newUserRecord, null, 2));

  const rewards: ReferralRewards = {
    referrerReward: {
      proDays: REFERRAL_REWARDS.perReferral.proDays,
      extraGenerations: REFERRAL_REWARDS.perReferral.extraGenerations,
    },
    refereeReward: {
      extraGenerations: REFERRAL_REWARDS.perReferral.extraGenerations,
    },
  };

  // Store pending rewards
  const rewardsDir = join(process.cwd(), "data", "referral-rewards");
  if (!existsSync(rewardsDir)) mkdirSync(rewardsDir, { recursive: true });
  writeFileSync(
    join(rewardsDir, `${referrer.userId}.json`),
    JSON.stringify({
      userId: referrer.userId,
      type: "referrer",
      proDays: rewards.referrerReward.proDays,
      extraGenerations: rewards.referrerReward.extraGenerations,
      rewardedAt: new Date().toISOString(),
      claimed: false,
    }, null, 2)
  );
  writeFileSync(
    join(rewardsDir, `${newUserId}.json`),
    JSON.stringify({
      userId: newUserId,
      type: "referee",
      extraGenerations: rewards.refereeReward.extraGenerations,
      rewardedAt: new Date().toISOString(),
      claimed: false,
    }, null, 2)
  );

  return { referrerId: referrer.userId, rewards };
}

export function getAllReferralRecords(): ReferralRecord[] {
  ensureDir();
  try {
    return readdirSync(DATA_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        try {
          return JSON.parse(readFileSync(join(DATA_DIR, f), "utf-8"));
        } catch {
          return null;
        }
      })
      .filter(Boolean) as ReferralRecord[];
  } catch {
    return [];
  }
}