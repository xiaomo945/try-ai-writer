// Payment provider interface
export interface PaymentProvider {
  createCheckoutSession(plan: string, currency?: string): Promise<{ url: string }>;
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;
}

// Creem payment provider
export class CreemProvider implements PaymentProvider {
  private apiKey: string;
  private productIds: Record<string, string>;

  constructor(apiKey: string, productIds: Record<string, string>) {
    this.apiKey = apiKey;
    this.productIds = productIds;
  }

  async createCheckoutSession(plan: string, currency?: string): Promise<{ url: string }> {
    const productId = this.productIds[plan];
    if (!productId) {
      throw new Error(`No product ID configured for plan: ${plan}`);
    }

    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `Failed to create checkout session: ${response.status}`);
    }

    const data = await response.json();
    return { url: data.checkout_url };
  }

  async verifyWebhook(payload: unknown, signature: string): Promise<boolean> {
    // TODO: Implement Creem webhook signature verification
    // Documentation: https://docs.creem.io/api-reference/webhooks
    return false;
  }
}

// Get current payment provider
export function getPaymentProvider(): PaymentProvider | null {
  const apiKey = process.env.CREEM_API_KEY;
  const productPro = process.env.CREEM_PRODUCT_PRO;
  const productMax = process.env.CREEM_PRODUCT_MAX;
  const productTeam = process.env.CREEM_PRODUCT_TEAM;
  
  if (!apiKey || !productPro || !productMax || !productTeam) {
    return null;
  }
  
  const productIds = {
    pro: productPro,
    max: productMax,
    team: productTeam,
  };
  
  return new CreemProvider(apiKey, productIds);
}