// Referral system for Try AI Writer
// Using localStorage for storage (client-side only)

export interface ReferralData {
  referralCode: string;
  referrals: Array<{
    id: string;
    referredAt: string;
  }>;
  rewards: {
    proDays: number; // Days of Pro access earned
    extraGenerations: number; // Extra daily generations earned
  };
}

export const REFERRAL_REWARDS = {
  perReferral: {
    proDays: 3, // 3 days Pro per referral
    extraGenerations: 5, // 5 extra daily generations for referee
  },
  milestone: {
    threshold: 5, // 5 referrals = 1 month Pro
    proDays: 30,
  },
};

// Generate a random 6-character alphanumeric referral code
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Get or initialize referral data from localStorage
export function getReferralData(): ReferralData | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("use-ai-writer-referral");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse referral data", e);
    }
  }
  return null;
}

// Initialize referral data for new users
export function initializeReferral(): ReferralData {
  const existing = getReferralData();
  if (existing) return existing;

  const newData: ReferralData = {
    referralCode: generateReferralCode(),
    referrals: [],
    rewards: {
      proDays: 0,
      extraGenerations: 0,
    },
  };

  // Check URL for referral code (was the user referred?)
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      // Simulate: in a real app, you'd send this to your backend
      // For now, we just store that they were referred
      localStorage.setItem("referred-by", refCode);
    }
  }

  localStorage.setItem("use-ai-writer-referral", JSON.stringify(newData));
  return newData;
}

// Add a new referral (called when someone signs up using a code)
export function addReferral(code: string): boolean {
  // In a real app, this would be a server-side call
  // For now, just a client-side simulation
  return true;
}

// Apply referral rewards for both referrer and referee
export function applyReferralReward(referrerId: string, newUserId: string): {
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

  // Apply reward to referrer - 3 days Pro trial
  const referrerData = {
    userId: referrerId,
    plan: "pro_trial",
    proExpiryDate: new Date(Date.now() + rewards.proDays * 24 * 60 * 60 * 1000).toISOString(),
    rewardedAt: new Date().toISOString(),
  };
  localStorage.setItem("referrer_reward_pending", JSON.stringify(referrerData));

  // Apply reward to referee - 5 extra generations
  const refereeData = {
    userId: newUserId,
    extraGenerations: rewards.extraGenerations,
    rewardedAt: new Date().toISOString(),
  };
  localStorage.setItem("referee_reward_pending", JSON.stringify(refereeData));

  // Also store that this referral was successfully processed
  const referralHistory = JSON.parse(localStorage.getItem("referral_history") || "[]");
  referralHistory.push({
    referrerId,
    newUserId,
    timestamp: new Date().toISOString(),
    rewards,
  });
  localStorage.setItem("referral_history", JSON.stringify(referralHistory));

  return {
    referrerReward: {
      proDays: rewards.proDays,
      extraGenerations: 0,
    },
    refereeReward: {
      extraGenerations: rewards.extraGenerations,
    },
  };
}

// Check if user has pending referral rewards
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

// Clear pending referral rewards (after they're applied/displayed)
export function clearPendingReferralRewards(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("referrer_reward_pending");
  localStorage.removeItem("referee_reward_pending");
}

// Get the referral link for sharing
export function getReferralLink(code: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/?ref=${code}`;
}
