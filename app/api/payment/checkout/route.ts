import { NextRequest } from "next/server";
import { getPaymentProvider } from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json();
    if (!plan) {
      return Response.json({ error: "Plan is required" }, { status: 400 });
    }

    const provider = getPaymentProvider();
    if (!provider) {
      return Response.json({ error: "Payment not configured" }, { status: 500 });
    }

    const session = await provider.createCheckoutSession(plan);
    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Payment error" },
      { status: 500 }
    );
  }
}
