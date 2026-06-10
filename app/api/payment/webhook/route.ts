import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { upsertSubscription, cancelSubscription } from "@/lib/subscription-store";

const CREEM_WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET || "";

function verifySignature(body: string, signature: string): boolean {
  if (!CREEM_WEBHOOK_SECRET) {
    console.warn("[Creem] No webhook secret configured — skipping signature verification");
    return true;
  }
  const expected = createHmac("sha256", CREEM_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

function parseTier(productName: string): "free" | "pro" | "max" | "team" {
  const n = String(productName).toLowerCase();
  if (n.includes("team")) return "team";
  if (n.includes("max")) return "max";
  if (n.includes("pro")) return "pro";
  return "free";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("creem-signature") || req.headers.get("x-creem-signature") || "";

    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const eventType: string = data.event_type || data.type || "";
    const userId: string =
      data.metadata?.user_id ||
      data.customer?.email ||
      data.customer_email ||
      "";
    const productId: string =
      data.product?.id ||
      data.product_id ||
      data.subscription?.product_id ||
      "unknown";
    const subscriptionId: string =
      data.subscription?.id || data.subscription_id || "";

    console.log(`[Creem Webhook] ${eventType} — user: ${userId}, product: ${productId}`);

    if (!userId) {
      console.warn("[Creem Webhook] Missing userId in webhook payload");
      return NextResponse.json({ received: true, warning: "No userId" });
    }

    const tier = parseTier(productId);

    switch (eventType) {
      case "subscription.created":
      case "subscription.updated":
      case "checkout.completed":
      case "order.completed":
        upsertSubscription({
          userId,
          tier,
          status: "active",
          planId: productId,
          provider: "creem",
          providerSubscriptionId: subscriptionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        break;

      case "subscription.cancelled":
      case "subscription.expired":
        cancelSubscription(userId);
        break;

      case "subscription.payment_succeeded":
      case "invoice.paid":
        upsertSubscription({
          userId,
          tier,
          status: "active",
          planId: productId,
          provider: "creem",
          providerSubscriptionId: subscriptionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        break;

      case "subscription.payment_failed":
      case "invoice.payment_failed":
        console.warn(`[Creem Webhook] Payment failed for ${userId}`);
        break;

      default:
        console.log(`[Creem Webhook] Unhandled event: ${eventType}`);
    }

    return NextResponse.json({ received: true, userId, tier, event: eventType });
  } catch (err) {
    console.error("[Creem Webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}