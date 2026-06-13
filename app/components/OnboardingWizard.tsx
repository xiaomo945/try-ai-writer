"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Check, SkipForward, PenTool } from "lucide-react";
import { useBrandVoice } from "@/lib/brand-voice";

const ONBOARDING_KEY = "onboarding_complete";

const industries = [
  { value: "technology", label: "Technology" },
  { value: "marketing", label: "Marketing" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "other", label: "Other" },
];

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "bold", label: "Bold" },
  { value: "warm", label: "Warm" },
];

const examplePrompts = [
  "Write a blog post about how AI is transforming content marketing",
  "Draft a professional email announcing a new product feature",
  "Create a LinkedIn post about leadership lessons learned",
];

interface OnboardingWizardProps {
  onComplete?: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const { updateProfile } = useBrandVoice();

  const handleSkip = () => {
    if (typeof window !== "undefined") localStorage.setItem(ONBOARDING_KEY, "true");
    onComplete?.();
  };

  const handleComplete = () => {
    if (typeof window !== "undefined") localStorage.setItem(ONBOARDING_KEY, "true");
    onComplete?.();
  };

  const handleNext = () => {
    if (step === 2) {
      updateProfile({
        industry: industry || undefined,
        tone: tone || undefined,
        audience: audience || undefined,
        createdAt: new Date().toISOString(),
      });
    }
    if (step < 3) setStep(step + 1);
  };

  const [randomPrompt] = useState(
    () => examplePrompts[Math.floor(Math.random() * examplePrompts.length)]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-obsidian-950 p-4 overflow-y-auto">
      <div className="w-full max-w-2xl py-6 sm:py-12">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "w-12 bg-gradient-to-r from-emerald-500 to-teal-400" : "w-12 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome — compact, all visible, no scrolling needed */}
        {step === 1 && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-3">
                Your AI Writing Partner,
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Trained on Your Voice
                </span>
              </h1>
              <p className="text-base text-gray-400 max-w-lg mx-auto">
                Try AI Writer learns your style, tone, and preferences to help you write faster and better.
              </p>
            </div>

            {/* Quick feature preview so user sees value immediately */}
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
              {[
                { icon: "✍️", text: "Blog posts" },
                { icon: "📧", text: "Emails" },
                { icon: "📱", text: "Social posts" },
              ].map((f) => (
                <div
                  key={f.text}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
                >
                  <div className="text-xl mb-1">{f.icon}</div>
                  <div className="text-xs text-gray-400">{f.text}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleNext}
                className="btn-primary text-base px-8 py-3.5 inline-flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-white text-sm flex items-center justify-center gap-2 py-2 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Brand Voice Setup */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white mb-2">
                Build Your Brand Voice
              </h2>
              <p className="text-sm text-gray-400">Help AI understand your style. You can change these later.</p>
            </div>

            <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-5">
              {/* Industry */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  What industry are you in?
                </label>
                <div className="flex flex-wrap gap-2">
                  {industries.map((ind) => (
                    <button
                      key={ind.value}
                      onClick={() => setIndustry(ind.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        industry === ind.value
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {ind.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Preferred tone?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {tones.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={`p-3 rounded-xl text-left transition-all border-2 ${
                        tone === t.value
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-white/10 hover:border-white/20 bg-white/3"
                      }`}
                    >
                      <div className="font-semibold text-white text-sm">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Target audience? <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g., Tech professionals, Small business owners..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={handleNext}
                className="btn-primary text-base px-8 py-3.5 inline-flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="text-gray-500 hover:text-white text-sm flex items-center justify-center gap-2 py-2 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                Skip this step
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Complete — compact */}
        {step === 3 && (
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <Check className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white mb-2">
                You&apos;re All Set!
              </h2>
              <p className="text-sm text-gray-400 max-w-lg mx-auto">
                Your AI writing partner is ready. Try your first creation:
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-gray-400">Example prompt</span>
              </div>
              <p className="text-gray-300 text-left italic text-sm">&ldquo;{randomPrompt}&rdquo;</p>
            </div>

            <Link
              href="/write"
              onClick={handleComplete}
              className="btn-primary text-base px-8 py-3.5 inline-flex items-center justify-center gap-2"
            >
              Start Writing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
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
