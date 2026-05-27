// Referral system for Use AI Writer
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

// Get the referral link for sharing
export function getReferralLink(code: string): string {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/?ref=${code}`;
}
