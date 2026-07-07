import { NextRequest } from "next/server";
import { getPaymentProvider } from "@/lib/payment";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "请先登录" }, { status: 401 });
    }

    const { plan } = await request.json();

    const validPlans = ["free", "pro", "max", "team"];
    if (!plan || !validPlans.includes(plan)) {
      return Response.json({ error: "未知套餐: " + plan }, { status: 400 });
    }

    const provider = getPaymentProvider();
    if (!provider) {
      return Response.json(
        { error: "支付系统未正确配置，请联系支持。" },
        { status: 500 }
      );
    }

    const session_ = await provider.createCheckoutSession(request, plan);

    if (!session_.url) {
      return Response.json(
        { error: "支付提供商未返回支付链接" },
        { status: 500 }
      );
    }

    return Response.json({ url: session_.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return Response.json({ error: message }, { status: 500 });
  }
}
