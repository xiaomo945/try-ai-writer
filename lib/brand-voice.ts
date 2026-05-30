"use client";

import { useState, useCallback, useEffect } from "react";
import { analyzeStyleFingerprint, type StyleFingerprint, DEFAULT_FINGERPRINT, getFingerprintSummary } from "./style-fingerprint";

export interface BrandVoiceProfile {
  industry: string;
  tone: string;
  audience: string;
  commonPhrases: string[];
  createdAt: string;
  learningSamples?: number;
  styleFingerprint?: StyleFingerprint;
}

const STORAGE_KEY = "use-ai-writer-brand-profile";
const SAMPLES_KEY = "use-ai-writer-brand-samples";

function readProfile(): BrandVoiceProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BrandVoiceProfile;
  } catch {
    return null;
  }
}

function writeProfile(profile: BrandVoiceProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // storage full or unavailable
  }
}

function readSamples(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAMPLES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function writeSamples(samples: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples.slice(-50)));
  } catch {
    // storage full
  }
}

export function useBrandVoice() {
  const [profile, setProfileState] = useState<BrandVoiceProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const data = readProfile();
    setProfileState(data);
    setIsLoaded(true);
  }, []);

  const updateProfile = useCallback((updates: Partial<BrandVoiceProfile>) => {
    const current = readProfile();
    const updated: BrandVoiceProfile = {
      industry: current?.industry ?? "",
      tone: current?.tone ?? "",
      audience: current?.audience ?? "",
      commonPhrases: current?.commonPhrases ?? [],
      createdAt: current?.createdAt ?? new Date().toISOString(),
      ...updates,
    };
    writeProfile(updated);
    setProfileState(updated);
  }, []);

  const addSampleAndUpdateFingerprint = useCallback((sample: string) => {
    if (!sample.trim()) return;

    const samples = readSamples();
    samples.push(sample.trim());
    writeSamples(samples);

    const current = readProfile();
    if (samples.length >= 3) {
      const fingerprint = analyzeStyleFingerprint(samples);
      const updated: BrandVoiceProfile = {
        industry: current?.industry ?? "",
        tone: current?.tone ?? "",
        audience: current?.audience ?? "",
        commonPhrases: current?.commonPhrases ?? [],
        createdAt: current?.createdAt ?? new Date().toISOString(),
        learningSamples: samples.length,
        styleFingerprint: fingerprint,
      };
      writeProfile(updated);
      setProfileState(updated);
    } else {
      const updated: BrandVoiceProfile = {
        industry: current?.industry ?? "",
        tone: current?.tone ?? "",
        audience: current?.audience ?? "",
        commonPhrases: current?.commonPhrases ?? [],
        createdAt: current?.createdAt ?? new Date().toISOString(),
        learningSamples: samples.length,
      };
      writeProfile(updated);
      setProfileState(updated);
    }
  }, []);

  const clearProfile = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SAMPLES_KEY);
    setProfileState(null);
  }, []);

  const hasProfile = !!profile && (profile.industry || profile.tone);

  const getSamplesNeeded = useCallback((): number => {
    const samples = readSamples();
    return Math.max(0, 3 - samples.length);
  }, []);

  return {
    profile,
    isLoaded,
    hasProfile,
    updateProfile,
    addSampleAndUpdateFingerprint,
    clearProfile,
    getSamplesNeeded,
  };
}

export function getBrandVoiceContextPrompt(profile: BrandVoiceProfile | null): string {
  if (!profile) return "";

  const parts: string[] = [];

  if (profile.industry) {
    parts.push(`行业：${profile.industry}`);
  }
  if (profile.tone) {
    parts.push(`语气风格：${profile.tone}`);
  }
  if (profile.audience) {
    parts.push(`目标受众：${profile.audience}`);
  }
  if (profile.commonPhrases && profile.commonPhrases.length > 0) {
    parts.push(`常用表达：${profile.commonPhrases.slice(0, 5).join("、")}`);
  }

  if (profile.styleFingerprint && profile.styleFingerprint.sampleCount >= 3) {
    const fp = profile.styleFingerprint;
    const summary = getFingerprintSummary(fp);
    parts.push(`写作习惯：${summary}`);
  }

  return parts.length > 0 ? `品牌声音档案：${parts.join("；")}` : "";
}

export { type StyleFingerprint, DEFAULT_FINGERPRINT, getFingerprintSummary };
