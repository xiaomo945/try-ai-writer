"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { plans } from "@/lib/pricing";

// Product structured data — derived from shared pricing module
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Try AI Writer",
  "description": "AI writing tool that learns your voice",
  "brand": {
    "@type": "Brand",
    "name": "Try AI Writer",
  },
  "offers": plans.map((plan) => ({
    "@type": "Offer",
    "name": `${plan.name} Plan`,
    "price": plan.price.replace("$", ""),
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "description": plan.features.slice(0, 2).join(", "),
    ...(plan.price !== "$0" ? { "priceValidUntil": "2027-12-31" } : {}),
  })),
};

// BreadcrumbList structured data
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://tryaiwriter.com/",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Pricing",
      "item": "https://tryaiwriter.com/pricing",
    },
  ],
};

export default function PricingContent() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { data: session, status } = useSession();

  const handlePlanClick = async (planName: string) => {
    const planKey = planName.toLowerCase() as "pro" | "max" | "free";

    console.log(`[Pricing] 用户点击套餐: ${planName} (key: ${planKey})`);
    console.log(`[Pricing] Session 状态: ${status}`);

    if (status === "loading") {
      alert("Please wait, checking your login status...");
      return;
    }

    if (status === "unauthenticated") {
      // Save selected plan to localStorage before redirecting to login
      localStorage.setItem("pending_plan", planKey);
      window.location.href = "/login?redirect=/pricing";
      return;
    }

    if (planKey === "free") {
      window.location.href = "/write";
      return;
    }

    setLoadingPlan(planName);

    try {
      console.log("[Pricing] 发起支付请求...");

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch("/api/payment/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.url) {
        throw new Error("No checkout URL returned");
      }

      console.log(`[Pricing] 跳转到支付页面: ${data.url}`);
      window.location.href = data.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      console.log(`[Pricing] 支付错误: ${message}`);
      alert("支付错误: " + message + "\n\n请稍后再试");
    } finally {
      setLoadingPlan(null);
    }
  };

  // Auto-trigger payment if returning from login with plan parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planParam = urlParams.get("plan");
    
    if (planParam && status === "authenticated" && !loadingPlan) {
      console.log(`[Pricing] 检测到 plan 参数: ${planParam}，自动触发支付`);
      // Clean up URL
      window.history.replaceState({}, "", "/pricing");
      // Trigger payment for the plan
      handlePlanClick(planParam);
    }
  }, [status, loadingPlan]);

  const isPaidPlan = (planName: string) => {
    return planName.toLowerCase() !== "free";
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-glass-border">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="bg-gradient-to-r from-[#4A90E2] to-[#A855F7] bg-clip-text text-transparent font-display text-xl font-extrabold">
              Try AI Writer
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/write" className="btn-primary text-sm min-h-[40px] px-4">
                Start Writing
              </Link>
            </div>
          </div>
        </header>

        {/* Pricing Content */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Start free, upgrade when you need more.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`glass-card p-8 ${plan.recommended ? "border-[rgba(168,85,247,0.2)]" : ""}`}
                style={plan.recommended ? { boxShadow: "0 0 40px rgba(168, 85, 247, 0.1)" } : {}}
              >
                <div>
                  {/* Plan Name */}
                  <h2 className="text-xl font-display font-bold text-white">
                    {plan.name}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6">
                    <p className="text-5xl font-display font-extrabold text-white">
                      {plan.price}
                    </p>
                    <p className="text-sm text-slate-400">
                      /month
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <span className="text-sm font-mono text-[#4A90E2] mt-0.5 flex-shrink-0">{">"}</span>
                        <span className="text-slate-400">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanClick(plan.name)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full mt-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      plan.recommended || isPaidPlan(plan.name)
                        ? "btn-primary"
                        : "btn-outline"
                    }`}
                  >
                    {loadingPlan === plan.name ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Redirecting...
                      </div>
                    ) : (
                      plan.cta
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Compare with Alternatives */}
          <div className="mt-20 md:mt-32">
            <h2 className="text-3xl font-display font-bold text-white text-center mb-12">
              Compare with Alternatives
            </h2>
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-slate-400 font-semibold">Feature</th>
                    <th className="text-center p-4 text-blue-400 font-semibold">Try AI Writer Pro</th>
                    <th className="text-center p-4 text-slate-400 font-semibold">Jasper</th>
                    <th className="text-center p-4 text-slate-400 font-semibold">Copy.ai</th>
                    <th className="text-center p-4 text-slate-400 font-semibold">Writesonic</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-slate-300">Monthly Price</td>
                    <td className="p-4 text-center text-white font-bold">$9</td>
                    <td className="p-4 text-center text-slate-400">$49</td>
                    <td className="p-4 text-center text-slate-400">$29</td>
                    <td className="p-4 text-center text-slate-400">$39</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-slate-300">Free Tier</td>
                    <td className="p-4 text-center text-emerald-400">✅ 10/day</td>
                    <td className="p-4 text-center text-red-400">❌ 7-day trial</td>
                    <td className="p-4 text-center text-emerald-400">✅</td>
                    <td className="p-4 text-center text-emerald-400">✅</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-slate-300">Brand Voice Learning</td>
                    <td className="p-4 text-center text-emerald-400">✅ Digital Twin</td>
                    <td className="p-4 text-center text-emerald-400">✅</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-slate-300">Claude Model</td>
                    <td className="p-4 text-center text-emerald-400">✅</td>
                    <td className="p-4 text-center text-emerald-400">✅</td>
                    <td className="p-4 text-center text-emerald-400">✅</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4 text-slate-300">Creative Interview</td>
                    <td className="p-4 text-center text-emerald-400">✅</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-slate-300">Chinese Optimization</td>
                    <td className="p-4 text-center text-emerald-400">✅</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                    <td className="p-4 text-center text-red-400">❌</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 md:mt-32">
            <h2 className="text-3xl font-display font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  question: "Can I cancel anytime?",
                  answer: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
                },
                {
                  question: "Is there a free trial?",
                  answer: "Our Free plan is essentially an unlimited trial. Use 10 Claude + 10 DeepSeek generations per day forever, no credit card required."
                },
                {
                  question: "Can I switch plans?",
                  answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
                }
              ].map((faq, index) => (
                <div key={index} className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-slate-400">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-glass-border">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm text-slate-500">&copy; 2026 Try AI Writer. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
