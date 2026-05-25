import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { plans } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing | Use AI Writer",
  description: "Simple, transparent pricing. Start free with 10 Claude + 10 DeepSeek generations per day. Upgrade to Pro for $9/month or Max for $25/month. No credit card required.",
  openGraph: {
    title: "Pricing | Use AI Writer",
    description: "Start free with 10 generations per day. Pro $9/month, Max $25/month.",
    url: "https://tryaiwriter.com/pricing",
    siteName: "Use AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Use AI Writer",
    description: "Start free with 10 generations per day. Pro $9/month, Max $25/month.",
    images: ["/og-image.png"],
  },
};

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

export default function PricingPage() {
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
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-16 md:py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 dark:text-white mb-6">
              Simple Pricing.
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto">
              Start free. Upgrade when you need more.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="flex flex-col md:flex-row">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`flex-1 px-8 md:px-12 py-12 ${index < plans.length - 1 ? "md:border-r md:border-slate-200" : ""}`}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>
                <p
                  className={`text-5xl font-display mb-2 ${plan.recommended ? "font-extrabold text-slate-900" : "font-bold text-slate-700"}`}
                >
                  {plan.price}
                </p>
                <p className="text-sm text-slate-400 mb-10">{plan.period}</p>
                <ul className="space-y-4 mb-12">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={plan.recommended ? "btn-primary w-full text-center block" : "btn-outline w-full text-center block"}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 md:mt-32">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I cancel anytime?</h3>
                <p className="text-slate-600 text-sm">
                  Yes, you can cancel your subscription at any time. Your access will continue until the end of your
                  billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-slate-600 text-sm">
                  We accept all major credit cards, PayPal, and bank transfers for annual plans.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Is there a free trial?</h3>
                <p className="text-slate-600 text-sm">
                  Our Free plan is essentially an unlimited trial. Use 10 Claude + 10 DeepSeek generations per day
                  forever, no credit card required.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Can I switch plans?</h3>
                <p className="text-slate-600 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-sm text-slate-400">&copy; 2026 Use AI Writer.</p>
          </div>
        </footer>
      </main>
    </>
  );
}
