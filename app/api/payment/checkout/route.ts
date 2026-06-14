import { NextRequest } from "next/server";
import { getPaymentProvider } from "@/lib/payment";
import { trackEvent, trackFunnelStep } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  console.log("[Checkout] 请求收到");

  try {
    const { plan } = await request.json();
    console.log(`[Checkout] 计划参数: ${plan}`);

    const validPlans = ["free", "pro", "max", "team"];
    if (!plan || !validPlans.includes(plan)) {
      console.log(`[Checkout] 错误: 未知套餐: ${plan}`);
      trackEvent("checkout_error", "error", { plan, error: "invalid_plan" });
      return Response.json({ error: "未知套餐: " + plan }, { status: 400 });
    }

    // Track checkout initiation
    trackEvent("checkout_initiated", "conversion", { plan });
    trackFunnelStep("payment", "initiate_checkout", 1, "anonymous", { plan });

    console.log("[Checkout] 调用支付提供商...");

    const provider = getPaymentProvider();
    if (!provider) {
      console.log("[Checkout] 错误: 支付提供商未初始化");
      trackEvent("checkout_error", "error", { plan, error: "provider_not_initialized" });
      return Response.json(
        { error: "支付系统未正确配置，请联系支持。" },
        { status: 500 }
      );
    }

    const session = await provider.createCheckoutSession(request, plan);

    if (!session.url) {
      console.log("[Checkout] 错误: 支付提供商未返回支付链接");
      trackEvent("checkout_error", "error", { plan, error: "no_checkout_url" });
      return Response.json(
        { error: "支付提供商未返回支付链接" },
        { status: 500 }
      );
    }

    // Track checkout URL generated
    trackEvent("checkout_url_generated", "conversion", { plan });
    trackFunnelStep("payment", "checkout_url_generated", 2, "anonymous", { plan });

    console.log(`[Checkout] 支付URL: ${session.url}`);
    return Response.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    console.log(`[Checkout] 错误: ${message}`);
    trackEvent("checkout_error", "error", { error: message });
    return Response.json({ error: message }, { status: 500 });
  }
}
