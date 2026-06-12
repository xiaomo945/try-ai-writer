"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useBrandVoice } from "@/lib/brand-voice";
import { Upload, Gift, Sparkles } from "lucide-react";
import { applyReferralReward } from "@/lib/referral-client";

type AnalysisState = "idle" | "uploading" | "analyzing" | "complete" | "error";

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

function ReferralRewardChecker({ onRewardFound }: { onRewardFound: (proDays: number) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { updateProfile } = useBrandVoice();

  const [industry, setIndustry] = useState("");
  const [useCase, setUseCase] = useState("");
  const [tone, setTone] = useState("");
  const [referralReward, setReferralReward] = useState<{ proDays: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session) {
      router.push("/register");
    }

    const onboardingComplete = localStorage.getItem("onboarding_complete");
    if (onboardingComplete === "true") {
      router.push("/dashboard");
    }

    const refCode = searchParams.get("ref");
    const referredBy = localStorage.getItem("referred-by");
    if (refCode && !referredBy) {
      localStorage.setItem("referred-by", refCode);
    }
  }, [session, router, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (industry && tone) {
      updateProfile({
        industry,
        tone,
        audience: useCase,
      });
    }
    
    const referredBy = localStorage.getItem("referred-by");
    if (referredBy && session?.user?.id) {
      const rewards = applyReferralReward(referredBy, session.user.id);
      if (rewards.refereeReward.extraGenerations > 0) {
        setReferralReward({ proDays: rewards.referrerReward.proDays });
      }
    }
    
    localStorage.setItem("onboarding_complete", "true");
    router.push("/dashboard");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userType", "free");

    try {
      const res = await fetch("/api/brand-voice/upload-document", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process document");
      }

      const data = await res.json();
      setIndustry(data.profile.industry);
      setTone(data.profile.tone);
      setUseCase(data.profile.audience);
      updateProfile(data.profile);
    } catch (err) {
      console.error(err);
    } finally {
      e.target.value = "";
    }
  };

  const isFormValid = industry && tone;

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {referralReward && (
        <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white shadow-lg animate-bounce-once">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 flex-shrink-0" />
            <div>
              <p className="font-semibold text-lg">🎉 邀请成功！</p>
              <p className="text-sm opacity-90">你和好友各获得 {referralReward.proDays} 天 Pro 试用！</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          📄 Quick Style Setup
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-all duration-200 cursor-pointer"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".txt,.md"
            onChange={handleFileUpload}
          />
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600">
            Upload an article you wrote
          </p>
          <p className="text-xs text-slate-400">
            AI will analyze your style and auto‑fill the form!
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          What industry do you work in?
        </label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full px-4 py-4 text-base border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-white/5 text-slate-900 dark:text-white cursor-pointer transition-all duration-200"
        >
          <option value="">Select an industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
      </div>

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
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSkip = () => {
    localStorage.setItem("onboarding_complete", "true");
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#0A0A0C] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-slate-900 mb-4">
            Let&apos;s Personalize Your AI
          </h1>
          <p className="text-lg text-slate-500">
            Just 3 questions to make your AI write like you.
          </p>
        </div>

        <Suspense fallback={<div className="animate-pulse space-y-10"><div className="h-32 bg-slate-200 rounded-xl" /><div className="h-12 bg-slate-200 rounded-xl" /><div className="h-48 bg-slate-200 rounded-xl" /></div>}>
          <ReferralRewardChecker onRewardFound={() => {}} />
        </Suspense>

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