"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBrandVoice } from "@/lib/brand-voice";

const INDUSTRIES = [
  "Technology & SaaS",
  "Marketing & Advertising",
  "E-commerce & Retail",
  "Education & Research",
  "Finance & Banking",
  "Healthcare & Wellness",
  "Media & Publishing",
  "Other",
];

const USE_CASES = [
  { id: "blog", label: "Blog Posts & Articles" },
  { id: "email", label: "Email & Newsletters" },
  { id: "social", label: "Social Media Content" },
  { id: "creative", label: "Creative Writing & Stories" },
  { id: "business", label: "Business & Reports" },
  { id: "academic", label: "Academic & Research" },
];

const TONES = [
  { id: "professional", label: "Professional & Polished", emoji: "📊" },
  { id: "casual", label: "Casual & Friendly", emoji: "💬" },
  { id: "bold", label: "Bold & Provocative", emoji: "🔥" },
  { id: "warm", label: "Warm & Empathetic", emoji: "💚" },
  { id: "minimalist", label: "Minimalist & Direct", emoji: "✏️" },
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { updateProfile } = useBrandVoice();

  const [industry, setIndustry] = useState("");
  const [useCase, setUseCase] = useState("");
  const [tone, setTone] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/register");
    }

    const onboardingComplete = localStorage.getItem("onboarding_complete");
    if (onboardingComplete === "true") {
      router.push("/dashboard");
    }
  }, [session, router]);

  const handleSkip = () => {
    localStorage.setItem("onboarding_complete", "true");
    router.push("/dashboard");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (industry && tone) {
      updateProfile({
        industry,
        tone,
        audience: useCase,
      });
    }
    
    localStorage.setItem("onboarding_complete", "true");
    router.push("/dashboard");
  };

  const isFormValid = industry && tone;

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-4">
            Let&apos;s Personalize Your AI
          </h1>
          <p className="text-lg text-slate-500">
            Just 3 questions to make your AI write like you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Industry */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              What industry do you work in?
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-4 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white cursor-pointer transition-all duration-200"
            >
              <option value="">Select an industry</option>
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Use Case */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              What do you primarily write?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {USE_CASES.map((uc) => (
                <button
                  key={uc.id}
                  type="button"
                  onClick={() => setUseCase(uc.id)}
                  className={`px-4 py-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    useCase === uc.id
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        useCase === uc.id
                          ? "border-emerald-500 bg-emerald-500"
                          : "border-slate-300"
                      }`}
                    >
                      {useCase === uc.id && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            d="M2 6l3 3 7-7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{uc.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Preference */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              What tone do you prefer?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`px-4 py-5 text-center rounded-xl border-2 transition-all duration-200 ${
                    tone === t.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-2xl mb-2">{t.emoji}</div>
                  <span
                    className={`text-sm font-medium ${
                      tone === t.id ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-4 text-lg font-semibold rounded-xl transition-all duration-200 ${
              isFormValid
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            Start Writing
          </button>
        </form>

        <div className="text-center mt-8">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors duration-200"
          >
            Skip for now
          </button>
        </div>
      </div>
    </main>
  );
}