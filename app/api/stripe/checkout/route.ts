import { NextRequest, NextResponse } from "next/server";
import { getPriceConfig, Currency } from "@/lib/stripe-pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const plan: string | undefined = body.plan;
    const currency: Currency = (body.currency === "cny" ? "cny" : "usd") as Currency;

    if (!plan) {
      return NextResponse.json({ error: "Plan is required" }, { status: 400 });
    }

    const priceConfig = getPriceConfig(plan, currency);
    if (!priceConfig) {
      return NextResponse.json({ error: `Invalid plan: ${plan} for currency ${currency}` }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000";

    if (!secretKey || secretKey.startsWith("sk_test_placeholder") || secretKey.startsWith("your-")) {
      return NextResponse.json({
        url: `${origin}/payment/success?session_id=mock_session_${Date.now()}`,
        mock: true,
      });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceConfig.stripePriceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing${currency === "cny" ? "/zh" : ""}`,
      metadata: {
        plan: priceConfig.planId,
        currency,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}