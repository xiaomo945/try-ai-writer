"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Zap, Clock, FileText, ChevronDown, Trash2, Sparkles, BookOpen, Brain, Upload, X, Palette, Users, Copy, Share2, TrendingUp, BarChart3, Fingerprint } from "lucide-react";
import { useHistory } from "@/lib/history";
import { useUsage } from "@/lib/usage";
import { useBrandVoice, type BrandVoiceProfile } from "@/lib/brand-voice";
import { useMemoryBank, type MemoryItem } from "@/lib/memory-bank";
import { useCredits } from "@/lib/credits";
import { OnboardingWizard } from "@/app/components/OnboardingWizard";
import { WeeklyInsightCard } from "@/app/components/WeeklyInsightCard";
import { getWeeklyInsights } from "@/lib/weekly-insights";
import { DigitalTwinAvatar, type AvatarVariant } from "@/app/components/DigitalTwinAvatar";
import { useAvatarVariant, generateAvatarFromDescription } from "@/lib/avatar-variant";
import { ReferralShare } from "@/app/components/ReferralShare";
import { LearningTimeline } from "@/app/components/LearningTimeline";
import { WritingStats } from "@/app/components/WritingStats";
import { initializeReferral, getReferralLink, REFERRAL_REWARDS, checkPendingReferralRewards, clearPendingReferralRewards } from "@/lib/referral-client";
import { NavWrapper } from "@/app/components/NavWrapper";
import { Gift } from "lucide-react";
import { generateWeeklyStyleReport, type WeeklyStyleReport } from "@/lib/weekly-style-report";
import { type StyleFingerprint, DEFAULT_FINGERPRINT } from "@/lib/style-fingerprint";
import { getCommunityWorkflows, publishWorkflow, unpublishWorkflow, isWorkflowPublished, type WorkflowDefinition } from "@/lib/workflows";

type WritingMode = "blog" | "email" | "social" | "custom";

interface DemoSample {
  id: string;
  title: string;
  excerpt: string;
  tags: string[];
  date: string;
  wordCount: number;
}

interface DemoProfile {
  tone: {
    formality: number;
    sentiment: "positive" | "neutral" | "negative";
    pace: "fast" | "moderate" | "slow";
  };
  industry: string;
  commonPhrases: string[];
  avgSentenceLength: number;
  avgParagraphLength: number;
  vocabularyStyle: string[];
}

interface DemoData {
  generatedAt: string;
  profile: DemoProfile;
  samples: DemoSample[];
  styleMatchScore: {
    overall: number;
    tone: number;
    vocabulary: number;
    structure: number;
  };
}

function getRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function getWordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function BrandVoiceDemoCard({ demoData }: { demoData: DemoData }) {
  const { profile, styleMatchScore } = demoData;

  return (
    <div className="glass-card bg-white/[0.03] dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-900 dark:text-white">Demo Brand Voice</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Generated from our blog content</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Industry & Tone */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white/[0.03] dark:bg-white/[0.03] rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-gray-800">
            {profile.industry}
          </span>
          <span className="px-3 py-1 bg-emerald-100/60 dark:bg-emerald-900/30 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {profile.tone.sentiment} tone
          </span>
          <span className="px-3 py-1 bg-white/[0.03] dark:bg-white/[0.03] rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-gray-800">
            {profile.tone.pace} pace
          </span>
        </div>

        {/* Style Match Score */}
        <div className="bg-white/[0.03] dark:bg-white/[0.03] rounded-xl p-4 border border-slate-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Style Match Score</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{styleMatchScore.overall}%</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-lg p-2">
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">{styleMatchScore.tone}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Tone</div>
            </div>
            <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-lg p-2">
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">{styleMatchScore.vocabulary}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Vocab</div>
            </div>
            <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-lg p-2">
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">{styleMatchScore.structure}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Structure</div>
            </div>
          </div>
        </div>

        {/* Common Phrases */}
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Common Phrases</div>
          <div className="flex flex-wrap gap-1">
            {profile.commonPhrases.slice(0,6).map((phrase, i) => (
              <span key={i} className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                {phrase}
              </span>
            ))}
          </div>
        </div>

        {/* Sample Articles */}
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Sample Articles</div>
          <div className="space-y-2">
            {demoData.samples.slice(0,3).map((sample) => (
              <div key={sample.id} className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{sample.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{sample.wordCount} words</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            This is a demo profile based on our blog content. Start writing to create your own brand voice.
          </p>
          <Link href="/write" className="btn-primary w-full text-center text-sm">
            Start Writing
          </Link>
        </div>
      </div>
    </div>
  );
}

function LearningProgressRing({ progress }: { progress: number }) {
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (progress / 20) * circumference;
  const gradientColor = progress < 10 
    ? `rgb(${100 + progress * 10}, ${115 + progress * 5}, ${128 + progress * 5})`
    : `rgb(${16 + progress * 4}, ${150 + progress * 2}, ${105 + progress * 2})`;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="6"
          fill="none"
          className="text-slate-200 dark:text-gray-800"
        />
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke={gradientColor}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-bold text-slate-900 dark:text-white">{progress}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">/20</span>
      </div>
    </div>
  );
}

function BrandVoiceCard({ records }: { records: Array<{ id: string; title: string; mode: string; result: string; createdAt: string }> }) {
  const { profile, updateProfile } = useBrandVoice();
  const { variant, setVariant } = useAvatarVariant();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [avatarDescription, setAvatarDescription] = useState('');
  const learningProgress = profile?.learningSamples || 3;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState('uploading');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userType', 'free');
    try {
      const res = await fetch('/api/brand-voice/upload-document', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      const data = await res.json();
      updateProfile(data.profile);
      setUploadState('success');
      setTimeout(() => setUploadState('idle'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      setUploadState('error');
    } finally {
      e.target.value = '';
    }
  };

  if (!profile) {
    return (
      <div className="card border-2 border-dashed border-emerald-300 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/30 dark:to-gray-900">
        <div className="flex flex-col items-center text-center p-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">打造你的数字分身</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            AI会学习你的写作风格，越用越懂你
          </p>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-emerald-300 bg-emerald-50/30 dark:bg-emerald-900/20 rounded-xl p-4 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all"
          >
            <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md" onChange={handleFileUpload} />
            <Upload className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">上传一篇你的文章</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">让AI学习你的风格 →</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="brand-voice" className="glass-card border-l-4 border-emerald-500/30">
      <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-slate-900 dark:text-white">Your Brand Voice</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Built from your writing style</p>
          </div>
          <button
            onClick={() => setShowCustomizationModal(true)}
            className="btn-outline text-xs px-3 py-2 min-h-[40px]"
          >
            <Palette className="w-4 h-4" /> Customize
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-outline text-xs px-3 py-2 min-h-[40px]"
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.md" onChange={handleFileUpload} />
        </div>
        {/* Customization Modal */}
        {showCustomizationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-2xl shadow-xl max-w-md w-full p-6 relative">
              <button 
                onClick={() => setShowCustomizationModal(false)} 
                className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">
                🎨 Customize Your Digital Twin
              </h2>

              {/* AI Generation Section (Coming Soon) */}
              <div className="mb-6 p-4 bg-white/[0.03] dark:bg-white/[0.05] rounded-xl">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Generate with AI (Coming Soon)
                </h3>
                <textarea
                  value={avatarDescription}
                  onChange={(e) => setAvatarDescription(e.target.value)}
                  placeholder="Describe how you want your digital twin to look..."
                  className="w-full p-3 border border-slate-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-slate-900 dark:text-white resize-none"
                  disabled
                />
                <button
                  disabled
                  className="mt-2 w-full btn-primary opacity-50 cursor-not-allowed"
                >
                  🔮 Generate Avatar
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  AI-powered avatar generation is coming soon!
                </p>
              </div>

              {/* Preset Selection */}
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
                  Choose a Preset
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['default', 'minimal', 'cute'] as AvatarVariant[]).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setVariant(preset)}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        variant === preset
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                          : 'border-slate-200 dark:border-gray-800 hover:border-emerald-300'
                      }`}
                    >
                      <div className="w-16 h-16 flex items-center justify-center">
                        <DigitalTwinAvatar 
                          isVisible={true} 
                          state="idle"
                          variant={preset} 
                        />
                      </div>
                      <span className="text-sm capitalize font-medium text-slate-700 dark:text-slate-300">
                        {preset}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      {uploadState === 'success' && (
        <div className="text-emerald-700 text-sm bg-emerald-100 rounded px-3 py-2 mb-4">
          ✨ Updated your brand voice!
        </div>
      )}
      {uploadState === 'error' && (
        <div className="text-red-700 text-sm bg-red-100 rounded px-3 py-2 mb-4">
          ❌ {error}
        </div>
      )}
      
      <div className="flex items-center gap-4 mb-4 p-3 bg-white/[0.03] dark:bg-white/[0.05] rounded-xl">
        <LearningProgressRing progress={learningProgress} />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            AI已学习你的 <span className="text-emerald-600 font-bold">{learningProgress}</span> 个写作习惯
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            继续写作，目标：20个样本
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white/[0.03] dark:bg-white/[0.05] rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-gray-800">
            {profile.industry}
          </span>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {profile.tone} tone
          </span>
          <span className="px-3 py-1 bg-white/[0.03] dark:bg-white/[0.05] rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-gray-800">
            {profile.audience} audience
          </span>
        </div>
        {profile.commonPhrases.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Common Phrases</p>
            <div className="flex flex-wrap gap-1">
              {profile.commonPhrases.slice(0, 8).map((phrase, i) => (
                <span key={i} className="px-2 py-1 bg-white/[0.03] dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 text-xs rounded-full border border-slate-200 dark:border-gray-800">
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {records.length > 0 && (
        <div className="mt-4">
          <LearningTimeline />
        </div>
      )}
    </div>
  );
}

function StyleFingerprintCard({ profile }: { profile: BrandVoiceProfile | null }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fingerprint = profile?.styleFingerprint;
  const samplesNeeded = profile?.learningSamples ? Math.max(0, 3 - profile.learningSamples) : 3;

  if (!fingerprint || fingerprint.sampleCount < 3) {
    return (
      <div className="glass-card p-6 border-l-4 border-emerald-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <Fingerprint className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Writing Style Fingerprint</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI is learning your style</p>
          </div>
        </div>
        <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Fingerprint className="w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            AI is learning your style. Write {samplesNeeded} more piece{samplesNeeded !== 1 ? "s" : ""} to generate your fingerprint report.
          </p>
          <div className="mt-3 w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((profile?.learningSamples || 0) / 3) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border-l-4 border-emerald-500/30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <Fingerprint className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Writing Style Fingerprint</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{fingerprint.sampleCount} samples analyzed</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-4">
          {/* Sentence Length Distribution */}
          <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-xl p-4">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Sentence Length Preference</div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 dark:text-slate-400 w-16">Short</span>
                <div className="flex-1 bg-slate-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${fingerprint.sentenceLengthDistribution.short}%` }} />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{fingerprint.sentenceLengthDistribution.short}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 dark:text-slate-400 w-16">Medium</span>
                <div className="flex-1 bg-slate-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${fingerprint.sentenceLengthDistribution.medium}%` }} />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{fingerprint.sentenceLengthDistribution.medium}%</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-600 dark:text-slate-400 w-16">Long</span>
                <div className="flex-1 bg-slate-200 dark:bg-gray-700 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${fingerprint.sentenceLengthDistribution.long}%` }} />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 w-10 text-right">{fingerprint.sentenceLengthDistribution.long}%</span>
              </div>
            </div>
          </div>

          {/* Transition Words */}
          {fingerprint.commonTransitionWords.length > 0 && (
            <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-xl p-4">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Common Transition Words</div>
              <div className="flex flex-wrap gap-2">
                {fingerprint.commonTransitionWords.map((word, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full font-medium">
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Passive Voice Rate */}
          <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Passive Voice Usage</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{Math.round(fingerprint.passiveVoiceRate * 100)}%</span>
            </div>
            <div className="mt-2 w-full bg-slate-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${fingerprint.passiveVoiceRate > 0.3 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${Math.min(100, fingerprint.passiveVoiceRate * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WeeklyEvolutionCard({ profile, memories }: { profile: BrandVoiceProfile | null; memories: MemoryItem[] }) {
  const [report, setReport] = useState<WeeklyStyleReport | null>(null);

  useEffect(() => {
    if (!profile || memories.length === 0) return;
    try {
      const matcherProfile = {
        tone: {
          formality: 0.5,
          sentiment: "neutral" as const,
          pace: "moderate" as const,
        },
        commonPhrases: profile.commonPhrases || [],
        avgSentenceLength: profile.styleFingerprint?.avgSentenceLength || 15,
        avgParagraphLength: profile.styleFingerprint?.avgParagraphSentenceCount || 4,
        industryTerms: [],
      };
      const r = generateWeeklyStyleReport(memories, matcherProfile, profile.styleFingerprint);
      setReport(r);
    } catch {
      // report generation failed silently
    }
  }, [profile, memories]);

  if (!report) {
    return (
      <div className="glass-card p-6 border-l-4 border-emerald-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Weekly Evolution Report</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Start writing to get your first report</p>
          </div>
        </div>
        <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-xl p-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Start writing to get your first evolution report ✨
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border-l-4 border-emerald-500/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Weekly Evolution Report</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your style growth this week</p>
        </div>
      </div>

      {/* Evolution Summary */}
      <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-xl p-4 mb-4">
        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200 leading-relaxed">
          {report.evolutionSummary}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* New Samples */}
        <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-xl p-3 text-center">
          <div className="text-2xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">{report.newSamplesCount}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">New Samples</div>
        </div>

        {/* Style Match Change */}
        <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">{report.styleMatchChange.current}%</span>
            {report.styleMatchChange.direction === "up" && <TrendingUp className="w-4 h-4 text-emerald-500" />}
            {report.styleMatchChange.direction === "down" && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Style Match</div>
        </div>
      </div>

      {/* Top Keywords */}
      {report.topKeywords.length > 0 && (
        <div className="mt-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Top Keywords This Week</div>
          <div className="flex flex-wrap gap-2">
            {report.topKeywords.map((keyword, i) => (
              <span key={i} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full font-medium">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { records, deleteRecord, clearAll } = useHistory();
  const { 
    used, 
    limit, 
    claudeUsed, 
    claudeLimit, 
    deepseekUsed, 
    deepseekLimit, 
    planName, 
    getWeeklyStats, 
    selectedModel, 
    isProUser 
  } = useUsage();
  const { balance } = useCredits();
  const { hasProfile, isLoaded, profile } = useBrandVoice();
  const { memories, deleteMemory } = useMemoryBank();
  const [expanded, setExpanded] = useState(false);
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [referralData, setReferralData] = useState<any>(null);
  const [referralLinkCopied, setReferralLinkCopied] = useState(false);
  const [referralRewardNotification, setReferralRewardNotification] = useState<{ type: 'referee'; extraGenerations: number } | { type: 'referrer'; proDays: number } | null>(null);
  const [communityWorkflows, setCommunityWorkflows] = useState<WorkflowDefinition[]>([]);
  const [publishedIds, setPublishedIds] = useState<Set<string>>(new Set());
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const [userStage, setUserStage] = useState(0); // Default to stage 0

  const visibleRecords = expanded ? records : records.slice(0, 5);

  const totalWords = records.reduce((sum, r) => sum + getWordCount(r.result), 0);
  const avgWords = records.length > 0 ? Math.round(totalWords / records.length) : 0;

  const weeklyStats = useMemo(() => {
    if (typeof window !== 'undefined') {
      return getWeeklyStats();
    }
    return { thisWeekCount: 0, lastWeekCount: 0 };
  }, [records, getWeeklyStats]);

  const insights = useMemo(() => {
    return getWeeklyInsights(records, memories, weeklyStats);
  }, [records, memories, weeklyStats]);

  const referralsCount = referralData?.referrals?.length || 0;
  const referralProgress = Math.min((referralsCount / REFERRAL_REWARDS.milestone.threshold) * 100, 100);

  const copyReferralLink = async () => {
    if (referralData) {
      const link = getReferralLink(referralData.referralCode);
      await navigator.clipboard.writeText(link);
      setReferralLinkCopied(true);
      setTimeout(() => setReferralLinkCopied(false), 1500);
    }
  };

  const dismissReferralPopup = () => {
    setShowReferralPopup(false);
    localStorage.setItem('referral_shown', 'true');
  };

  const handlePublishWorkflow = (workflow: WorkflowDefinition) => {
    publishWorkflow(workflow);
    setPublishedIds(prev => new Set([...prev, workflow.id]));
    setCommunityWorkflows(getCommunityWorkflows());
  };

  const handleUnpublishWorkflow = (workflowId: string) => {
    unpublishWorkflow(workflowId);
    setPublishedIds(prev => {
      const next = new Set(prev);
      next.delete(workflowId);
      return next;
    });
    setCommunityWorkflows(getCommunityWorkflows());
  };

  // Set registration time and calculate user stage in useEffect
  useEffect(() => {
    // Set registration time if not exists
    if (!localStorage.getItem('registered_at')) {
      localStorage.setItem('registered_at', Date.now().toString());
    }
    // Calculate user stage
    const registeredAt = localStorage.getItem('registered_at');
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const isNewUser = !registeredAt || (now - parseInt(registeredAt, 10)) < oneDayMs;

    let stage = 0;
    if (isNewUser && records.length === 0) stage = 0;
    else if (records.length >= 1 && records.length < 10) stage = 1;
    else if (records.length >= 10 && records.length < 50) stage = 2;
    else stage = 3;

    setUserStage(stage);
  }, [records.length]);

  useEffect(() => {
    // Load demo data
    fetch('/demo/brand-voice-samples.json')
      .then(res => res.json())
      .then(data => setDemoData(data))
      .catch(() => setDemoData(null));
    
    // Check onboarding status based on whether user has a brand voice profile
    if (isLoaded) {
      setShowOnboarding(!hasProfile);
    }

    // Load referral data
    const data = initializeReferral();
    setReferralData(data);

    // Check for pending referral rewards
    const pendingRewards = checkPendingReferralRewards();
    if (pendingRewards.hasRefereeReward && pendingRewards.refereeRewardData) {
      setReferralRewardNotification({
        type: 'referee',
        extraGenerations: pendingRewards.refereeRewardData.extraGenerations,
      });
      // Clear after showing
      clearPendingReferralRewards();
    } else if (pendingRewards.hasReferrerReward && pendingRewards.referrerRewardData) {
      setReferralRewardNotification({
        type: 'referrer',
        proDays: pendingRewards.referrerRewardData.proDays,
      });
      // Clear after showing
      clearPendingReferralRewards();
    }
  }, [isLoaded, hasProfile]);

  useEffect(() => {
    setCommunityWorkflows(getCommunityWorkflows());
    const published = getCommunityWorkflows();
    setPublishedIds(new Set(published.map(w => w.id)));
  }, []);

  const hasRealData = records.length > 0;

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-gradient-to-b dark:from-obsidian-950 dark:via-obsidian-900 dark:to-obsidian-950 text-slate-900 dark:text-white">
      {/* Onboarding Wizard */}
      {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} />}
      
      {/* Referral Popup (Manual Trigger) */}
      {showReferralPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowReferralPopup(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">
                邀请好友一起写作
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                邀请好友，双方各得3天Pro体验
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  copyReferralLink();
                  // 复制后关闭弹窗
                  setTimeout(() => setShowReferralPopup(false), 1500);
                }}
                className="w-full btn-primary min-h-[48px] flex items-center justify-center gap-2 text-base"
              >
                {referralLinkCopied ? (
                  <>
                    <Copy className="w-5 h-5" /> 已复制！
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" /> 复制邀请链接
                  </>
                )}
              </button>
              <button
                onClick={() => setShowReferralPopup(false)}
                className="w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 py-2"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Referral Reward Notification */}
      {referralRewardNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-once">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3">
            <Gift className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                {referralRewardNotification.type === 'referee'
                  ? `🎉 邀请奖励到账！获得 ${referralRewardNotification.extraGenerations} 次额外生成`
                  : `🎁 好友已加入！获得 ${referralRewardNotification.proDays} 天 Pro 试用`
                }
              </p>
            </div>
            <button
              onClick={() => setReferralRewardNotification(null)}
              className="p-1 hover:bg-white/20 rounded-full ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <NavWrapper />

      {/* Dashboard Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Personalized Welcome Card */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white p-8 sm:p-10 shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex-1">
              {userStage === 0 && (
                <>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-3 leading-tight">
                    欢迎来到你的写作空间 🎉
                  </h1>
                  <p className="text-lg sm:text-xl text-emerald-100 leading-relaxed max-w-2xl">
                    让我们一起开始吧！先完成入门设置，然后开始你的第一次创作。
                  </p>
                </>
              )}
              {userStage === 1 && (
                <>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-3 leading-tight">
                    你的数字分身正在学习你的风格 📚
                  </h1>
                  <p className="text-lg sm:text-xl text-emerald-100 leading-relaxed max-w-2xl">
                    继续使用吧！使用得越多，它就越了解你。
                  </p>
                </>
              )}
              {userStage === 2 && (
                <>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-3 leading-tight">
                    分身已经很了解你了 ✨
                  </h1>
                  <p className="text-lg sm:text-xl text-emerald-100 leading-relaxed max-w-2xl">
                    看看升级 Pro 能为你带来什么！
                  </p>
                </>
              )}
              {userStage === 3 && (
                <>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-3 leading-tight">
                    你们已经是创作搭档了 🚀
                  </h1>
                  <p className="text-lg sm:text-xl text-emerald-100 leading-relaxed max-w-2xl">
                    做得太棒了！要不要考虑团队版？
                  </p>
                </>
              )}
            </div>
            {hasRealData && (
              <button
                onClick={clearAll}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg border border-white/20"
                aria-label="Clear all history"
              >
                <Trash2 className="w-4 h-4" /> 
                <span className="hidden sm:inline">Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Start Cards */}
        {userStage === 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/onboarding" className="group glass-card bg-white/[0.03] dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 flex flex-col items-center justify-center text-center hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">完成入门设置</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">只需 1 分钟！</p>
            </Link>
            <Link href="/write" className="group glass-card bg-white/[0.03] dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 flex flex-col items-center justify-center text-center hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">📝 开始写作</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">立即尝试 AI！</p>
            </Link>
            <Link href="/" className="group glass-card bg-white/[0.03] dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 flex flex-col items-center justify-center text-center hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">浏览博客</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">获取灵感和技巧！</p>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/write" className="group glass-card bg-white/[0.03] dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 flex items-center gap-5 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">📝 开始写作</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">立即开始创作！</p>
              </div>
            </Link>
            <Link href="#history" className="group glass-card bg-white/[0.03] dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 flex items-center gap-5 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">📊 查看历史</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">回顾你的创作</p>
              </div>
            </Link>
            <Link href="#brand-voice" className="group glass-card bg-white/[0.03] dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all duration-300 flex items-center gap-5 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">🎨 管理品牌声音</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">调整和优化风格</p>
              </div>
            </Link>
          </div>
        )}

        {/* Writing Statistics */}
        {userStage > 0 && (
          <WritingStats records={records} />
        )}

        {/* Weekly Summary Card */}
        {userStage > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This Week Generations */}
            <div className="glass-card p-6 border-l-4 border-emerald-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">本周生成</h3>
              </div>
              <p className="text-3xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                {records.filter(r => {
                  const d = new Date(r.createdAt);
                  const now = new Date();
                  const weekStart = new Date(now);
                  weekStart.setDate(now.getDate() - now.getDay());
                  weekStart.setHours(0,0,0,0);
                  return d >= weekStart;
                }).length}
              </p>
              {/* Compare with last week */}
              {(() => {
                const now = new Date();
                const thisWeekStart = new Date(now);
                thisWeekStart.setDate(now.getDate() - now.getDay());
                thisWeekStart.setHours(0,0,0,0);
                const lastWeekStart = new Date(thisWeekStart);
                lastWeekStart.setDate(lastWeekStart.getDate() - 7);
                const thisWeekCount = records.filter(r => new Date(r.createdAt) >= thisWeekStart).length;
                const lastWeekCount = records.filter(r => {
                  const d = new Date(r.createdAt);
                  return d >= lastWeekStart && d < thisWeekStart;
                }).length;
                const change = lastWeekCount > 0 ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100) : thisWeekCount > 0 ? 100 : 0;
                return (
                  <p className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs 上周
                  </p>
                );
              })()}
            </div>

            {/* This Week Words */}
            <div className="glass-card p-6 border-l-4 border-emerald-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">本周字数</h3>
              </div>
              <p className="text-3xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                {records.filter(r => {
                  const d = new Date(r.createdAt);
                  const now = new Date();
                  const weekStart = new Date(now);
                  weekStart.setDate(now.getDate() - now.getDay());
                  weekStart.setHours(0,0,0,0);
                  return d >= weekStart;
                }).reduce((sum, r) => sum + r.result.split(/\s+/).filter(Boolean).length, 0).toLocaleString()}
              </p>
            </div>

            {/* Most Used Mode */}
            <div className="glass-card p-6 border-l-4 border-emerald-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">常用模式</h3>
              </div>
              {(() => {
                const now = new Date();
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0,0,0,0);
                const weekRecords = records.filter(r => new Date(r.createdAt) >= weekStart);
                if (weekRecords.length === 0) {
                  return <p className="text-sm text-slate-500 dark:text-slate-400">本周无数据</p>;
                }
                const modeCounts: Record<string, number> = {};
                weekRecords.forEach(r => { modeCounts[r.mode] = (modeCounts[r.mode] || 0) + 1; });
                const topMode = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])[0];
                if (!topMode) {
                  return <p className="text-sm text-slate-500 dark:text-slate-400">本周无数据</p>;
                }
                return (
                  <p className="text-2xl font-display font-extrabold text-emerald-600 dark:text-emerald-400 capitalize">
                    {topMode[0]}
                  </p>
                );
              })()}
            </div>

            {/* Style Match */}
            <div className="glass-card p-6 border-l-4 border-emerald-500/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">风格匹配</h3>
              </div>
              {profile?.styleFingerprint ? (
                <p className="text-3xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                  {Math.round(profile.styleFingerprint.avgSentenceLength * 5)}%
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">数据不足</p>
              )}
            </div>
          </div>
        )}

        {/* Weekly Insights Card */}
        {userStage > 0 && (
          <WeeklyInsightCard insights={insights} />
        )}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Daily Usage */}
          <div className="glass-card p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-slate-900 dark:text-white">Today&apos;s Usage</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  {planName}
                </span>
              </div>
            </div>
            <p className="text-4xl font-display font-extrabold text-emerald-600 dark:text-white mb-3">
              {used}<span className="text-xl text-slate-500 dark:text-slate-400">/{limit}</span>
            </p>
            <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span>Claude: {claudeUsed}/{claudeLimit}</span>
              <span>DeepSeek: {deepseekUsed}/{deepseekLimit}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {limit - used > 0 ? `${limit - used} generations remaining` : "Daily limit reached"}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-800">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                当前模型：
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {isProUser ? 'Claude + DeepSeek' : 'DeepSeek (免费)'}
                </span>
              </p>
            </div>
          </div>

          {/* Total Generations */}
          <div className="glass-card p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white">Total History</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Saved generations</p>
              </div>
            </div>
            <p className="text-4xl font-display font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">{records.length}</p>
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Keep creating!</span>
            </div>
          </div>

          {/* Avg Word Count */}
          <div className="glass-card p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white">Avg. Words</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Per generation</p>
              </div>
            </div>
            <p className="text-4xl font-display font-extrabold text-emerald-600 dark:text-emerald-400 mb-2">{avgWords}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">words per piece</p>
          </div>

          {/* Credit Balance */}
          <div className="glass-card p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">💎</span>
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white">Credits</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Available balance</p>
              </div>
            </div>
            <p className="text-4xl font-display font-extrabold text-emerald-600 dark:text-emerald-400 mb-3">
              {balance}
            </p>
            <Link href="/pricing/credits" className="w-full btn-primary text-sm min-h-[44px] flex items-center justify-center rounded-xl font-semibold transition-all shadow-lg">
              🛒 Buy Credits
            </Link>
          </div>

          {/* Referral Progress */}
          <div className="glass-card p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 sm:col-span-2 xl:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-slate-900 dark:text-white">邀请好友</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Share & Earn Rewards</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">
                  {referralsCount}/5
                </p>
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${referralProgress}%` }}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {referralsCount >= 5 ? (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-2">
                  🎉 恭喜！你已获得1个月Pro
                </p>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  再邀请{5 - referralsCount}人获得额外奖励 ✨
                </p>
              )}
              <button
                onClick={() => setShowReferralPopup(true)}
                className="btn-primary text-sm min-h-[40px] px-5 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                邀请好友
              </button>
            </div>
          </div>

          {/* Community Workflows */}
          <div className="glass-card p-6 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 sm:col-span-2 xl:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-slate-900 dark:text-white">社区工作流</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">分享和发现优质工作流</p>
              </div>
              <Link href="/templates" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                浏览全部 →
              </Link>
            </div>
            {communityWorkflows.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">还没有社区工作流</p>
                <Link href="/write" className="btn-primary text-sm">创建工作流</Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {communityWorkflows.slice(0, 3).map((workflow) => (
                  <div key={workflow.id} className="bg-white/[0.03] dark:bg-white/[0.05] rounded-xl p-4 border border-slate-200 dark:border-gray-800">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">{workflow.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">{workflow.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">by {workflow.author || "Anonymous"}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                        {workflow.steps.length} steps
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {publishedIds.has(workflow.id) ? (
                        <button
                          onClick={() => handleUnpublishWorkflow(workflow.id)}
                          className="btn-outline text-xs min-h-[36px] px-3 py-1.5"
                        >
                          已分享 ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePublishWorkflow(workflow)}
                          className="btn-outline text-xs min-h-[36px] px-3 py-1.5 flex items-center gap-1"
                        >
                          <Share2 className="w-3 h-3" /> 分享到社区
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Brand Voice & Memory Bank Section */}
        {demoData && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Recent History */}
              <div id="history" className="glass-card p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                    {hasRealData ? "Recent Generations" : "Your Generations"}
                  </h2>
                </div>

                {records.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 bg-white/[0.03] dark:bg-white/[0.05] rounded-full flex items-center justify-center mb-6">
                      <FileText className="w-10 h-10 text-slate-500 dark:text-slate-400" />
                    </div>
                    <p className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No generation records yet</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Start writing to see your history here.</p>
                    <Link href="/write" className="btn-primary shadow-lg">Start Writing</Link>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b-2 border-slate-200 dark:border-gray-800">
                            <th className="pb-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mode</th>
                            <th className="pb-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Title</th>
                            <th className="pb-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide hidden sm:table-cell">Words</th>
                            <th className="pb-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">When</th>
                            <th className="pb-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
                          {visibleRecords.map((item) => (
                            <tr key={item.id} className="group hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent dark:hover:bg-gradient-to-r dark:hover:from-emerald-950/20 dark:hover:to-transparent transition-all">
                              <td className="py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 dark:from-emerald-900 dark:to-emerald-800 dark:text-emerald-200 capitalize shadow-sm">
                                  {item.mode}
                                </span>
                              </td>
                              <td className="py-4">
                                <Link
                                  href={`/write?load=${item.id}`}
                                  className="text-sm font-medium text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors max-w-xs truncate block hover:underline decoration-2 underline-offset-2"
                                >
                                  {item.title}
                                </Link>
                              </td>
                              <td className="py-4 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell font-medium">
                                {getWordCount(item.result)}
                              </td>
                              <td className="py-4 text-sm text-slate-500 dark:text-slate-400">
                                {getRelativeTime(item.createdAt)}
                              </td>
                              <td className="py-4">
                                <button
                                  onClick={() => deleteRecord(item.id)}
                                  className="opacity-0 group-hover:opacity-100 w-10 h-10 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all flex items-center justify-center"
                                  aria-label="Delete record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {records.length > 5 && (
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full flex items-center justify-center gap-2 mt-6 py-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline transition-colors"
                      >
                        {expanded ? "Show Less" : `Show All (${records.length})`}
                        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              {/* Brand Voice Card */}
              {hasRealData || hasProfile ? (
                <BrandVoiceCard records={records} />
              ) : (
                demoData && <BrandVoiceDemoCard demoData={demoData} />
              )}
              
              {/* Style Fingerprint Card */}
              <StyleFingerprintCard profile={profile} />
              
              {/* Weekly Evolution Report Card */}
              <WeeklyEvolutionCard profile={profile} memories={memories} />
              
              {/* Memory Bank Card */}
              <div className="glass-card p-6 border-l-4 border-emerald-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Memory Bank</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Your ideas & preferences</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/[0.03] dark:bg-white/[0.05] rounded-xl">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Memories</span>
                    <span className="text-3xl font-display font-extrabold text-emerald-600 dark:text-emerald-400">{memories.length}</span>
                  </div>
                  
                  {memories.length === 0 ? (
                    <div className="bg-white/[0.03] dark:bg-white/[0.05] rounded-xl p-6 text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        你还没有告诉分身任何想法。去写作页面开始对话吧。
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                      {memories.slice(0, 5).map((memory, index) => (
                        <div key={memory.id} className="group flex items-start justify-between gap-3 p-4 bg-white/[0.03] dark:bg-white/[0.05] rounded-xl border border-slate-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all shadow-sm">
                          {index < 2 && <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0 shadow-sm" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2.5 py-0.5 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 dark:from-emerald-900 dark:to-emerald-800 dark:text-emerald-300 text-xs rounded-full font-semibold capitalize">
                                {memory.type}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(memory.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed">
                              {memory.content}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteMemory(memory.id)}
                            className="opacity-0 group-hover:opacity-100 w-8 h-8 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all flex-shrink-0"
                            aria-label="Delete memory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {memories.length > 5 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium py-2">
                          And {memories.length - 5} more... ✨
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
