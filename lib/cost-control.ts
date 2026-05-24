type Model = "deepseek" | "claude" | "mock";

type CostRecord = {
  date: string;
  userId: string;
  model: Model;
  cost: number;
  estimatedTokens: number;
};

const DEEPSEEK_COST_PER_CALL = 0.01;
const CLAUDE_COST_PER_CALL = 0.33;

const costStorage = new Map<string, CostRecord[]>();

function getToday(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

export function trackCost(
  userId: string,
  model: Model,
  estimatedTokens: number
): void {
  const today = getToday();
  const key = `${userId}-${today}`;
  let records = costStorage.get(key) || [];
  
  let cost = 0;
  if (model === "deepseek") {
    cost = DEEPSEEK_COST_PER_CALL;
  } else if (model === "claude") {
    cost = CLAUDE_COST_PER_CALL;
  }
  
  records.push({
    date: today,
    userId,
    model,
    cost,
    estimatedTokens,
  });
  
  costStorage.set(key, records);
}

export function checkCostLimit(
  userId: string,
  dailyLimit: number = 100
): boolean {
  const today = getToday();
  const key = `${userId}-${today}`;
  const records = costStorage.get(key) || [];
  
  const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
  
  return totalCost < dailyLimit;
}

export function getTodayCost(userId: string): number {
  const today = getToday();
  const key = `${userId}-${today}`;
  const records = costStorage.get(key) || [];
  return records.reduce((sum, record) => sum + record.cost, 0);
}
