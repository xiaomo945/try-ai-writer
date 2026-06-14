"use client";

import { useState, useEffect } from "react";
import { Calendar, TrendingUp, Users } from "lucide-react";

interface RetentionData {
  day1: number;
  day3: number;
  day7: number;
  day14: number;
  day30: number;
}

export function RetentionAnalysis() {
  const [retention, setRetention] = useState<RetentionData>({
    day1: 0,
    day3: 0,
    day7: 0,
    day14: 0,
    day30: 0,
  });

  useEffect(() => {
    calculateRetention();
  }, []);

  const calculateRetention = () => {
    const activity = JSON.parse(localStorage.getItem("user_activity") || "[]");
    const now = new Date();
    
    // Calculate retention for different time periods
    const day1 = calculateRetentionForDays(activity, now, 1);
    const day3 = calculateRetentionForDays(activity, now, 3);
    const day7 = calculateRetentionForDays(activity, now, 7);
    const day14 = calculateRetentionForDays(activity, now, 14);
    const day30 = calculateRetentionForDays(activity, now, 30);
    
    setRetention({ day1, day3, day7, day14, day30 });
  };

  const calculateRetentionForDays = (activity: any[], now: Date, days: number): number => {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() - days);
    const targetDateStr = targetDate.toISOString().split("T")[0];
    
    // Find users who were active on the target date
    const usersActiveOnTargetDate = activity.filter((a: any) => a.date === targetDateStr);
    
    if (usersActiveOnTargetDate.length === 0) return 0;
    
    // Check how many of those users are still active today
    const todayStr = now.toISOString().split("T")[0];
    const usersStillActive = usersActiveOnTargetDate.filter((a: any) => 
      activity.some((b: any) => b.date === todayStr)
    );
    
    return (usersStillActive.length / usersActiveOnTargetDate.length) * 100;
  };

  const retentionData = [
    { label: "Day 1", value: retention.day1, color: "emerald" },
    { label: "Day 3", value: retention.day3, color: "teal" },
    { label: "Day 7", value: retention.day7, color: "blue" },
    { label: "Day 14", value: retention.day14, color: "purple" },
    { label: "Day 30", value: retention.day30, color: "pink" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            User Retention
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            How users return to your app over time
          </p>
        </div>
        <Users className="w-8 h-8 text-emerald-600" />
      </div>

      {/* Retention Metrics */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {retentionData.map((item, index) => (
          <div
            key={index}
            className={`bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-xl p-4 text-center`}
          >
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              {item.label}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {item.value.toFixed(0)}%
            </p>
          </div>
        ))}
      </div>

      {/* Retention Chart */}
      <div className="space-y-3">
        {retentionData.map((item, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {item.value.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 transition-all duration-500`}
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Retention Insights
        </p>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Day 1 retention: {retention.day1.toFixed(0)}% of users return the next day</li>
          <li>• Day 7 retention: {retention.day7.toFixed(0)}% of users return after a week</li>
          <li>• Day 30 retention: {retention.day30.toFixed(0)}% of users return after a month</li>
        </ul>
      </div>
    </div>
  );
}
