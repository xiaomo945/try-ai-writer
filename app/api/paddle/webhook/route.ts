import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { upsertSubscription, cancelSubscription } from "@/lib/subscription-store";

const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || "";

function verifySignature(body: string, signature: string): boolean {
  if (!PADDLE_WEBHOOK_SECRET) {
    console.warn("[Paddle] No webhook secret configured — skipping signature verification");
    return true;
  }
  const expected = createHmac("sha256", PADDLE_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

function parseTier(plan: string): "free" | "pro" | "max" | "team" {
  const p = String(plan).toLowerCase();
  if (p.includes("team")) return "team";
  if (p.includes("max")) return "max";
  if (p.includes("pro")) return "pro";
  return "free";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("paddle-signature") || "";

    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const alertName: string = data.alert_name || "";
    const userId: string = data.passthrough || data.user_id || "";
    const planId: string = data.subscription_plan_id || data.product_id || "unknown";
    const subscriptionId: string = data.subscription_id || "";

    console.log(`[Paddle Webhook] ${alertName} — user: ${userId}, plan: ${planId}`);

    if (!userId) {
      console.warn("[Paddle Webhook] Missing userId in webhook payload");
      return NextResponse.json({ received: true, warning: "No userId" });
    }

    const tier = parseTier(planId);

    switch (alertName) {
      case "subscription_created":
      case "subscription_updated":
        upsertSubscription({
          userId,
          tier,
          status: "active",
          planId,
          provider: "paddle",
          providerSubscriptionId: subscriptionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        break;

      case "subscription_cancelled":
        cancelSubscription(userId);
        break;

      case "subscription_payment_succeeded":
        // Payment succeeded — ensure subscription is active
        upsertSubscription({
          userId,
          tier,
          status: "active",
          planId,
          provider: "paddle",
          providerSubscriptionId: subscriptionId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        break;

      case "subscription_payment_failed":
        console.warn(`[Paddle Webhook] Payment failed for ${userId}`);
        break;

      default:
        console.log(`[Paddle Webhook] Unhandled event: ${alertName}`);
    }

    return NextResponse.json({ received: true, userId, tier, event: alertName });
  } catch (err) {
    console.error("[Paddle Webhook] Error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}