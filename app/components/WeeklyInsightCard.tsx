"use client";

import type { WeeklyInsights } from "@/lib/weekly-insights";

interface WeeklyInsightCardProps {
  insights: WeeklyInsights | null;
}

export function WeeklyInsightCard({ insights }: WeeklyInsightCardProps) {
  if (!insights) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="text-center">
          <p className="text-gray-500 text-lg">开始写作，获取你的第一份周报 ✨</p>
        </div>
      </div>
    );
  }

  const generationUp = insights.generationChange > 0;
  const styleMatchUp = insights.styleMatchChange > 0;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-900">本周写作洞察</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-2">
          <div className="text-gray-500 text-sm">生成次数</div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {insights.thisWeekGenerations}
            </span>
            <span
              className={`text-sm font-medium ${
              generationUp ? "text-emerald-600" : "text-red-500"
            }`}
            >
              {generationUp ? "↑" : "↓"}{" "}
              {Math.abs(Math.round(insights.generationChange))}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-gray-500 text-sm">最常用模式</div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
              {insights.mostUsedMode}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-gray-500 text-sm">风格匹配度</div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {insights.styleMatchAverage}%
            </span>
            <span
              className={`text-sm font-medium ${
              styleMatchUp ? "text-emerald-600" : "text-red-500"
            }`}
            >
              {styleMatchUp ? "↑" : "↓"}{" "}
              {Math.abs(Math.round(insights.styleMatchChange))}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-gray-500 text-sm">记忆增长</div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              +{insights.memoryGrowth}
            </span>
            <span className="text-sm text-gray-500">条新想法</span>
          </div>
        </div>
      </div>
    </div>
  );
}
