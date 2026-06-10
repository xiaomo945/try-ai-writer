import { NextRequest } from "next/server";
import { getPaymentProvider } from "@/lib/payment";

export async function POST(request: NextRequest) {
  console.log("[Checkout] 请求收到");

  try {
    const { plan } = await request.json();
    console.log(`[Checkout] 计划参数: ${plan}`);

    const validPlans = ["free", "pro", "max", "team"];
    if (!plan || !validPlans.includes(plan)) {
      console.log(`[Checkout] 错误: 未知套餐: ${plan}`);
      return Response.json({ error: "未知套餐: " + plan }, { status: 400 });
    }

    console.log("[Checkout] 调用支付提供商...");

    const provider = getPaymentProvider();
    if (!provider) {
      console.log("[Checkout] 错误: 支付提供商未初始化");
      return Response.json(
        { error: "支付系统未正确配置，请联系支持。" },
        { status: 500 }
      );
    }

    const session = await provider.createCheckoutSession(request, plan);

    if (!session.url) {
      console.log("[Checkout] 错误: 支付提供商未返回支付链接");
      return Response.json(
        { error: "支付提供商未返回支付链接" },
        { status: 500 }
      );
    }

    console.log(`[Checkout] 支付URL: ${session.url}`);
    return Response.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    console.log(`[Checkout] 错误: ${message}`);
    return Response.json({ error: message }, { status: 500 });
  }
}
