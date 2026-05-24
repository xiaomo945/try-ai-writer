"use client";

import { useState, useEffect } from "react";
import { useUsage } from "@/lib/usage";

export function AdReward() {
  const { watchAd, canWatchAd, adWatched, maxAdWatches, adBonus } = useUsage();
  const [isWatching, setIsWatching] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleWatchAd = () => {
    if (!canWatchAd) return;
    setIsWatching(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (!isWatching) return;
    if (countdown <= 0) {
      setIsWatching(false);
      const success = watchAd();
      if (success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [isWatching, countdown, watchAd]);

  if (!canWatchAd && adWatched >= maxAdWatches) {
    return (
      <div className="card">
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
          今日广告次数已用完，已获得 +{adBonus} 次额外生成！
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      {showSuccess && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm text-center">
          🎉 恭喜！已获得 +5 次额外生成！
        </div>
      )}
      {isWatching ? (
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            观看广告中...
          </p>
          <p className="text-4xl font-bold text-emerald-600">{countdown}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            （这是模拟广告，预留 Google AdMob 接入点）
          </p>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <p className="text-slate-700 dark:text-slate-300">
            观看广告获得额外 5 次 DeepSeek 生成！
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            今日已观看 {adWatched}/{maxAdWatches} 次
          </p>
          <button
            onClick={handleWatchAd}
            disabled={!canWatchAd}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            看广告获得 +5 次
          </button>
        </div>
      )}
    </div>
  );
}
