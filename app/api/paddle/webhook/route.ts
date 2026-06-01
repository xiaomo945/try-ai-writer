import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

const PADDLE_VENDOR_ID = process.env.PADDLE_VENDOR_ID || "";
const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || "";

function verifySignature(body: string, signature: string): boolean {
  if (!PADDLE_WEBHOOK_SECRET) return false;
  const expected = createHmac("sha256", PADDLE_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");
  return expected === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("paddle-signature") || "";

    if (PADDLE_WEBHOOK_SECRET && !verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(body);
    const alertName = data.alert_name;

    if (["subscription_created", "subscription_updated", "subscription_cancelled"].includes(alertName)) {
      const userId = data.passthrough || data.user_id || "unknown";
      const plan = data.subscription_plan_id || data.product_id || "free";
      let tier = "free";
      if (String(plan).includes("pro")) tier = "pro";
      else if (String(plan).includes("max")) tier = "max";

      return NextResponse.json({ received: true, userId, tier, event: alertName });
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
