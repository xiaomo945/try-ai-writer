"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";

export type ModelType = "claude" | "deepseek" | "mock";

export interface UsageStats {
  used: number;
  limit: number;
  claudeUsed: number;
  claudeLimit: number;
  deepseekUsed: number;
  deepseekLimit: number;
  planName: string;
  isProUser: boolean;
  selectedModel: string;
}

const FREE_LIMIT = 10;
const PRO_LIMIT = 9999;

export function useDbUsage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UsageStats>({
    used: 0,
    limit: FREE_LIMIT,
    claudeUsed: 0,
    claudeLimit: FREE_LIMIT,
    deepseekUsed: 0,
    deepseekLimit: FREE_LIMIT,
    planName: "Free",
    isProUser: false,
    selectedModel: "deepseek",
  });
  const [loading, setLoading] = useState(false);

  // 从数据库加载使用统计
  const loadStats = useCallback(async () => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/user/usage");
      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({
          ...prev,
          used: data.used || 0,
          claudeUsed: data.claudeUsed || 0,
          deepseekUsed: data.deepseekUsed || 0,
          planName: data.planName || "Free",
          isProUser: data.isProUser || false,
          limit: data.isProUser ? PRO_LIMIT : FREE_LIMIT,
          claudeLimit: data.isProUser ? PRO_LIMIT : FREE_LIMIT,
          deepseekLimit: data.isProUser ? PRO_LIMIT : FREE_LIMIT,
        }));
      }
    } catch (error) {
      console.error("Failed to load usage:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // 增加使用次数
  const incrementUsage = useCallback(async (model: "claude" | "deepseek" = "deepseek") => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch("/api/user/usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });

      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({
          ...prev,
          used: data.used,
          claudeUsed: data.claudeUsed,
          deepseekUsed: data.deepseekUsed,
        }));
      }
    } catch (error) {
      console.error("Failed to increment usage:", error);
    }
  }, [session?.user?.email]);

  // 设置选中模型
  const setSelectedModel = useCallback((model: string) => {
    setStats(prev => ({ ...prev, selectedModel: model }));
  }, []);

  // 获取每周统计
  const getWeeklyStats = useCallback(() => {
    return { thisWeekCount: 0, lastWeekCount: 0 };
  }, []);

  return {
    ...stats,
    loading,
    incrementUsage,
    setSelectedModel,
    getWeeklyStats,
    refresh: loadStats,
  };
}
