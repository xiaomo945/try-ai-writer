"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Clock, FileText, ChevronDown } from "lucide-react";

type HistoryItem = {
  id: string;
  mode: string;
  prompt: string;
  createdAt: string;
  wordCount: number;
};

const mockHistory: HistoryItem[] = [
  { id: "1", mode: "blog", prompt: "How to start a side hustle in 2025", createdAt: "2h ago", wordCount: 842 },
  { id: "2", mode: "email", prompt: "Follow-up after product demo", createdAt: "5h ago", wordCount: 156 },
  { id: "3", mode: "social", prompt: "Launch announcement for new feature", createdAt: "1d ago", wordCount: 98 },
  { id: "4", mode: "blog", prompt: "Best practices for remote work", createdAt: "2d ago", wordCount: 1203 },
  { id: "5", mode: "custom", prompt: "Product description for eco-friendly notebook", createdAt: "3d ago", wordCount: 234 },
];

export default function DashboardPage() {
  const [expanded, setExpanded] = useState(false);

  const dailyLimit = 10;
  const dailyUsed = 3;
  const percentage = (dailyUsed / dailyLimit) * 100;

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
        <div>
          <h1 className="text-4xl font-display font-extrabold text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Welcome back! Here&apos;s your usage overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-6">
          {/* Daily Usage */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Today&apos;s Usage</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {dailyUsed}/{dailyLimit}
            </p>
            <div className="w-full bg-slate-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {dailyLimit - dailyUsed} generations remaining today
            </p>
          </div>

          {/* Total Generations */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Total Generations</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">47</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">This month</p>
          </div>

          {/* Avg Word Count */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-emerald-600" />
              <h3 className="font-semibold text-slate-900 dark:text-white">Avg. Word Count</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">312</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Per generation</p>
          </div>
        </div>

        {/* Recent History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">Recent Generations</h2>
            <Link href="/write" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold">
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-gray-700">
                  <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Mode</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Prompt</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:table-cell">Words</th>
                  <th className="pb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                {(expanded ? mockHistory : mockHistory.slice(0, 3)).map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 capitalize">
                        {item.mode}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {item.prompt}
                    </td>
                    <td className="py-3 text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {item.wordCount}
                    </td>
                    <td className="py-3 text-sm text-slate-500 dark:text-slate-400">
                      {item.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mockHistory.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-2 mt-4 py-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              {expanded ? "Show Less" : `Show All (${mockHistory.length})`}
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
