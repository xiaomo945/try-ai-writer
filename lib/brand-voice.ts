"use client";

import { useState, useCallback, useEffect } from "react";

export interface BrandVoiceProfile {
  industry: string;
  tone: string;
  audience: string;
  commonPhrases: string[];
  createdAt: string;
  learningSamples?: number;
}

const STORAGE_KEY = "use-ai-writer-brand-profile";

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

  const clearProfile = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    setProfileState(null);
  }, []);

  const hasProfile = !!profile && (profile.industry || profile.tone);

  return {
    profile,
    isLoaded,
    hasProfile,
    updateProfile,
    clearProfile,
  };
}
