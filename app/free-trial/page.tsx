"use client";

import Link from "next/link";
import { ArrowRight, Check, Zap, Shield, PenLine } from "lucide-react";
import { NavWrapper } from "@/app/components/NavWrapper";

const features = [
  {
    icon: Zap,
    title: "3 Free Generations",
    desc: "Generate blog posts, emails, or social content instantly — no card required.",
  },
  {
    icon: PenLine,
    title: "Learns Your Voice",
    desc: "Our Digital Twin adapts to your tone and style with every prompt.",
  },
  {
    icon: Shield,
    title: "100% Private",
    desc: "Your content is never used for AI training or shared with third parties.",
  },
];



export default function FreeTrialPage() {
  return (
    <main className="flex flex-col items-center w-full bg-white dark:bg-[#0A0A0C] text-slate-900 dark:text-white min-h-screen">
      <NavWrapper />

      {/* Hero */}
      <section className="section-container section-spacing pt-24 md:pt-32 text-center max-w-3xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold leading-tight">
          Try AI Writer Free –{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
            Start Writing Instantly
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 mt-6">
          No credit card required. Get 3 free generations and see why bloggers
          and marketers choose Try AI Writer.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Link
            href="/write"
            className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/pricing" className="btn-outline text-lg px-8 py-4">
            See Pricing
          </Link>
        </div>
        <p className="text-sm text-slate-500 mt-4">
          Free plan includes DeepSeek model. No signup needed.
        </p>
      </section>

      {/* Features */}
      <section className="section-container section-spacing w-full max-w-5xl">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass-card p-6 flex flex-col items-start"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust + Final CTA */}
      <section className="section-container section-spacing text-center max-w-3xl pb-24">
        <div className="glass-card p-8 sm:p-12">
          <h2 className="text-3xl font-display font-extrabold mb-4">
            Ready to write 3x faster?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Start writing smarter with Try AI Writer today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/write"
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
            >
              <Check className="w-5 h-5" /> Start Free Trial
            </Link>
            <Link href="/" className="btn-outline text-lg px-8 py-4">
              Learn More
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-6">
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>
    </main>
  );
}
