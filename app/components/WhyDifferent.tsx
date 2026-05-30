"use client";

import { Check, X, Minus, Sparkles, Brain, MessageSquare } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

const features = [
  {
    name: "Brand Voice Learning",
    tryaiwriter: { value: "Digital Twin (Active Interview + Auto-Learning)", supported: true },
    jasper: { value: "Upload Document Learning", supported: true },
    copyai: { value: "", supported: false },
  },
  {
    name: "Creative Interview Engine",
    tryaiwriter: { value: "AI Proactively Asks Guiding Questions", supported: true },
    jasper: { value: "", supported: false },
    copyai: { value: "", supported: false },
  },
  {
    name: "Starting Price",
    tryaiwriter: { value: "$0 Free / $9 Pro", supported: true },
    jasper: { value: "$49/mo", supported: true },
    copyai: { value: "$29/mo", supported: true },
  },
  {
    name: "Multi-Model Support",
    tryaiwriter: { value: "DeepSeek + Claude", supported: true },
    jasper: { value: "Multiple Models", supported: true },
    copyai: { value: "Multiple Models", supported: true },
  },
  {
    name: "Free Plan",
    tryaiwriter: { value: "10 generations/day", supported: true },
    jasper: { value: "7-day trial only", supported: false },
    copyai: { value: "Limited", supported: true },
  },
  {
    name: "Document Upload",
    tryaiwriter: { value: "Supported", supported: true },
    jasper: { value: "Supported", supported: true },
    copyai: { value: "", supported: false },
  },
  {
    name: "Memory Bank",
    tryaiwriter: { value: "Persistent Knowledge Base", supported: true },
    jasper: { value: "", supported: false },
    copyai: { value: "", supported: false },
  },
  {
    name: "No Credit Card Required",
    tryaiwriter: { value: "Start instantly", supported: true },
    jasper: { value: "", supported: false },
    copyai: { value: "", supported: false },
  },
];

export function WhyDifferent() {
  return (
    <section className="section-container section-spacing">
      <ScrollReveal>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold">
            Why Creators Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Try AI Writer
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 mt-4 max-w-2xl mx-auto">
            The only AI writing tool with a Digital Twin that interviews you.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Header Row */}
            <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr] gap-4 mb-6">
              <div className="px-4 py-3">
                <span className="text-sm text-slate-500 font-medium">Feature</span>
              </div>
              <div className="px-4 py-3 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-bold text-emerald-400">Try AI Writer</span>
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <span className="text-sm font-medium text-slate-400">Jasper</span>
              </div>
              <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02]">
                <span className="text-sm font-medium text-slate-400">Copy.ai</span>
              </div>
            </div>

            {/* Feature Rows */}
            <div className="space-y-2">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr] gap-4 group"
                >
                  <div className="px-4 py-3 flex items-center">
                    <span className="text-sm text-slate-300 font-medium">{feature.name}</span>
                  </div>
                  <div className="px-4 py-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] group-hover:bg-emerald-500/[0.06] transition-colors">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-emerald-300">{feature.tryaiwriter.value}</span>
                    </div>
                  </div>
                  <div className="px-4 py-3 rounded-lg border border-white/5 bg-white/[0.01]">
                    {feature.jasper.supported ? (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-sm text-slate-400">{feature.jasper.value}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-400/50 flex-shrink-0" />
                        <span className="text-sm text-slate-600">Not available</span>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 rounded-lg border border-white/5 bg-white/[0.01]">
                    {feature.copyai.supported ? (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-sm text-slate-400">{feature.copyai.value}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-400/50 flex-shrink-0" />
                        <span className="text-sm text-slate-600">Not available</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-sm mb-4">
                Join 500+ creators who switched to Try AI Writer
              </p>
              <a href="/write" className="btn-primary inline-flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Try the Digital Twin Free
              </a>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
