"use client";

import Link from "next/link";
import { KeyRound, ShieldCheck, Wrench } from "lucide-react";
import Logo from "@/app/components/Logo";

const points = [
  {
    icon: Wrench,
    title: "Free offline tools — no quota",
    desc: "SEO analyzer, originality checker, prompt optimizer, and word counter are free and need no key at all.",
  },
  {
    icon: KeyRound,
    title: "AI writing runs on your own key",
    desc: "Paste your DeepSeek or Claude API key in the browser. Unlimited generations, no markup, no credit balance to top up.",
  },
  {
    icon: ShieldCheck,
    title: "Your key stays with you",
    desc: "Stored only in your browser and sent straight to your provider. We never see it and never bill you.",
  },
];

export default function CreditsInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-gray-950 dark:to-gray-900">
      <header className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-600 font-display text-xl">
            <Logo size={32} />
            Use <span className="font-extrabold">AI Writer</span>
          </Link>
          <Link href="/pricing" className="btn-outline text-sm px-4 py-2">
            Back to Pricing
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-extrabold text-slate-900 dark:text-white mb-4">
            No Credits to Buy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Try AI Writer doesn&apos;t sell credits or subscriptions. Everything is free — AI
            generations run on your own API key, and our offline tools cost nothing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {points.map((p) => (
            <div key={p.title} className="card p-6 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <p.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">
                {p.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 glass-card dark:bg-gray-900/60 p-8 text-center">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3">
            How it works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We&apos;re supported by ads, not by selling you credits. Bring your own API key for
            unlimited AI writing, or just use the free offline tools — no account, no card, no
            balance to manage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/write" className="btn-primary text-lg px-8 py-4">
              Add Your API Key
            </Link>
            <Link href="/tools" className="btn-outline text-lg px-8 py-4">
              Browse Free Tools
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
