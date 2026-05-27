import { NextRequest } from "next/server";

interface PaymentProvider {
  createCheckoutSession(plan: string): Promise<{ url: string }>;
}

const CREEM_URLS = {
  production: "https://api.creem.io/v1/checkouts",
  test: "https://api.creem.io/v1/checkouts",
} as const;

type CreemEnv = keyof typeof CREEM_URLS;

class CreemProvider implements PaymentProvider {
  private apiKey: string;
  private productIds: Record<string, string>;
  private apiUrl: string;

  constructor(apiKey: string, productIds: Record<string, string>, env: CreemEnv = "test") {
    this.apiKey = apiKey;
    this.productIds = productIds;
    this.apiUrl = CREEM_URLS[env];
  }

  async createCheckoutSession(plan: string): Promise<{ url: string }> {
    const productId = this.productIds[plan];
    if (!productId) throw new Error(`Unknown plan: ${plan}`);

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Creem API error (${response.status}): ${errorText || "Unknown error"}`);
    }

    const data = await response.json();
    return { url: data.checkout_url };
  }
}

export function getPaymentProvider(): PaymentProvider | null {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) return null;

  const env = (process.env.CREEM_ENV || "test") as CreemEnv;
  const validEnvs: CreemEnv[] = ["test", "production"];
  const creemEnv = validEnvs.includes(env) ? env : "test";

  return new CreemProvider(
    apiKey,
    {
      pro: process.env.CREEM_PRODUCT_PRO || "",
      max: process.env.CREEM_PRODUCT_MAX || "",
      team: process.env.CREEM_PRODUCT_TEAM || "",
    },
    creemEnv
  );
}