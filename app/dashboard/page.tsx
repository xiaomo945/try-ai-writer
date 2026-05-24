"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Clock, FileText, ChevronDown, Trash2, PenTool } from "lucide-react";
import { useHistory } from "@/lib/history";
import { useUsage } from "@/lib/usage";
import { useBrandVoice } from "@/lib/brand-voice";

type WritingMode = "blog" | "email" | "social" | "custom";

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

export default function DashboardPage() {
  const { records, deleteRecord, clearAll } = useHistory();
  const { used, limit } = useUsage();
  const { profile, samples } = useBrandVoice();
  const [expanded, setExpanded] = useState(false);
  const percentage = (used / limit) * 100;

  const visibleRecords = expanded ? records : records.slice(0, 5);

  const totalWords = records.reduce((sum, r) => sum + getWordCount(r.result), 0);
  const avgWords = records.length > 0 ? Math.round(totalWords / records.length) : 0;

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
            <p className="text-slate-600 dark:text-slate-400 mt-2">Welcome back! Here&apos;s your usage overview.</p>
          </div>
          {records.length > 0 && (
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Daily Usage */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Today&apos;s Usage</h3>
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

          {/* My Brand Voice */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <PenTool className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">My Brand Voice</h3>
            </div>
            {profile ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Tone:</span> {profile.tone}
                </p>
                {profile.industry && (
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">Industry:</span> {profile.industry}
                  </p>
                )}
                {profile.targetAudience && (
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">Audience:</span> {profile.targetAudience}
                  </p>
                )}
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-white">Samples:</span> {samples.length}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  AI hasn&apos;t learned your style yet.
                </p>
                <Link href="/write" className="btn-primary text-sm mt-2 inline-block">
                  Start Writing & Learn
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Recent Generations</h2>
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
    </main>
  );
}
