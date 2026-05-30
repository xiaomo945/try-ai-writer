"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Check, SkipForward, PenTool } from "lucide-react";
import { useBrandVoice } from "@/lib/brand-voice";
import { ScrollReveal } from "./ScrollReveal";

const ONBOARDING_KEY = "onboarding_complete";

const industries = [
  { value: "technology", label: "Technology" },
  { value: "marketing", label: "Marketing" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "healthcare", label: "Healthcare" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

const tones = [
  { value: "professional", label: "Professional", description: "Formal and authoritative" },
  { value: "casual", label: "Casual", description: "Friendly and conversational" },
  { value: "bold", label: "Bold", description: "Confident and direct" },
  { value: "warm", label: "Warm", description: "Empathetic and approachable" },
  { value: "witty", label: "Witty", description: "Clever and engaging" },
];

const examplePrompts = [
  "Write a blog post about how AI is transforming content marketing",
  "Draft a professional email announcing a new product feature",
  "Create a LinkedIn post about leadership lessons learned",
  "Write a Twitter thread explaining complex tech concepts simply",
];

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const { updateProfile } = useBrandVoice();

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsVisible(false);
    onComplete?.();
  };

  const handleNext = () => {
    if (step === 2 && (industry || tone)) {
      updateProfile({
        industry,
        tone,
        audience,
        createdAt: new Date().toISOString(),
      });
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const getRandomPrompt = () => {
    return examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "w-12 bg-emerald-600" : "w-12 bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <ScrollReveal>
            <div className="text-center space-y-8">
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 mb-4">
                  Your AI Writing Partner,
                  <br />
                  <span className="text-emerald-600">Trained on Your Voice</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-lg mx-auto">
                  Try AI Writer learns your style, tone, and preferences to help you write faster and better.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleNext}
                  className="btn-primary text-lg px-10 py-5 inline-flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSkip}
                  className="text-slate-400 hover:text-slate-600 text-sm flex items-center justify-center gap-2 py-2"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip for now
                </button>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Step 2: Brand Voice Setup */}
        {step === 2 && (
          <ScrollReveal>
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-3">
                  Let&apos;s Build Your Brand Voice
                </h2>
                <p className="text-slate-500">
                  These settings help AI understand your writing style. You can always change them later.
                </p>
              </div>

              <div className="space-y-6">
                {/* Industry */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">What industry are you in?</label>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((ind) => (
                      <button
                        key={ind.value}
                        onClick={() => setIndustry(ind.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          industry === ind.value
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {ind.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">What&apos;s your preferred tone?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tones.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTone(t.value)}
                        className={`p-4 rounded-xl text-left transition-all border-2 ${
                          tone === t.value
                            ? "border-emerald-600 bg-emerald-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="font-semibold text-slate-900">{t.label}</div>
                        <div className="text-sm text-slate-500">{t.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audience */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Who is your target audience? (Optional)
                  </label>
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g., Tech-savvy professionals, Small business owners..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={handleNext}
                  className="btn-primary text-lg px-10 py-5 inline-flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="text-slate-400 hover:text-slate-600 text-sm flex items-center justify-center gap-2 py-2"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip this step
                </button>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <ScrollReveal>
            <div className="text-center space-y-8">
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-3">
                  You&apos;re All Set!
                </h2>
                <p className="text-xl text-slate-500 max-w-lg mx-auto">
                  Your AI writing partner is ready. Here&apos;s an example of what you can create:
                </p>
              </div>

              {/* Example prompt card */}
              <div className="bg-slate-50 rounded-2xl p-6 max-w-xl mx-auto">
                <div className="flex items-center gap-2 mb-3">
                  <PenTool className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-600">Example Prompt</span>
                </div>
                <p className="text-slate-800 text-left italic">&ldquo;{getRandomPrompt()}&rdquo;</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/write"
                  onClick={handleComplete}
                  className="btn-primary text-lg px-10 py-5 inline-flex items-center justify-center gap-2"
                >
                  Start Writing
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}

export function hasCompletedOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function resetOnboarding(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ONBOARDING_KEY);
}
