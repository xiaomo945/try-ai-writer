import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — Use AI Writer | Plans from $0 to $15/mo",
  description: "Choose the perfect plan for your needs. Free tier available with 10 generations per day. No credit card required.",
};

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  recommended?: boolean;
};

type FAQ = {
  question: string;
  answer: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Free to get started",
    features: ["0 Claude generations/month", "10 DeepSeek generations/day", "Basic templates", "Email support"],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "$9",
    description: "Best value for money",
    features: ["50 Claude generations/month", "100 DeepSeek generations/day", "All templates", "API access", "Priority support", "Custom tone"],
    cta: "Start Pro",
    recommended: true,
  },
  {
    name: "Max",
    price: "$25",
    description: "Most popular",
    features: ["300 Claude generations/month", "Unlimited DeepSeek generations", "All templates", "API access", "Priority support", "Custom tone", "Brand kit"],
    cta: "Start Max",
    popular: true,
  },
  {
    name: "Team",
    price: "$59",
    description: "For 5-person teams",
    features: ["1000 Claude generations/month", "Unlimited DeepSeek generations", "All templates", "API access", "Priority support", "Brand kit", "Analytics", "5 team members"],
    cta: "Start Team",
  },
];

const faqs: FAQ[] = [
  { question: "Can I cancel anytime?", answer: "Yes, you can cancel your subscription at any time. No hidden fees, no contracts." },
  { question: "What counts as a generation?", answer: "Each time you click Generate and receive AI output counts as one generation. Drafts you don't use still count." },
  { question: "Do unused generations roll over?", answer: "No, generations reset daily. Unused ones do not carry over to the next day." },
  { question: "Is my data safe?", answer: "Your data is encrypted and never used for training our AI models. We respect your privacy." },
];

export default function PricingPage() {
  return (
    <main className="flex flex-col items-center w-full">
      {/* Header */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl lg:text-6xl text-slate-900 dark:text-white mb-6">Simple, Transparent Pricing</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Start free. Upgrade when you need more power.</p>
      </section>

      {/* Pricing Cards */}
      <section className="w-full bg-slate-50 dark:bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`card flex flex-col ${plan.recommended || plan.popular ? "border-2 border-emerald-600 relative" : ""}`}
                >
                  {plan.recommended && (
                    <span className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Recommended
                    </span>
                  )}
                  {plan.popular && (
                    <span className="absolute top-0 right-6 -translate-y-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-2xl font-display font-extrabold mb-2">{plan.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">{plan.description}</p>
                  <p className="text-4xl font-bold mb-6">
                    {plan.price}
                    <span className="text-lg font-normal text-slate-500">/mo</span>
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check size={18} className="text-emerald-600 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/login" className={(plan.recommended || plan.popular) ? "btn-primary w-full" : "btn-outline w-full"}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-3xl mx-auto px-4 py-24">
        <h2 className="text-4xl text-center mb-12 font-display font-extrabold">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="card group cursor-pointer"
            >
              <summary className="flex items-center justify-between list-none text-lg font-semibold text-slate-900 dark:text-white">
                {faq.question}
                <ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-slate-600 dark:text-slate-400 mt-4">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-slate-900 dark:bg-gray-950 py-24">
        <div className="max-w-2xl mx-auto text-center px-4 space-y-6">
          <h2 className="text-4xl text-white">Ready to write 3x faster?</h2>
          <p className="text-xl text-slate-300">Join 100+ creators already using Use AI Writer.</p>
          <Link href="/login" className="btn-primary text-lg px-10 py-4">Start Writing Free</Link>
        </div>
      </section>
    </main>
  );
}
