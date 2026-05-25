export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  recommended: boolean;
  claudeLimit: string;
  deepseekLimit: string;
}

export const plans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For casual writers",
    features: [
      "10 Claude generations / day",
      "10 DeepSeek generations / day",
      "Basic templates",
      "Standard support",
    ],
    cta: "Start Free",
    recommended: false,
    claudeLimit: "10/day",
    deepseekLimit: "10/day",
  },
  {
    name: "Pro",
    price: "$9",
    period: "per month",
    description: "For serious creators",
    features: [
      "50 Claude generations / month",
      "100 DeepSeek generations / day",
      "All templates",
      "API access",
      "Priority support",
      "Custom tone learning",
    ],
    cta: "Start Pro",
    recommended: true,
    claudeLimit: "50/month",
    deepseekLimit: "100/day",
  },
  {
    name: "Max",
    price: "$25",
    period: "per month",
    description: "For power users",
    features: [
      "300 Claude generations / month",
      "Unlimited DeepSeek generations",
      "All templates",
      "API access",
      "Brand kit",
      "Analytics dashboard",
      "Dedicated support",
    ],
    cta: "Start Max",
    recommended: false,
    claudeLimit: "300/month",
    deepseekLimit: "Unlimited",
  },
];

export function getPlanByName(name: string): PricingPlan | undefined {
  return plans.find((p) => p.name.toLowerCase() === name.toLowerCase());
}

export function getRecommendedPlan(): PricingPlan {
  const recommended = plans.find((p) => p.recommended);
  return recommended ?? plans[0] ?? { name: "Free", price: "$0", period: "forever", description: "", features: [], cta: "", recommended: false, claudeLimit: "10/day", deepseekLimit: "10/day" };
}
