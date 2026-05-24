"use client";

import { useState, useCallback, useEffect } from "react";

export type Tone = "formal" | "casual" | "humorous" | "professional";

export interface BrandVoiceProfile {
  tone: Tone;
  style: string;
  commonPhrases: string[];
  industry: string;
  targetAudience: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandVoiceSample {
  id: string;
  content: string;
  mode: "blog" | "email" | "social" | "custom";
  timestamp: string;
}

const STORAGE_KEY_PROFILE = "use-ai-writer-brand-profile";
const STORAGE_KEY_SAMPLES = "use-ai-writer-brand-samples";

function getToday(): string {
  return new Date().toISOString();
}

function loadProfile(): BrandVoiceProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw) as BrandVoiceProfile;
  } catch {
    return null;
  }
}

function saveProfile(profile: BrandVoiceProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

function loadSamples(): BrandVoiceSample[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAMPLES);
    if (!raw) return [];
    return JSON.parse(raw) as BrandVoiceSample[];
  } catch {
    return [];
  }
}

function saveSamples(samples: BrandVoiceSample[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_SAMPLES, JSON.stringify(samples));
  } catch {
    // ignore
  }
}

export function useBrandVoice() {
  const [profile, setProfile] = useState<BrandVoiceProfile | null>(null);
  const [samples, setSamples] = useState<BrandVoiceSample[]>([]);

  useEffect(() => {
    setProfile(loadProfile());
    setSamples(loadSamples());
  }, []);

  const updateProfile = useCallback(
    (newProfile: Partial<BrandVoiceProfile>) => {
      const now = getToday();
      let updatedProfile: BrandVoiceProfile;
      if (profile) {
        updatedProfile = { ...profile, ...newProfile, updatedAt: now };
      } else {
        updatedProfile = {
          tone: "professional",
          style: "clear and concise",
          commonPhrases: [],
          industry: "",
          targetAudience: "",
          createdAt: now,
          updatedAt: now,
          ...newProfile,
        };
      }
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    },
    [profile]
  );

  const addSample = useCallback((content: string, mode: "blog" | "email" | "social" | "custom") => {
    const sample: BrandVoiceSample = {
      id: Date.now().toString(),
      content,
      mode,
      timestamp: getToday(),
    };
    const updatedSamples = [sample, ...samples].slice(0, 50); // keep last 50 samples
    setSamples(updatedSamples);
    saveSamples(updatedSamples);
    return sample;
  }, [samples]);

  const getContextPrompt = useCallback((): string => {
    if (!profile) {
      return "";
    }
    let prompt = `You are writing in a ${profile.tone} tone. `;
    prompt += `Your style is ${profile.style}. `;
    if (profile.commonPhrases.length > 0) {
      prompt += `Common phrases: ${profile.commonPhrases.join(", ")}. `;
    }
    if (profile.industry) {
      prompt += `Industry: ${profile.industry}. `;
    }
    if (profile.targetAudience) {
      prompt += `Audience: ${profile.targetAudience}.`;
    }
    return prompt;
  }, [profile]);

  return {
    profile,
    samples,
    addSample,
    updateProfile,
    getContextPrompt,
  };
}

export function getRecentContext(
  samples: BrandVoiceSample[],
  maxTokens: number = 1000
): string {
  const recent = samples.slice(0, 3);
  if (recent.length === 0) return "";
  let context = "\n\nHere are some recent examples of your writing for reference:\n";
  recent.forEach((sample, i) => {
    context += `\nExample ${i + 1} (${sample.mode}):\n${sample.content.slice(0, 300)}\n`;
  });
  return context;
}
