"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { plans } from "@/lib/pricing";

// Product structured data — derived from shared pricing module
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Use AI Writer",
  "description": "AI writing tool that learns your voice",
  "brand": {
    "@type": "Brand",
    "name": "Use AI Writer",
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

  const handlePlanClick = async (planName: string) => {
    if (planName.toLowerCase() === "free") {
      window.location.href = "/login";
      return;
    }

    const planKey = planName.toLowerCase() as "pro" | "max" | "team";
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
      alert("Failed to start checkout process. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

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

      <main className="min-h-screen flex flex-col bg-white">
        {/* Header */}
        <header className="border-b border-slate-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-emerald-600 font-display text-xl font-extrabold">
              Use AI Writer
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/write" className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold min-h-[40px] px-4 rounded-lg transition-all duration-200">
                Start Writing
              </Link>
            </div>
          </div>
        </header>

        {/* Pricing Content */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Start free, upgrade when you need more.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 ${
                  plan.recommended
                    ? "border-slate-100 shadow-md hover:shadow-xl"
                    : "border-slate-100 shadow-sm hover:shadow-xl"
                }`}
              >
                <div>
                  {/* Plan Name */}
                  <h2 className="text-xl font-display font-bold text-slate-900">
                    {plan.name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6">
                    <p className={`text-5xl font-display font-extrabold ${
                      plan.recommended ? "text-emerald-600" : "text-slate-900"
                    }`}>
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
                        <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePlanClick(plan.name)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full mt-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      plan.recommended || isPaidPlan(plan.name)
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "border border-slate-300 text-slate-900 hover:border-emerald-600 hover:text-emerald-600 bg-white"
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

          {/* FAQ Section */}
          <div className="mt-20 md:mt-32">
            <h2 className="text-3xl font-display font-bold text-slate-900 text-center mb-12">
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
                <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm text-slate-500">&copy; 2026 Use AI Writer. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
