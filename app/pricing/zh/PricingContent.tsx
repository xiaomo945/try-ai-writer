"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Star, Loader2 } from "lucide-react";

// 中文版本的定价计划
const chinesePlans = [
  {
    name: "免费版",
    description: "适合刚开始使用的用户",
    price: "$0",
    period: "永久免费",
    features: [
      "每天 10 次 Claude 生成",
      "每天 10 次 DeepSeek 生成",
      "基础品牌声音学习",
      "标准编辑建议",
      "社区支持"
    ],
    cta: "免费开始",
    recommended: false
  },
  {
    name: "专业版",
    description: "适合专业写作者和内容创作者",
    price: "$9",
    period: "/月",
    features: [
      "无限 Claude + DeepSeek 生成",
      "高级品牌声音分析",
      "完整编辑建议",
      "文件上传 (50MB)",
      "优先支持",
      "记忆银行功能",
      "数字分身助手"
    ],
    cta: "立即升级",
    recommended: true
  },
  {
    name: "旗舰版",
    description: "适合团队和高频用户",
    price: "$25",
    period: "/月",
    features: [
      "专业版所有功能",
      "团队协作功能",
      "无限文件上传",
      "API 访问",
      "专属客户经理",
      "高级分析报告",
      "自定义品牌声音模型"
    ],
    cta: "选择旗舰版",
    recommended: false
  }
];

export default function PricingContentZh() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handlePlanClick = async (planName: string) => {
    if (planName === "免费版") {
      window.location.href = "/login";
      return;
    }

    let planKey: "pro" | "max" | "team";
    if (planName === "专业版") planKey = "pro";
    else if (planName === "旗舰版") planKey = "max";
    else planKey = "team";

    setLoadingPlan(planName);
    
    try {
      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("启动结账流程失败，请重试。");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-emerald-600 font-display text-xl font-extrabold">
              Use AI Writer
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/write" className="btn-primary text-sm min-h-[40px] px-4">
                开始写作
              </Link>
            </div>
          </div>
        </header>

        {/* Pricing Content */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 dark:text-white mb-6">
              简单透明的定价
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto">
              免费开始。需要更多功能时再升级。
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {chinesePlans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-gray-950 rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.recommended 
                    ? "border-emerald-500 shadow-emerald-500/20 scale-105" 
                    : "border-slate-200 dark:border-gray-700"
                }`}
              >
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                    <Star className="w-4 h-4" />
                    最受欢迎
                  </div>
                )}

                <div className="p-8">
                  <div className="mb-8">
                    <h2 className={`text-2xl font-display font-bold mb-2 ${
                      plan.recommended ? "text-emerald-600" : "text-slate-900 dark:text-white"
                    }`}>
                      {plan.name}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">{plan.description}</p>
                  </div>

                  <div className="mb-8">
                    <p className={`text-5xl font-display mb-2 font-extrabold ${
                      plan.recommended ? "text-emerald-600" : "text-slate-900 dark:text-white"
                    }`}>
                      {plan.price}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">{plan.period}</p>
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check size={20} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanClick(plan.name)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full text-center block py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      plan.recommended
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
                        : "bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {loadingPlan === plan.name ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        重定向中...
                      </div>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 md:mt-32">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white text-center mb-12">
              常见问题
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  question: "我可以随时取消吗？",
                  answer: "是的，您可以随时取消订阅。您的访问权限将持续到计费周期结束。"
                },
                {
                  question: "你们接受哪些支付方式？",
                  answer: "我们接受所有主要信用卡、PayPal，以及年度计划的银行转账。"
                },
                {
                  question: "有免费试用吗？",
                  answer: "我们的免费版实际上就是无限试用。每天可以使用 10 次 Claude + 10 次 DeepSeek 生成，无需信用卡。"
                },
                {
                  question: "我可以切换套餐吗？",
                  answer: "是的，您可以随时升级或降级套餐。更改将立即生效。"
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white dark:bg-gray-950 p-6 rounded-xl border border-slate-200 dark:border-gray-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 bg-white dark:bg-gray-950 border-t border-slate-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm text-slate-500">&copy; 2026 Use AI Writer. 保留所有权利。</p>
          </div>
        </footer>
      </main>
    </>
  );
}