export type Currency = "usd" | "cny";

export interface PriceConfig {
  planId: string;
  stripePriceId: string;
  amount: number;
  label: string;
}

const USD_PRICES: Record<string, PriceConfig> = {
  pro: {
    planId: "pro",
    stripePriceId: process.env.STRIPE_PRICE_PRO_USD || "price_pro_usd_placeholder",
    amount: 9,
    label: "Pro",
  },
  max: {
    planId: "max",
    stripePriceId: process.env.STRIPE_PRICE_MAX_USD || "price_max_usd_placeholder",
    amount: 25,
    label: "Max",
  },
  team: {
    planId: "team",
    stripePriceId: process.env.STRIPE_PRICE_TEAM_USD || "price_team_usd_placeholder",
    amount: 59,
    label: "Team",
  },
};

const CNY_PRICES: Record<string, PriceConfig> = {
  basic: {
    planId: "basic",
    stripePriceId: process.env.STRIPE_PRICE_BASIC_CNY || "price_basic_cny_placeholder",
    amount: 29,
    label: "基础版",
  },
  pro: {
    planId: "pro",
    stripePriceId: process.env.STRIPE_PRICE_PRO_CNY || "price_pro_cny_placeholder",
    amount: 79,
    label: "Pro 版",
  },
  max: {
    planId: "max",
    stripePriceId: process.env.STRIPE_PRICE_MAX_CNY || "price_max_cny_placeholder",
    amount: 199,
    label: "Max 版",
  },
  team: {
    planId: "team",
    stripePriceId: process.env.STRIPE_PRICE_TEAM_CNY || "price_team_cny_placeholder",
    amount: 499,
    label: "Team 版",
  },
};

export function getPriceConfig(plan: string, currency: Currency): PriceConfig | null {
  const prices = currency === "usd" ? USD_PRICES : CNY_PRICES;
  return prices[plan] || null;
}