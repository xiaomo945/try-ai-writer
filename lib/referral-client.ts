"use client";

// Client-side referral utilities — localStorage based, compatible with old API.
// For server-side persistence, use the API routes: /api/referral/generate and /api/referral/stats.

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
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("use-ai-writer-referral");
  if (stored) {
    try {
      return JSON.parse(stored) as ReferralData;
    } catch {
      return null;
    }
  }
  return null;
}

function writeReferralData(data: ReferralData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("use-ai-writer-referral", JSON.stringify(data));
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
      localStorage.setItem("referred-by", refCode);
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
  localStorage.setItem("referrer_reward_pending", JSON.stringify(referrerData));

  const refereeData = {
    userId: newUserId,
    extraGenerations: rewards.extraGenerations,
    rewardedAt: new Date().toISOString(),
  };
  localStorage.setItem("referee_reward_pending", JSON.stringify(refereeData));

  const referralHistory = JSON.parse(
    localStorage.getItem("referral_history") || "[]"
  );
  referralHistory.push({
    referrerId,
    newUserId,
    timestamp: new Date().toISOString(),
    rewards,
  });
  localStorage.setItem("referral_history", JSON.stringify(referralHistory));

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

  const referrerRewardStr = localStorage.getItem("referrer_reward_pending");
  const refereeRewardStr = localStorage.getItem("referee_reward_pending");

  const hasReferrerReward = !!referrerRewardStr;
  const hasRefereeReward = !!refereeRewardStr;

  let referrerRewardData = null;
  let refereeRewardData = null;

  if (referrerRewardStr) {
    try {
      const data = JSON.parse(referrerRewardStr);
      referrerRewardData = { proDays: data.proDays || 3 };
    } catch {
      referrerRewardData = null;
    }
  }

  if (refereeRewardStr) {
    try {
      const data = JSON.parse(refereeRewardStr);
      refereeRewardData = { extraGenerations: data.extraGenerations || 5 };
    } catch {
      refereeRewardData = null;
    }
  }

  return {
    hasReferrerReward,
    hasRefereeReward,
    referrerRewardData,
    refereeRewardData,
  };
}

export function clearPendingReferralRewards(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("referrer_reward_pending");
  localStorage.removeItem("referee_reward_pending");
}