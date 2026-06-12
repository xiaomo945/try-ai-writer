import { NextRequest } from "next/server";
import { createLogger } from "@/lib/logger";

const logger = createLogger("Payment");

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
    logger.info("Creating checkout session", { plan });

    const productId = this.productIds[plan];
    if (!productId) {
      logger.error("Unknown plan", { plan });
      throw new Error(`Unknown plan: ${plan}`);
    }

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productId }),
    });

    logger.info("Creem API response", { status: response.status });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      logger.error("Creem API error", { status: response.status, error: errorText.substring(0, 200) });
      throw new Error(`Creem API error (${response.status}): ${errorText || "Unknown error"}`);
    }

    const data = await response.json();

    if (!data.checkout_url) {
      logger.error("No checkout_url in response");
      throw new Error("No checkout URL returned from Creem");
    }

    logger.info("Checkout session created");
    return { url: data.checkout_url };
  }
}

export function getPaymentProvider(): PaymentProvider | null {
  const apiKey = process.env.CREEM_API_KEY;

  if (!apiKey || apiKey === "creem_test_xxx" || apiKey.startsWith("your-")) {
    logger.warn("Invalid or missing CREEM_API_KEY");
    return null;
  }

  const productIds: Record<string, string> = {
    pro: process.env.CREEM_PRODUCT_PRO || "",
    max: process.env.CREEM_PRODUCT_MAX || "",
    team: process.env.CREEM_PRODUCT_TEAM || "",
    "credits-small": process.env.CREEM_PRODUCT_CREDITS_SMALL || "",
    "credits-medium": process.env.CREEM_PRODUCT_CREDITS_MEDIUM || "",
    "credits-large": process.env.CREEM_PRODUCT_CREDITS_LARGE || "",
  };

  const placeholderProductIds = [
    "prod_3TGoHetTyl8m6N5d3ByY2v",
    "prod_9LujLG243g7iUygjeiNuR",
    "prod_5WDywB0e9VrvcRHaxLZs7L",
  ];

  const hasValidProductIds = Object.values(productIds).some(
    (id) => id && !placeholderProductIds.includes(id) && !id.startsWith("your-")
  );

  if (!hasValidProductIds) {
    logger.warn("Missing valid product IDs");
    return null;
  }

  const env = (process.env.CREEM_ENV || "test") as CreemEnv;
  const validEnvs: CreemEnv[] = ["test", "production"];
  const creemEnv = validEnvs.includes(env) ? env : "test";

  const availablePlans = Object.entries(productIds)
    .filter(([, id]) => id && !placeholderProductIds.includes(id))
    .map(([plan]) => plan);

  logger.info("Creem provider initialized", { env: creemEnv, availablePlans });

  return new CreemProvider(apiKey, productIds, creemEnv);
}