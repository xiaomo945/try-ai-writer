"use client";

import { createStorage } from "./storage";

// Client-side referral utilities — localStorage based, compatible with old API.
// For server-side persistence, use the API routes: /api/referral/generate and /api/referral/stats.

const storage = createStorage("referral");

export const REFERRAL_REWARDS = {
  perReferral: {
    proDays: 3,
    extraGenerations: 5,
  },
  milestone: {
    threshold: 5,
    proDays: 30,
  },
};

interface ReferralData {
  referralCode: string;
  referrals: Array<{
    id: string;
    referredAt: string;
  }>;
  rewards: {
    proDays: number;
    extraGenerations: number;
  };
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function readReferralData(): ReferralData | null {
  return storage.get<ReferralData>("data");
}

function writeReferralData(data: ReferralData): void {
  storage.set("data", data);
}

export function initializeReferral(): ReferralData {
  const existing = readReferralData();
  if (existing) return existing;

  const newData: ReferralData = {
    referralCode: generateReferralCode(),
    referrals: [],
    rewards: { proDays: 0, extraGenerations: 0 },
  };

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      storage.set("referred-by", refCode);
    }
  }

  writeReferralData(newData);
  return newData;
}

export function getReferralLink(code: string): string {
  if (typeof window === "undefined") return `https://tryaiwriter.com/?ref=${code}`;
  return `${window.location.origin}/?ref=${code}`;
}

export function addReferral(code: string): boolean {
  return true;
}

export function applyReferralReward(
  referrerId: string,
  newUserId: string
): {
  referrerReward: { proDays: number; extraGenerations: number };
  refereeReward: { extraGenerations: number };
} {
  if (typeof window === "undefined") {
    return {
      referrerReward: { proDays: 0, extraGenerations: 0 },
      refereeReward: { extraGenerations: 0 },
    };
  }

  const rewards = REFERRAL_REWARDS.perReferral;

  const referrerData = {
    userId: referrerId,
    plan: "pro_trial",
    proExpiryDate: new Date(
      Date.now() + rewards.proDays * 24 * 60 * 60 * 1000
    ).toISOString(),
    rewardedAt: new Date().toISOString(),
  };
  storage.set("referrer-reward", referrerData);

  const refereeData = {
    userId: newUserId,
    extraGenerations: rewards.extraGenerations,
    rewardedAt: new Date().toISOString(),
  };
  storage.set("referee-reward", refereeData);

  const referralHistory = storage.get<Array<Record<string, unknown>>>("history") ?? [];
  referralHistory.push({
    referrerId,
    newUserId,
    timestamp: new Date().toISOString(),
    rewards,
  });
  storage.set("history", referralHistory);

  return {
    referrerReward: { proDays: rewards.proDays, extraGenerations: 0 },
    refereeReward: { extraGenerations: rewards.extraGenerations },
  };
}

export function checkPendingReferralRewards(): {
  hasReferrerReward: boolean;
  hasRefereeReward: boolean;
  referrerRewardData: { proDays: number } | null;
  refereeRewardData: { extraGenerations: number } | null;
} {
  if (typeof window === "undefined") {
    return {
      hasReferrerReward: false,
      hasRefereeReward: false,
      referrerRewardData: null,
      refereeRewardData: null,
    };
  }

  const referrerRewardStr = storage.get<{ proDays: number }>("referrer-reward");
  const refereeRewardStr = storage.get<{ extraGenerations: number }>("referee-reward");

  const hasReferrerReward = !!referrerRewardStr;
  const hasRefereeReward = !!refereeRewardStr;

  let referrerRewardData = null;
  let refereeRewardData = null;

  if (referrerRewardStr) {
    referrerRewardData = { proDays: referrerRewardStr.proDays || 3 };
  }

  if (refereeRewardStr) {
    refereeRewardData = { extraGenerations: refereeRewardStr.extraGenerations || 5 };
  }

  return {
    hasReferrerReward,
    hasRefereeReward,
    referrerRewardData,
    refereeRewardData,
  };
}

export function clearPendingReferralRewards(): void {
  storage.remove("referrer-reward");
  storage.remove("referee-reward");
}