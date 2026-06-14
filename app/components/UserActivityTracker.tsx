"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, Calendar } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface ActivityData {
  date: string;
  sessions: number;
  generations: number;
  timeSpent: number;
}

export function UserActivityTracker() {
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load activity from localStorage
    const stored = localStorage.getItem("user_activity");
    if (stored) {
      const data = JSON.parse(stored);
      setActivity(data);
      calculateStreak(data);
    }

    // Track daily activity
    trackDailyActivity();
  }, []);

  const trackDailyActivity = () => {
    const today = new Date().toISOString().split("T")[0] || "unknown";
    const existing = JSON.parse(localStorage.getItem("user_activity") || "[]");
    
    const todayData = existing.find((d: ActivityData) => d.date === today);
    
    if (!todayData) {
      const newActivity = [...existing, {
        date: today,
        sessions: 1,
        generations: 0,
        timeSpent: 0
      }];
      localStorage.setItem("user_activity", JSON.stringify(newActivity));
      setActivity(newActivity);
      
      trackEvent("daily_activity", "engagement", { date: today });
    } else {
      todayData.sessions += 1;
      localStorage.setItem("user_activity", JSON.stringify(existing));
    }
  };

  const calculateStreak = (data: ActivityData[]) => {
    const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    const today = new Date();
    
    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i];
      if (!item) break;
      const activityDate = new Date(item.date);
      const diffDays = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === i) {
        currentStreak++;
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  };

  const last7Days = activity.slice(-7);
  const avgSessions = last7Days.length > 0 
    ? (last7Days.reduce((sum, d) => sum + d.sessions, 0) / last7Days.length).toFixed(1)
    : "0";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            Your Activity
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track your daily usage patterns
          </p>
        </div>
        <Activity className="w-8 h-8 text-emerald-600" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Current Streak
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {streak} days
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Avg Daily Sessions
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {avgSessions}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Active Days
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {activity.length}
          </p>
        </div>
      </div>

      {/* Activity Calendar */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Last 7 Days Activity
        </p>
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const dayData = last7Days[i];
            const hasActivity = dayData && dayData.sessions > 0;
            const intensity = dayData ? Math.min(dayData.sessions / 5, 1) : 0;
            
            return (
              <div
                key={i}
                className={`flex-1 aspect-square rounded-lg transition-all ${
                  hasActivity
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
                style={{ opacity: hasActivity ? 0.3 + intensity * 0.7 : 1 }}
                title={dayData ? `${dayData.date}: ${dayData.sessions} sessions` : "No activity"}
              />
            );
          })}
        </div>
      </div>

      {/* Streak Motivation */}
      {streak >= 3 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-1">
            🔥 Keep it up!
          </p>
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            You've been active for {streak} days in a row. Consistency is key to improving your writing!
          </p>
        </div>
      )}
    </div>
  );
}
