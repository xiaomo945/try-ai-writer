import { NextRequest } from "next/server";

interface PaymentProvider {
  createCheckoutSession(request: NextRequest, plan: string): Promise<{ url: string }>;
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

  async createCheckoutSession(request: NextRequest, plan: string): Promise<{ url: string }> {
    console.log(`[Creem] Creating checkout for plan: ${plan}`);
    
    const productId = this.productIds[plan];
    if (!productId) {
      console.error(`[Creem] Unknown plan: ${plan}`);
      throw new Error(`Unknown plan: ${plan}`);
    }

    console.log(`[Creem] Using product ID: ${productId}`);

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId }),
    });

    console.log(`[Creem] API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`[Creem] API error:`, errorText);
      throw new Error(`Creem API error (${response.status}): ${errorText || "Unknown error"}`);
    }

    const data = await response.json();
    console.log(`[Creem] Checkout URL: ${data.checkout_url}`);
    
    if (!data.checkout_url) {
      console.error(`[Creem] No checkout_url in response:`, data);
      throw new Error("No checkout URL returned from Creem");
    }
    
    return { url: data.checkout_url };
  }
}

export function getPaymentProvider(): PaymentProvider | null {
  const apiKey = process.env.CREEM_API_KEY;
  
  // 检查 API key 是否是有效的（不是占位符）
  if (!apiKey || apiKey === "creem_test_xxx" || apiKey.startsWith("your-")) {
    console.error("[Payment] Invalid or missing CREEM_API_KEY");
    return null;
  }

  const productIds = {
    // 订阅计划
    pro: process.env.CREEM_PRODUCT_PRO || "",
    max: process.env.CREEM_PRODUCT_MAX || "",
    team: process.env.CREEM_PRODUCT_TEAM || "",
    // 点数包
    "credits-small": process.env.CREEM_PRODUCT_CREDITS_SMALL || "",
    "credits-medium": process.env.CREEM_PRODUCT_CREDITS_MEDIUM || "",
    "credits-large": process.env.CREEM_PRODUCT_CREDITS_LARGE || "",
  };

  // 检查占位符产品 ID
  const placeholderProductIds = [
    "prod_3TGoHetTyl8m6N5d3ByY2v",
    "prod_9LujLG243g7iUygjeiNuR", 
    "prod_5WDywB0e9VrvcRHaxLZs7L"
  ];
  
  // 检查是否有有效的产品 ID（不是占位符且不是空的）
  const hasValidProductIds = Object.values(productIds).some(id => 
    id && !placeholderProductIds.includes(id) && !id.startsWith("your-")
  );

  if (!hasValidProductIds) {
    console.error("[Payment] Missing valid product IDs");
    return null;
  }

  const env = (process.env.CREEM_ENV || "test") as CreemEnv;
  const validEnvs: CreemEnv[] = ["test", "production"];
  const creemEnv = validEnvs.includes(env) ? env : "test";

  console.log(`[Payment] Initialized Creem provider (env: ${creemEnv})`);
  console.log(`[Payment] Available product IDs:`, Object.keys(productIds).filter(k => (productIds as any)[k]));

  return new CreemProvider(apiKey, productIds, creemEnv);
}