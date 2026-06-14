"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Clock, Zap, Sparkles, BarChart3, Target, Award, ChevronDown, ChevronUp } from "lucide-react";
import { useDbHistory } from "@/lib/db-history";
import { useDbMemoryBank, type MemoryItem } from "@/lib/db-memory-bank";
import { useDbBrandVoice } from "@/lib/db-brand-voice";
import { generateWeeklyStyleReport, type WeeklyStyleReport } from "@/lib/weekly-style-report";
import { scoreStyleMatch, type BrandVoiceProfile as MatcherProfile } from "@/lib/style-matcher";
import { getFingerprintSummary, type StyleFingerprint } from "@/lib/style-fingerprint";

export function EvolutionReport() {
  const { records } = useDbHistory();
  const { memories } = useDbMemoryBank();
  const { profile } = useDbBrandVoice();
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");
  const [report, setReport] = useState<WeeklyStyleReport | null>(null);

  useEffect(() => {
    if (profile && memories.length > 0) {
      const matcherProfile: MatcherProfile = {
        tone: {
          formality: 0.5,
          sentiment: "neutral",
          pace: "moderate"
        },
        commonPhrases: profile.commonPhrases || [],
        avgSentenceLength: profile.styleFingerprint?.avgSentenceLength || 15,
        avgParagraphLength: profile.styleFingerprint?.avgParagraphSentenceCount || 4,
        industryTerms: []
      };
      
      const generatedReport = generateWeeklyStyleReport(memories, matcherProfile, profile.styleFingerprint);
      setReport(generatedReport);
    }
  }, [profile, memories]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeekRecords = records.filter(r => new Date(r.createdAt) > weekAgo);
    const thisWeekMemories = memories.filter(m => new Date(m.createdAt) > weekAgo);
    const thisMonthRecords = records.filter(r => new Date(r.createdAt) > monthAgo);
    
    let avgStyleMatch = 0;
    if (profile?.styleFingerprint && thisWeekMemories.length > 0) {
      const matcherProfile: MatcherProfile = {
        tone: {
          formality: 0.5,
          sentiment: "neutral",
          pace: "moderate"
        },
        commonPhrases: profile.commonPhrases || [],
        avgSentenceLength: profile.styleFingerprint.avgSentenceLength,
        avgParagraphLength: profile.styleFingerprint.avgParagraphSentenceCount,
        industryTerms: []
      };
      
      const scores = thisWeekMemories.map(m => scoreStyleMatch(m.content, matcherProfile).score);
      avgStyleMatch = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    }
    
    const totalWords = records.reduce((sum, r) => sum + r.result.split(/\s+/).length, 0);
    
    return {
      thisWeekGenerations: thisWeekRecords.length,
      thisWeekMemories: thisWeekMemories.length,
      thisMonthGenerations: thisMonthRecords.length,
      avgStyleMatch,
      totalWords,
      totalMemories: memories.length,
      totalGenerations: records.length
    };
  }, [records, memories, profile]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!profile) {
    return (
      <div className="card p-8 text-center">
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Start Your Evolution Journey
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Complete the onboarding to start tracking your style evolution.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6 border-l-4 border-emerald-500">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Style Evolution
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Track how your digital twin learns and adapts to your writing style
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          value={stats.thisWeekGenerations}
          label="This Week"
          sublabel="Generations"
          color="emerald"
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          value={stats.thisMonthGenerations}
          label="This Month"
          sublabel="Generations"
          color="blue"
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          value={`${stats.avgStyleMatch}%`}
          label="Style Match"
          sublabel="Average"
          color="purple"
        />
        <StatCard
          icon={<Award className="w-5 h-5" />}
          value={stats.totalMemories}
          label="Total"
          sublabel="Memories"
          color="amber"
        />
      </div>

      {/* Evolution Overview */}
      <ExpandableSection
        title="Overview"
        icon={<Sparkles className="w-5 h-5" />}
        isExpanded={expandedSection === "overview"}
        onToggle={() => toggleSection("overview")}
      >
        {report ? (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300">
                {report.evolutionSummary}
              </p>
            </div>

            {report.topKeywords.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Top Keywords This Week
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.topKeywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">New Samples</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.newSamplesCount}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Style Stability</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {report.styleStability}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Match Change</p>
                <p className={`text-2xl font-bold ${
                  report.styleMatchChange.direction === "up" ? "text-emerald-600 dark:text-emerald-400" :
                  report.styleMatchChange.direction === "down" ? "text-red-600 dark:text-red-400" :
                  "text-gray-700 dark:text-gray-300"
                }`}>
                  {report.styleMatchChange.current}%
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Start writing to get your evolution report
          </div>
        )}
      </ExpandableSection>

      {/* Style Fingerprint Details */}
      {profile.styleFingerprint && (
        <ExpandableSection
          title="Style Fingerprint"
          icon={<Target className="w-5 h-5" />}
          isExpanded={expandedSection === "fingerprint"}
          onToggle={() => toggleSection("fingerprint")}
        >
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {getFingerprintSummary(profile.styleFingerprint)}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Sentence Length Distribution
                </h4>
                <ProgressBar
                  label="Short"
                  value={profile.styleFingerprint.sentenceLengthDistribution.short}
                  color="blue"
                />
                <ProgressBar
                  label="Medium"
                  value={profile.styleFingerprint.sentenceLengthDistribution.medium}
                  color="indigo"
                />
                <ProgressBar
                  label="Long"
                  value={profile.styleFingerprint.sentenceLengthDistribution.long}
                  color="purple"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Paragraph Structure
                </h4>
                <ProgressBar
                  label="Short"
                  value={profile.styleFingerprint.paragraphStructurePreference.short}
                  color="emerald"
                />
                <ProgressBar
                  label="Medium"
                  value={profile.styleFingerprint.paragraphStructurePreference.medium}
                  color="teal"
                />
                <ProgressBar
                  label="Long"
                  value={profile.styleFingerprint.paragraphStructurePreference.long}
                  color="cyan"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Sentence Length</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile.styleFingerprint.avgSentenceLength} words
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Paragraph Sentences</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile.styleFingerprint.avgParagraphSentenceCount}
                </p>
              </div>
            </div>

            {profile.styleFingerprint.commonTransitionWords.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Common Transition Words
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.styleFingerprint.commonTransitionWords.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">Passive Voice Usage</p>
                <p className={`text-lg font-bold ${
                  profile.styleFingerprint.passiveVoiceRate > 0.3 ? "text-amber-600 dark:text-amber-400" :
                  "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {Math.round(profile.styleFingerprint.passiveVoiceRate * 100)}%
                </p>
              </div>
              <div className="mt-2 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    profile.styleFingerprint.passiveVoiceRate > 0.3 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, profile.styleFingerprint.passiveVoiceRate * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </ExpandableSection>
      )}

      {/* Activity Timeline */}
      <ExpandableSection
        title="Recent Activity"
        icon={<BarChart3 className="w-5 h-5" />}
        isExpanded={expandedSection === "activity"}
        onToggle={() => toggleSection("activity")}
      >
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No writing activity yet. Start creating to see your timeline!
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {records.slice(0, 10).map((record, i) => (
                <div key={record.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {record.title}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {record.mode} • {record.result.split(/\s+/).length} words
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Milestones */}
      <ExpandableSection
        title="Achievements"
        icon={<Award className="w-5 h-5" />}
        isExpanded={expandedSection === "achievements"}
        onToggle={() => toggleSection("achievements")}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { 
              title: "First Step", 
              description: "Complete your first generation",
              unlocked: records.length >= 1,
              icon: "🌱"
            },
            { 
              title: "Getting Started", 
              description: "Complete 5 generations",
              unlocked: records.length >= 5,
              icon: "🚀"
            },
            { 
              title: "Style Learner", 
              description: "Build your initial style fingerprint",
              unlocked: profile.learningSamples && profile.learningSamples >= 3,
              icon: "🎯"
            },
            { 
              title: "Memory Collector", 
              description: "Save 10 memories",
              unlocked: memories.length >= 10,
              icon: "🧠"
            },
            { 
              title: "Content Creator", 
              description: "Complete 25 generations",
              unlocked: records.length >= 25,
              icon: "✍️"
            },
            { 
              title: "Style Master", 
              description: "20+ learning samples",
              unlocked: profile.learningSamples && profile.learningSamples >= 20,
              icon: "👑"
            }
          ].map((milestone, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border-2 ${
                milestone.unlocked
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{milestone.icon}</span>
                <div className="flex-1">
                  <p className={`font-medium ${
                    milestone.unlocked ? "text-emerald-700 dark:text-emerald-300" : "text-gray-600 dark:text-gray-400"
                  }`}>
                    {milestone.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {milestone.description}
                  </p>
                </div>
                {milestone.unlocked && <CheckIcon />}
              </div>
            </div>
          ))}
        </div>
      </ExpandableSection>
    </div>
  );
}

function StatCard({ 
  icon, 
  value, 
  label, 
  sublabel, 
  color 
}: { 
  icon: React.ReactNode;
  value: number | string;
  label: string;
  sublabel: string;
  color: "emerald" | "blue" | "purple" | "amber";
}) {
  const colorClasses = {
    emerald: "from-emerald-500 to-teal-600 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20",
    blue: "from-blue-500 to-indigo-600 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20",
    purple: "from-purple-500 to-pink-600 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20",
    amber: "from-amber-500 to-orange-600 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20"
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{sublabel}</p>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap = {
    blue: "bg-blue-500",
    indigo: "bg-indigo-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
    teal: "bg-teal-500",
    cyan: "bg-cyan-500"
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${colorMap[color as keyof typeof colorMap]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function ExpandableSection({
  title,
  icon,
  children,
  isExpanded,
  onToggle
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="px-5 pb-5 pt-0 border-t border-gray-100 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}
