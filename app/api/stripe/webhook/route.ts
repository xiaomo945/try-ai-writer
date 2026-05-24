import { NextRequest, NextResponse } from "next/server";

const subscriptions = new Map<string, { plan: string; currency: string; createdAt: string; status: string }>();

export function getSubscription(userId: string) {
  return subscriptions.get(userId) || null;
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || secret.startsWith("whsec_placeholder") || secret.startsWith("your-")) {
    return NextResponse.json({ received: true, mock: true });
  }

  try {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

    const sig = request.headers.get("stripe-signature");
    if (!sig) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
    }

    const body = await request.text();
    const event = stripe.webhooks.constructEvent(body, sig, secret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.customer as string || "unknown";
        const plan = session.metadata?.plan || "pro";
        const currency = session.metadata?.currency || "usd";
        subscriptions.set(userId, {
          plan,
          currency,
          createdAt: new Date().toISOString(),
          status: "active",
        });
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId || subscription.customer as string || "unknown";
        const existing = subscriptions.get(userId);
        if (existing) {
          subscriptions.set(userId, { ...existing, status: "canceled" });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}