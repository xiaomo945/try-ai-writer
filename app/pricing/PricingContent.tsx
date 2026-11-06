"use client";

import Link from "next/link";
import { Check, KeyRound, PenLine, ShieldCheck, Sparkles, Wrench } from "lucide-react";

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

const freeTools = [
  "SEO Analyzer — score any page against 20+ on-page factors",
  "Originality Checker — detect AI vs. human-written text",
  "Prompt Optimizer — turn vague briefs into sharp prompts",
  "Word Counter — counts, reading time, keyword density",
  "Full editor with brand-voice learning & templates",
];

const byokFeatures = [
  "Paste your own DeepSeek or Claude API key",
  "Unlimited generations — no daily cap, no markup",
  "Your key is stored only in your browser",
  "Never uploaded to our servers",
  "Pay only your provider's API rates",
];

const faqs = [
  {
    q: "Is Try AI Writer really free?",
    a: "Yes. The app is free to use. AI writing runs on your own API key (BYOK); our offline writing tools need no key at all. We don't sell subscriptions or credits.",
  },
  {
    q: "Where is my API key stored?",
    a: "Only in your browser's local storage. It is sent directly to your chosen provider and is never uploaded to or stored on our servers.",
  },
  {
    q: "How do you make money if it's free?",
    a: "We are supported by privacy-friendly ads, not subscriptions. That's why there is no credit card, no trial expiry, and no paywall.",
  },
  {
    q: "Do I need an account?",
    a: "No. You can use every tool without signing up. An account only helps you save your work and brand voice across devices.",
  },
];

export default function PricingContent() {
  return (
    <>
      {/* Structured Data */}
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

        {/* Content */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-16 md:py-24">
          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.08)] px-4 py-1 text-sm text-[#A855F7] mb-6">
              <Sparkles className="w-4 h-4" /> 100% Free · No Subscription
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4">
              Free Forever. Bring Your Own Key.
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Try AI Writer costs you nothing. Use our free offline writing tools with no key, or add your own DeepSeek / Claude API key for unlimited AI generations. We make money from ads — never from you.
            </p>
          </div>

          {/* Two ways to use — informational, not purchasable */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free offline tools */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-display font-bold text-white">Free Offline Tools</h2>
              </div>
              <p className="text-5xl font-display font-extrabold text-white mt-4">
                $0
                <span className="text-base font-normal text-slate-400 ml-2">forever</span>
              </p>
              <p className="text-sm text-slate-400 mt-1">No API key. No account. No quota.</p>
              <ul className="mt-8 space-y-3">
                {freeTools.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-sm font-mono text-emerald-400 mt-0.5 flex-shrink-0">{"✓"}</span>
                    <span className="text-slate-400">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/tools"
                className="w-full mt-8 py-3 rounded-lg text-sm font-semibold btn-outline inline-flex items-center justify-center"
              >
                Explore Free Tools
              </Link>
            </div>

            {/* BYOK AI writing */}
            <div
              className="glass-card p-8 border-[rgba(168,85,247,0.2)]"
              style={{ boxShadow: "0 0 40px rgba(168, 85, 247, 0.1)" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[rgba(168,85,247,0.12)] flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#A855F7]" />
                </div>
                <h2 className="text-xl font-display font-bold text-white">AI Writing (BYOK)</h2>
              </div>
              <p className="text-5xl font-display font-extrabold text-white mt-4">
                Your Key
                <span className="text-base font-normal text-slate-400 ml-2">unlimited</span>
              </p>
              <p className="text-sm text-slate-400 mt-1">You pay your provider. We add zero markup.</p>
              <ul className="mt-8 space-y-3">
                {byokFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="text-sm font-mono text-[#A855F7] mt-0.5 flex-shrink-0">{"✓"}</span>
                    <span className="text-slate-400">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/write"
                className="w-full mt-8 py-3 rounded-lg text-sm font-semibold btn-primary inline-flex items-center justify-center"
              >
                Add Your API Key
              </Link>
            </div>
          </div>

          {/* How we make money */}
          <div className="mt-16 glass-card p-8 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-display font-bold text-white text-lg mb-1">
                How we stay free
              </h3>
              <p className="text-slate-400">
                We are ad-supported, not subscription-supported. That is why there is no credit card,
                no trial that expires, and no paywall in front of your work. Bring your own API key and
                the AI runs at your provider&apos;s rates; everything else is on us.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-3xl font-display font-bold text-white text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <div key={index} className="glass-card p-6">
                  <h3 className="font-semibold text-white mb-2 flex items-start gap-2">
                    <PenLine className="w-4 h-4 text-[#4A90E2] mt-1 flex-shrink-0" />
                    {faq.q}
                  </h3>
                  <p className="text-slate-400">{faq.a}</p>
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
