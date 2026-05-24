"use client";

import { useState, useCallback, useEffect } from "react";
import {
  loadProfileFromStorage,
  saveProfileToStorage,
  loadSamplesFromStorage,
  saveSamplesToStorage,
  loadViewpointsFromStorage,
  saveViewpointsToStorage,
  createDefaultProfile,
  getContextPromptFromProfile,
  getToday,
  BrandVoiceProfile,
  BrandVoiceSample,
  KeyViewPoint
} from "./brand-voice-shared";

export { getContextPromptFromProfile as getContextPromptFromProfile };
export type { Tone, BrandVoiceProfile, BrandVoiceSample, KeyViewPoint } from "./brand-voice-shared";

export function useBrandVoice() {
  const [profile, setProfile] = useState<BrandVoiceProfile | null>(null);
  const [samples, setSamples] = useState<BrandVoiceSample[]>([]);
  const [viewpoints, setViewpoints] = useState<KeyViewPoint[]>([]);

  useEffect(() => {
    setProfile(loadProfileFromStorage());
    setSamples(loadSamplesFromStorage());
    setViewpoints(loadViewpointsFromStorage());
  }, []);

  const updateProfile = useCallback(
    (newProfile: Partial<BrandVoiceProfile>) => {
      const today = getToday();
      let updatedProfile: BrandVoiceProfile;
      if (profile) {
        updatedProfile = { ...profile, ...newProfile, updatedAt: today };
      } else {
        updatedProfile = createDefaultProfile(newProfile);
      }
      setProfile(updatedProfile);
      saveProfileToStorage(updatedProfile);
    },
    [profile]
  );

  const addSample = useCallback((content: string, mode: "blog" | "email" | "social" | "custom", keyPoints: string[] = []) => {
    const sample: BrandVoiceSample = {
      id: Date.now().toString(),
      content,
      mode,
      timestamp: getToday(),
      keyPoints,
    };
    const updatedSamples = [sample, ...samples].slice(0, 50); // keep last 50 samples
    setSamples(updatedSamples);
    saveSamplesToStorage(updatedSamples);
    
    // Add new viewpoints
    const newViewpoints = keyPoints.map((text, i) => ({
      id: `${sample.id}-${i}`,
      text,
      sourceSampleId: sample.id,
      sourceSampleTitle: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
    }));
    const allViewpoints = [...newViewpoints, ...viewpoints].slice(0, 50); // keep last 50 viewpoints
    setViewpoints(allViewpoints);
    saveViewpointsToStorage(allViewpoints);
    return sample;
  }, [samples, viewpoints]);

  const getContextPrompt = useCallback((): string => {
    if (!profile) {
      return "";
    }
    return getContextPromptFromProfile(profile);
  }, [profile]);

  return {
    profile,
    samples,
    viewpoints,
    addSample,
    updateProfile,
    getContextPrompt,
  };
}
