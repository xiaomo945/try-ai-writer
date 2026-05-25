// Payment provider interface
export interface PaymentProvider {
  createCheckoutSession(plan: string, currency: string): Promise<{ url: string }>;
  verifyWebhook(payload: unknown, signature: string): Promise<boolean>;
}

// Creem payment provider (to be implemented)
export class CreemProvider implements PaymentProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createCheckoutSession(plan: string, currency: string): Promise<{ url: string }> {
    // TODO: Implement Creem API integration
    // Documentation: https://docs.creem.io/api-reference/checkouts
    return { url: '/payment/pending' };
  }

  async verifyWebhook(payload: unknown, signature: string): Promise<boolean> {
    // TODO: Implement Creem webhook signature verification
    return false;
  }
}

// Get current payment provider
export function getPaymentProvider(): PaymentProvider | null {
  const apiKey = process.env.CREEM_API_KEY;
  if (!apiKey) return null;
  return new CreemProvider(apiKey);
}