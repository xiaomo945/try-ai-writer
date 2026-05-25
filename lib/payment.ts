import { NextRequest } from "next/server";

interface PaymentProvider {
  createCheckoutSession(plan: string): Promise<{ url: string }>;
}

class CreemProvider implements PaymentProvider {
  private apiKey: string;
  private productIds: Record<string, string>;

  constructor(apiKey: string, productIds: Record<string, string>) {
    this.apiKey = apiKey;
    this.productIds = productIds;
  }

  async createCheckoutSession(plan: string): Promise<{ url: string }> {
    const productId = this.productIds[plan];
    if (!productId) throw new Error(`Unknown plan: ${plan}`);

    const response = await fetch("https://api.creem.io/v1/checkouts", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId }),
    });

    if (!response.ok) {
      throw new Error(`Creem API error: ${response.status}`);
    }

    const data = await response.json();
    return { url: data.checkout_url };
  }
}

export function getPaymentProvider(): PaymentProvider | null {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) return null;

  return new CreemProvider(apiKey, {
    pro: process.env.CREEM_PRODUCT_PRO || "",
    max: process.env.CREEM_PRODUCT_MAX || "",
    team: process.env.CREEM_PRODUCT_TEAM || "",
  });
}
