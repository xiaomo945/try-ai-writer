"use client";

import { Check, PenTool, Zap, Brain, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { plans } from "@/lib/pricing";
import { Testimonials } from "./components/Testimonials";

const bentoFeatures = [
  {
    icon: Brain,
    title: "Brand Memory",
    description: "Your voice, style, and audience remembered across every session.",
    size: "large",
    delay: 0,
  },
  {
    icon: Zap,
    title: "Instant Drafts",
    description: "Idea to polished draft in 30 seconds flat.",
    size: "small",
    delay: 100,
  },
  {
    icon: PenTool,
    title: "Your Voice",
    description: "Not generic AI. Your words, amplified.",
    size: "small",
    delay: 200,
  },
  {
    icon: Sparkles,
    title: "Creative Assistant",
    description: "AI that understands your creative vision perfectly.",
    size: "large",
    delay: 300,
  },
];

const loadingTexts = [
  "> Learning your brand voice...",
  "> Analyzing writing patterns...",
  "> Generating creative content...",
  "> Polishing final output...",
];

export default function LandingPage() {
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Abstract flowing light band */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-40 bg-gradient-to-r from-transparent via-[#4A90E2]/15 to-transparent blur-3xl animate-pulse" />
        </div>

        <div className="w-full max-w-5xl mx-auto px-6 py-16 md:py-32 text-center relative z-10">
          {/* Kinetic Typography Title */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-extrabold leading-none tracking-tight mb-8" style={{ textShadow: "0 0 80px rgba(74,144,226,0.3)" }}>
            Write Like You,
            <br />
            <span className="text-slate-400">Only Faster.</span>
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-[#4A90E2] to-[#A855F7] bg-clip-text text-transparent">
              Claude-Powered.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-normal max-w-xl mx-auto mb-12 leading-relaxed">
            The AI writing tool that learns your voice, powered by Claude.
          </p>

          {/* Typewriter Effect with JetBrains Mono */}
          <div className="mb-12 h-10 flex items-center justify-center">
            <code className="font-mono text-sm md:text-base text-slate-400 relative">
              {loadingTexts[loadingTextIndex]}
              <span className="inline-block w-3 h-5 bg-white ml-1 align-middle animate-pulse" />
            </code>
          </div>

          <Link href="/login" className="btn-primary text-lg px-12 py-5 inline-block">
            Start Writing Free
          </Link>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="w-full py-16 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-4">Features That Matter</h2>
            <p className="text-slate-400 text-lg">Designed for professional writers who care about quality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1: Large + Small */}
            {bentoFeatures.slice(0, 2).map((feature, index) => (
              <div key={feature.title} className={`glass-card p-8 ${feature.size === "large" ? "md:col-span-1" : "md:col-span-1"}`} style={{ animationDelay: `${feature.delay}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#A855F7]/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-[#4A90E2]" />
                </div>

                <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 mb-6">{feature.description}</p>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#4A90E2] animate-pulse" />
                  <span className="text-xs text-slate-500 font-mono">active</span>
                </div>
              </div>
            ))}

            {/* Row 2: Small + Large */}
            {bentoFeatures.slice(2, 4).map((feature, index) => (
              <div key={feature.title} className={`glass-card p-8 ${feature.size === "large" ? "md:col-span-1" : "md:col-span-1"}`} style={{ animationDelay: `${feature.delay}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#A855F7]/20 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-[#4A90E2]" />
                </div>

                <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 mb-6">{feature.description}</p>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#4A90E2] animate-pulse" />
                  <span className="text-xs text-slate-500 font-mono">active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full py-16 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-4">Simple Pricing</h2>
            <p className="text-slate-400 text-lg">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div key={plan.name} className={`glass-card p-8 transition-all duration-300 ${plan.recommended ? "border-[rgba(168,85,247,0.2)]" : ""}`} style={plan.recommended ? { boxShadow: "0 0 40px rgba(168, 85, 247, 0.1)" } : {}}>
                <div className="mb-8">
                  <h3 className="text-xl font-display font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <p className="text-5xl font-display font-extrabold text-white mb-2">{plan.price}</p>
                  <p className="text-sm text-slate-400">{plan.period}</p>
                </div>

                <ul className="space-y-3 mb-10">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span className="text-sm font-mono text-[#4A90E2] mt-0.5 flex-shrink-0">{">"}</span>
                      <span className="text-slate-400 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/login" className={plan.recommended ? "btn-primary w-full text-center block" : "btn-outline w-full text-center block"}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Bottom Banner */}
      <section className="w-full py-20 md:py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at center, rgba(74,144,226,0.15) 0%, rgba(168,85,247,0.08) 30%, transparent 70%)" }} />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="glass-card p-12 md:p-16">
            <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-6">Ready to experience the future of writing?</h2>
            <p className="text-slate-400 mb-10 text-lg">Join thousands of writers already creating better content.</p>
            <Link href="/login" className="btn-primary text-lg px-16 py-5 inline-block">
              Start Writing Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full py-12 border-t border-glass-border">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">© 2026 Use AI Writer.</p>
        </div>
      </footer>
    </main>
  );
}
