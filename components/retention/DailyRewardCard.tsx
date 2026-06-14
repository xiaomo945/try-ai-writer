"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface DailyReward {
  id: string;
  userId: string;
  loginStreak: number;
  lastLoginDate: string;
  totalRewards: number;
  claimedRewards: Array<{
    date: string;
    rewardType: string;
    rewardValue: number;
  }>;
}

interface StreakInfo {
  currentStreak: number;
  canClaim: boolean;
  streak: number;
  nextReward: {
    streakDays: number;
    description: string;
  } | null;
}

export function useDailyReward() {
  const { data: session } = useSession();
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      checkStreak();
    }
  }, [session]);

  const checkStreak = async () => {
    try {
      const res = await fetch("/api/daily-rewards");
      const data = await res.json();
      setStreakInfo(data);
    } catch (error) {
      console.error("Failed to check streak:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async () => {
    try {
      const res = await fetch("/api/daily-rewards", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await checkStreak();
      }
      return data;
    } catch (error) {
      console.error("Failed to claim reward:", error);
      return null;
    }
  };

  return {
    streakInfo,
    loading,
    checkStreak,
    claimReward,
  };
}

export function DailyRewardCard() {
  const { streakInfo, loading, claimReward } = useDailyReward();
  const [showClaimed, setShowClaimed] = useState(false);
  const [claimedReward, setClaimedReward] = useState<{
    rewardType: string;
    rewardValue: number;
  } | null>(null);

  const handleClaim = async () => {
    const result = await claimReward();
    if (result?.success && result.claimedReward) {
      setClaimedReward(result.claimedReward);
      setShowClaimed(true);
      setTimeout(() => setShowClaimed(false), 3000);
    }
  };

  if (loading || !streakInfo) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 animate-pulse">
        <div className="h-24"></div>
      </div>
    );
  }

  const { currentStreak, canClaim, nextReward } = streakInfo;

  const rewardMilestones = [1, 3, 7, 14, 30];
  const progress = (currentStreak / 30) * 100;

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">每日登录奖励</h3>
            <p className="text-sm opacity-90 mt-1">连续登录获得更多奖励</p>
          </div>
          <div className="text-4xl">🎁</div>
        </div>

        {/* Streak display */}
        <div className="bg-white/20 rounded-xl p-4 mb-4 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">当前连续</span>
            <span className="text-2xl font-bold">{currentStreak} 天</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {rewardMilestones.map((days) => (
            <div
              key={days}
              className={`text-center p-2 rounded-lg ${
                currentStreak >= days ? "bg-white/30" : "bg-white/10"
              }`}
            >
              <div className="text-xs opacity-90">{days}天</div>
              <div className="text-lg">{currentStreak >= days ? "✓" : "🔒"}</div>
            </div>
          ))}
        </div>

        {/* Claim button */}
        {canClaim ? (
          <button
            onClick={handleClaim}
            className="w-full py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg"
          >
            领取今日奖励
          </button>
        ) : (
          <div className="w-full py-3 bg-white/20 text-white rounded-xl font-semibold text-center">
            今日已领取 ✓
          </div>
        )}

        {/* Next reward hint */}
        {nextReward && (
          <p className="text-xs opacity-90 mt-3 text-center">
            再连续登录 {nextReward.streakDays - currentStreak} 天可获得：
            {nextReward.description}
          </p>
        )}
      </div>

      {/* Claimed notification */}
      {showClaimed && claimedReward && (
        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <div className="text-center text-white">
            <div className="text-5xl mb-3">🎉</div>
            <h4 className="text-xl font-bold mb-2">奖励已领取！</h4>
            <p className="text-sm opacity-90">
              {claimedReward.rewardType === "credits" &&
                `获得 ${claimedReward.rewardValue} 积分`}
              {claimedReward.rewardType === "feature_access" &&
                `解锁高级功能 ${claimedReward.rewardValue} 天`}
              {claimedReward.rewardType === "discount" &&
                `获得 ${claimedReward.rewardValue}% 折扣券`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
