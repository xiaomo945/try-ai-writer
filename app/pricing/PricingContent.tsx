"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Star, Loader2 } from "lucide-react";
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

      <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-900">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="text-emerald-600 font-display text-xl font-extrabold">
              Use AI Writer
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/write" className="btn-primary text-sm min-h-[40px] px-4">
                Start Writing
              </Link>
            </div>
          </div>
        </header>

        {/* Pricing Content */}
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 dark:text-white mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto">
              Start free. Upgrade when you need more power for your writing.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => (
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
                    Most Popular
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
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white text-center mb-12">
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
            <p className="text-sm text-slate-500">&copy; 2026 Use AI Writer. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </>
  );
}