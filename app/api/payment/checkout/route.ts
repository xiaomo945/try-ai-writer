import { NextRequest } from "next/server";
import { getPaymentProvider } from "@/lib/payment";

export async function POST(request: NextRequest) {
  console.log("[Checkout] Received checkout request");
  
  try {
    const { plan } = await request.json();
    console.log(`[Checkout] Plan requested: ${plan}`);
    
    if (!plan) {
      console.error("[Checkout] Missing plan parameter");
      return Response.json({ error: "Plan is required" }, { status: 400 });
    }

    const provider = getPaymentProvider();
    if (!provider) {
      console.error("[Checkout] Payment provider not initialized - check environment variables");
      return Response.json({ 
        error: "Payment system not configured properly. Please contact support." 
      }, { status: 500 });
    }

    console.log("[Checkout] Creating checkout session...");
    const session = await provider.createCheckoutSession(plan);
    console.log(`[Checkout] Checkout session created: ${session.url}`);
    
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("[Checkout] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Payment error" },
      { status: 500 }
    );
  }
}
