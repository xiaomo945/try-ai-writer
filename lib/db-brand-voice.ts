"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
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

export function useDbBrandVoice() {
  const { data: session } = useSession();
  const [profile, setProfileState] = useState<BrandVoiceProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [samples, setSamples] = useState<string[]>([]);

  // 从数据库加载品牌声音
  const loadProfile = useCallback(async () => {
    if (!session?.user?.email) {
      setIsLoaded(true);
      return;
    }

    try {
      const res = await fetch("/api/user/brand-voice");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfileState(data.profile);
        }
      }
    } catch (error) {
      console.error("Failed to load brand voice:", error);
    } finally {
      setIsLoaded(true);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // 更新品牌声音到数据库
  const updateProfile = useCallback(async (updates: Partial<BrandVoiceProfile>) => {
    if (!session?.user?.email) return;

    const current = profile;
    const updated: BrandVoiceProfile = {
      industry: current?.industry ?? "",
      tone: current?.tone ?? "",
      audience: current?.audience ?? "",
      commonPhrases: current?.commonPhrases ?? [],
      createdAt: current?.createdAt ?? new Date().toISOString(),
      ...updates,
    };

    try {
      const res = await fetch("/api/user/brand-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfileState(data.profile);
        }
      }
    } catch (error) {
      console.error("Failed to update brand voice:", error);
    }
  }, [session?.user?.email, profile]);

  // 添加样本并更新风格指纹
  const addSampleAndUpdateFingerprint = useCallback(async (sample: string) => {
    if (!sample.trim() || !session?.user?.email) return;

    const newSamples = [...samples, sample.trim()].slice(-50);
    setSamples(newSamples);

    const current = profile;
    
    if (newSamples.length >= 3) {
      const fingerprint = analyzeStyleFingerprint(newSamples);
      const updated: BrandVoiceProfile = {
        industry: current?.industry ?? "",
        tone: current?.tone ?? "",
        audience: current?.audience ?? "",
        commonPhrases: current?.commonPhrases ?? [],
        createdAt: current?.createdAt ?? new Date().toISOString(),
        learningSamples: newSamples.length,
        styleFingerprint: fingerprint,
      };

      try {
        const res = await fetch("/api/user/brand-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfileState(data.profile);
          }
        }
      } catch (error) {
        console.error("Failed to update brand voice with fingerprint:", error);
      }
    } else {
      const updated: BrandVoiceProfile = {
        industry: current?.industry ?? "",
        tone: current?.tone ?? "",
        audience: current?.audience ?? "",
        commonPhrases: current?.commonPhrases ?? [],
        createdAt: current?.createdAt ?? new Date().toISOString(),
        learningSamples: newSamples.length,
      };

      try {
        await fetch("/api/user/brand-voice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        setProfileState(updated);
      } catch (error) {
        console.error("Failed to update brand voice samples:", error);
      }
    }
  }, [session?.user?.email, samples, profile]);

  // 清空品牌声音
  const clearProfile = useCallback(async () => {
    if (!session?.user?.email) return;

    try {
      await fetch("/api/user/brand-voice", {
        method: "DELETE",
      });
      setProfileState(null);
      setSamples([]);
    } catch (error) {
      console.error("Failed to clear brand voice:", error);
    }
  }, [session?.user?.email]);

  const hasProfile = !!profile && (profile.industry || profile.tone);

  const getSamplesNeeded = useCallback((): number => {
    return Math.max(0, 3 - samples.length);
  }, [samples.length]);

  return {
    profile,
    isLoaded,
    hasProfile,
    updateProfile,
    addSampleAndUpdateFingerprint,
    clearProfile,
    getSamplesNeeded,
    refresh: loadProfile,
  };
}
