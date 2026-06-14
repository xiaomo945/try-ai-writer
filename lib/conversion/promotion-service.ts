import { Promotion, CreatePromotion } from "./promotion-types";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const promotions = new Map<string, Promotion>();

// Initialize some default promotions
function initializePromotions() {
  if (promotions.size > 0) return;

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const promo1: Promotion = {
    id: randomUUID(),
    code: "WELCOME50",
    discount: 50,
    title: "新用户专享5折优惠",
    description: "首次升级专业版立享50%折扣",
    validFrom: now,
    validUntil: weekFromNow,
    maxUses: 100,
    usedCount: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const promo2: Promotion = {
    id: randomUUID(),
    code: "SPRING30",
    discount: 30,
    title: "春季特惠7折",
    description: "限时7天，专业版7折优惠",
    validFrom: now,
    validUntil: weekFromNow,
    maxUses: null,
    usedCount: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  promotions.set(promo1.id, promo1);
  promotions.set(promo2.id, promo2);
}

initializePromotions();

export async function getActivePromotions(): Promise<Promotion[]> {
  const now = new Date();
  return Array.from(promotions.values()).filter(
    (p) =>
      p.isActive &&
      now >= p.validFrom &&
      now <= p.validUntil &&
      (p.maxUses === null || p.usedCount < p.maxUses)
  );
}

export async function getPromotionByCode(
  code: string
): Promise<Promotion | null> {
  const now = new Date();
  const promo = Array.from(promotions.values()).find(
    (p) => p.code.toUpperCase() === code.toUpperCase()
  );

  if (!promo) return null;
  if (!promo.isActive) return null;
  if (now < promo.validFrom || now > promo.validUntil) return null;
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return null;

  return promo;
}

export async function usePromotion(code: string): Promise<boolean> {
  const promo = await getPromotionByCode(code);
  if (!promo) return false;

  promo.usedCount += 1;
  promo.updatedAt = new Date();
  promotions.set(promo.id, promo);

  return true;
}

export async function getBestPromotion(): Promise<Promotion | null> {
  const active = await getActivePromotions();
  if (active.length === 0) return null;

  // Return the one with highest discount
  return active.reduce((best, current) =>
    current.discount > best.discount ? current : best
  );
}

export async function calculateDiscountedPrice(
  originalPrice: number,
  code: string
): Promise<{ original: number; discounted: number; savings: number } | null> {
  const promo = await getPromotionByCode(code);
  if (!promo) return null;

  const savings = (originalPrice * promo.discount) / 100;
  const discounted = originalPrice - savings;

  return {
    original: originalPrice,
    discounted,
    savings,
  };
}
