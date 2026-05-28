"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Zap, Clock, FileText, ChevronDown, Trash2, Sparkles, BookOpen, Brain, Upload, X, Palette, Users, Copy, Share2 } from "lucide-react";
import { useHistory } from "@/lib/history";
import { useUsage } from "@/lib/usage";
import { useBrandVoice } from "@/lib/brand-voice";
import { useMemoryBank } from "@/lib/memory-bank";
import { useCredits } from "@/lib/credits";
import { OnboardingWizard } from "@/app/components/OnboardingWizard";
import { WeeklyInsightCard } from "@/app/components/WeeklyInsightCard";
import { getWeeklyInsights } from "@/lib/weekly-insights";
import { DigitalTwinAvatar, type AvatarVariant } from "@/app/components/DigitalTwinAvatar";
import { useAvatarVariant, generateAvatarFromDescription } from "@/lib/avatar-variant";
import { ReferralShare } from "@/app/components/ReferralShare";
import { initializeReferral, getReferralLink, REFERRAL_REWARDS, checkPendingReferralRewards, clearPendingReferralRewards } from "@/lib/referral";
import Logo from "@/app/components/Logo";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { Gift } from "lucide-react";

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
    <div className="card border-2 border-dashed border-emerald-200 bg-emerald-50/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-display font-bold text-slate-900">Demo Brand Voice</h3>
          <p className="text-xs text-slate-500">Generated from our blog content</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Industry & Tone */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-700 border border-slate-200">
            {profile.industry}
          </span>
          <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-emerald-700 border border-emerald-200">
            {profile.tone.sentiment} tone
          </span>
          <span className="px-3 py-1 bg-white rounded-full text-xs font-medium text-slate-700 border border-slate-200">
            {profile.tone.pace} pace
          </span>
        </div>
        
        {/* Style Match Score */}
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Style Match Score</span>
            <span className="text-2xl font-bold text-emerald-600">{styleMatchScore.overall}%</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="text-lg font-semibold text-slate-700">{styleMatchScore.tone}%</div>
              <div className="text-xs text-slate-500">Tone</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="text-lg font-semibold text-slate-700">{styleMatchScore.vocabulary}%</div>
              <div className="text-xs text-slate-500">Vocab</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <div className="text-lg font-semibold text-slate-700">{styleMatchScore.structure}%</div>
              <div className="text-xs text-slate-500">Structure</div>
            </div>
          </div>
        </div>
        
        {/* Common Phrases */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2">Common Phrases</div>
          <div className="flex flex-wrap gap-1">
            {profile.commonPhrases.slice(0,6).map((phrase, i) => (
              <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                {phrase}
              </span>
            ))}
          </div>
        </div>
        
        {/* Sample Articles */}
        <div>
          <div className="text-xs font-medium text-slate-500 mb-2">Sample Articles</div>
          <div className="space-y-2">
            {demoData.samples.slice(0,3).map((sample) => (
              <div key={sample.id} className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 truncate flex-1">{sample.title}</span>
                <span className="text-xs text-slate-400">{sample.wordCount} words</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <div className="pt-4 border-t border-emerald-200">
          <p className="text-sm text-slate-600 mb-3">
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
          className="text-slate-200 dark:text-gray-700"
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
        <span className="text-xs text-slate-500">/20</span>
      </div>
    </div>
  );
}

function BrandVoiceCard() {
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
    <div id="brand-voice" className="card border-l-4 border-emerald-600">
      <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-slate-900">Your Brand Voice</h3>
            <p className="text-xs text-slate-500">Built from your writing style</p>
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
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6 relative">
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
              <div className="mb-6 p-4 bg-slate-50 dark:bg-gray-800 rounded-xl">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-2">
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
                <p className="text-xs text-slate-500 mt-2 text-center">
                  AI-powered avatar generation is coming soon!
                </p>
              </div>

              {/* Preset Selection */}
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">
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
                          : 'border-slate-200 dark:border-gray-700 hover:border-emerald-300'
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
      
      <div className="flex items-center gap-4 mb-4 p-3 bg-slate-50 dark:bg-gray-800 rounded-xl">
        <LearningProgressRing progress={learningProgress} />
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            AI已学习你的 <span className="text-emerald-600 font-bold">{learningProgress}</span> 个写作习惯
          </p>
          <p className="text-xs text-slate-500">
            继续写作，目标：20个样本
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700 border border-slate-200">
            {profile.industry}
          </span>
          <span className="px-3 py-1 bg-emerald-100 rounded-full text-xs font-medium text-emerald-700 border border-emerald-200">
            {profile.tone} tone
          </span>
          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700 border border-slate-200">
            {profile.audience} audience
          </span>
        </div>
        {profile.commonPhrases.length > 0 && (
          <div>
            <p className="text-xs text-slate-500 mb-2">Common Phrases</p>
            <div className="flex flex-wrap gap-1">
              {profile.commonPhrases.slice(0, 8).map((phrase, i) => (
                <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200">
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
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
  const { hasProfile, isLoaded } = useBrandVoice();
  const { memories, deleteMemory } = useMemoryBank();
  const [expanded, setExpanded] = useState(false);
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [referralData, setReferralData] = useState<any>(null);
  const [referralLinkCopied, setReferralLinkCopied] = useState(false);
  const [referralRewardNotification, setReferralRewardNotification] = useState<{ type: 'referee'; extraGenerations: number } | { type: 'referrer'; proDays: number } | null>(null);
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

    // Check if new user popup should be shown
    if (!localStorage.getItem('referral_shown')) {
      setShowReferralPopup(true);
    }

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

  const hasRealData = records.length > 0;

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Onboarding Wizard */}
      {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} />}
      
      {/* Referral Popup for New Users */}
      {showReferralPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={dismissReferralPopup}
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
                onClick={copyReferralLink}
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
                onClick={dismissReferralPopup}
                className="w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 py-2"
              >
                稍后再说
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

      {/* Header */}
      <header className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-emerald-600 font-display text-xl">
            <Logo size={32} />
            Use <span className="font-extrabold">AI Writer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/write" className="btn-primary text-sm min-h-[40px] px-4">
              New Generation
            </Link>
            <ThemeToggle />
            <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800" />
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 space-y-8">
        {/* Personalized Welcome Card */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-950 border border-emerald-100 dark:border-emerald-900 p-6">
          <div className="flex items-center justify-between">
            <div>
              {userStage === 0 && (
                <>
                  <h1 className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">欢迎来到你的写作空间 🎉</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    让我们一起开始吧！先完成入门设置，然后开始你的第一次创作。
                  </p>
                </>
              )}
              {userStage === 1 && (
                <>
                  <h1 className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">你的数字分身正在学习你的风格 📚</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    继续使用吧！使用得越多，它就越了解你。
                  </p>
                </>
              )}
              {userStage === 2 && (
                <>
                  <h1 className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">分身已经很了解你了 ✨</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    看看升级 Pro 能为你带来什么！
                  </p>
                </>
              )}
              {userStage === 3 && (
                <>
                  <h1 className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">你们已经是创作搭档了 🚀</h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-2">
                    做得太棒了！要不要考虑团队版？
                  </p>
                </>
              )}
            </div>
            {hasRealData && (
              <button
                onClick={clearAll}
                className="btn-outline text-sm gap-2 min-h-[40px]"
                aria-label="Clear all history"
              >
                <Trash2 className="w-4 h-4" /> Clear History
              </button>
            )}
          </div>
        </div>

        {/* Quick Start Cards */}
        {userStage === 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/onboarding" className="card hover:border-emerald-300 transition-colors flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">完成入门设置</h3>
              <p className="text-sm text-slate-600">只需 1 分钟！</p>
            </Link>
            <Link href="/write" className="card hover:border-emerald-300 transition-colors flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">📝 开始写作</h3>
              <p className="text-sm text-slate-600">立即尝试 AI！</p>
            </Link>
            <Link href="/" className="card hover:border-emerald-300 transition-colors flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">浏览博客</h3>
              <p className="text-sm text-slate-600">获取灵感和技巧！</p>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/write" className="card hover:border-emerald-300 transition-colors flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">📝 开始写作</h3>
                <p className="text-sm text-slate-600">立即开始创作！</p>
              </div>
            </Link>
            <Link href="#history" className="card hover:border-emerald-300 transition-colors flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">📊 查看历史</h3>
                <p className="text-sm text-slate-600">回顾你的创作</p>
              </div>
            </Link>
            <Link href="#brand-voice" className="card hover:border-emerald-300 transition-colors flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">🎨 管理品牌声音</h3>
                <p className="text-sm text-slate-600">调整和优化风格</p>
              </div>
            </Link>
          </div>
        )}

        {/* Weekly Insights Card */}
        {userStage > 0 && (
          <WeeklyInsightCard insights={insights} />
        )}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Daily Usage */}
          <div className="card bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Today&apos;s Usage</h3>
              <span className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                {planName}
              </span>
            </div>
            <p className="text-3xl font-display font-bold text-emerald-600 dark:text-white mb-2">
              {used}/{limit}
            </p>
            <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Claude: {claudeUsed}/{claudeLimit}</span>
              <span>DeepSeek: {deepseekUsed}/{deepseekLimit}</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {limit - used > 0 ? `${limit - used} generations remaining today` : "Daily limit reached"}
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-gray-700">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                当前模型：
                <span className="font-medium">
                  {isProUser ? 'Claude + DeepSeek (可切换)' : 'DeepSeek (免费)'}
                </span>
              </p>
            </div>
          </div>

          {/* Total Generations */}
          <div className="card bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Total History</h3>
            </div>
            <p className="text-3xl font-display font-bold text-emerald-600 dark:text-white">{records.length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Saved generations</p>
          </div>

          {/* Avg Word Count */}
          <div className="card bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Avg. Word Count</h3>
            </div>
            <p className="text-3xl font-display font-bold text-emerald-600 dark:text-white">{avgWords}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Per generation</p>
          </div>

          {/* Credit Balance */}
          <div className="card bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                💎
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Credit Balance</h3>
            </div>
            <p className="text-3xl font-display font-bold text-purple-600 dark:text-purple-400 mb-2">
              {balance}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              Credits remaining
            </p>
            <Link href="/pricing/credits" className="btn-primary text-sm text-center block min-h-[44px] flex items-center justify-center">
              🛒 Buy Credits
            </Link>
          </div>

          {/* Referral Progress */}
          <div className="card bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-950 border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">邀请好友</h3>
            </div>
            <p className="text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {referralsCount}/5
            </p>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${referralProgress}%` }}
              />
            </div>
            {referralsCount >= 5 ? (
              <p className="text-sm text-emerald-600 font-medium">🎉 恭喜！你已获得1个月Pro</p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                再邀请{5 - referralsCount}人获得额外奖励
              </p>
            )}
          </div>
        </div>

        {/* Brand Voice & Memory Bank Section */}
        {demoData && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Recent History */}
              <div id="history" className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
                    {hasRealData ? "Recent Generations" : "Your Generations"}
                  </h2>
                </div>

                {records.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="w-12 h-12 text-slate-300 dark:text-gray-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No generation records yet</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Start writing to see your history here.</p>
                    <Link href="/write" className="btn-primary mt-6 text-sm">Start Writing</Link>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-gray-700">
                            <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Mode</th>
                            <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Title</th>
                            <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:table-cell">Words</th>
                            <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">When</th>
                            <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                          {visibleRecords.map((item) => (
                            <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="py-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 capitalize">
                                  {item.mode}
                                </span>
                              </td>
                              <td className="py-3">
                                <Link
                                  href={`/write?load=${item.id}`}
                                  className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium hover:underline max-w-xs truncate block"
                                >
                                  {item.title}
                                </Link>
                              </td>
                              <td className="py-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                                {getWordCount(item.result)}
                              </td>
                              <td className="py-3 text-sm text-slate-500 dark:text-slate-400">
                                {getRelativeTime(item.createdAt)}
                              </td>
                              <td className="py-3">
                                <button
                                  onClick={() => deleteRecord(item.id)}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
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
                        className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
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
                <BrandVoiceCard />
              ) : (
                demoData && <BrandVoiceDemoCard demoData={demoData} />
              )}
              
              {/* Memory Bank Card */}
              <div className="card bg-slate-50 dark:bg-gray-900 border-slate-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900">Your Memory Bank</h3>
                    <p className="text-xs text-slate-500">Saving your ideas and preferences</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Memories</span>
                    <span className="text-2xl font-display font-bold text-emerald-600">{memories.length}</span>
                  </div>
                  
                  {memories.length === 0 ? (
                    <div className="bg-slate-100 dark:bg-gray-800 rounded-xl p-4 text-center">
                      <p className="text-sm text-slate-500">
                        你还没有告诉分身任何想法。去写作页面开始对话吧。
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {memories.slice(0, 5).map((memory, index) => (
                        <div key={memory.id} className="group flex items-start justify-between gap-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-slate-200 dark:border-gray-700">
                          {index < 2 && <div className="w-2 h-2 bg-amber-400 rounded-full mt-1 flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full capitalize">
                                {memory.type}
                              </span>
                              <span className="text-xs text-slate-400">
                                {new Date(memory.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                              {memory.content}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteMemory(memory.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                            aria-label="Delete memory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {memories.length > 5 && (
                        <p className="text-xs text-slate-500 text-center">
                          And {memories.length - 5} more...
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
