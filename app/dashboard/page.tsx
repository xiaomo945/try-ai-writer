"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Clock, FileText, ChevronDown, Trash2, Sparkles, BookOpen } from "lucide-react";
import { useHistory } from "@/lib/history";
import { useUsage } from "@/lib/usage";

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
            {profile.commonPhrases.slice(0, 6).map((phrase, i) => (
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
            {demoData.samples.slice(0, 3).map((sample) => (
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

export default function DashboardPage() {
  const { records, deleteRecord, clearAll } = useHistory();
  const { used, limit } = useUsage();
  const [expanded, setExpanded] = useState(false);
  const [demoData, setDemoData] = useState<DemoData | null>(null);
  const percentage = (used / limit) * 100;

  const visibleRecords = expanded ? records : records.slice(0, 5);

  const totalWords = records.reduce((sum, r) => sum + getWordCount(r.result), 0);
  const avgWords = records.length > 0 ? Math.round(totalWords / records.length) : 0;

  useEffect(() => {
    // Load demo data
    fetch('/demo/brand-voice-samples.json')
      .then(res => res.json())
      .then(data => setDemoData(data))
      .catch(() => setDemoData(null));
  }, []);

  const hasRealData = records.length > 0;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-emerald-600 font-display text-xl font-extrabold">
            Use AI Writer
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/write" className="btn-primary text-sm min-h-[40px] px-4">
              New Generation
            </Link>
            <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-emerald-800" />
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 space-y-8">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {hasRealData ? "Welcome back! Here's your usage overview." : "Welcome! Here's a preview of what you can achieve."}
            </p>
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

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Daily Usage */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Today's Usage</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {used}/{limit}
            </p>
            <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {limit - used} generations remaining today
            </p>
          </div>

          {/* Total Generations */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Total History</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{records.length}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Saved generations</p>
          </div>

          {/* Avg Word Count */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Avg. Word Count</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{avgWords}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Per generation</p>
          </div>
        </div>

        {/* Brand Voice Section */}
        {demoData && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Recent History */}
              <div className="card">
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

            {/* Brand Voice Demo Card */}
            <div className="lg:col-span-1">
              {!hasRealData && demoData && <BrandVoiceDemoCard demoData={demoData} />}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
