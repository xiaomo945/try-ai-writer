"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UsageLimit {
  id: string;
  userId: string;
  feature: string;
  used: number;
  limit: number;
  resetAt: string;
}

interface UsageCheckResult {
  canUse: boolean;
  usageLimit: UsageLimit | null;
  remaining: number;
}

const FEATURE_NAMES: Record<string, string> = {
  ai_generation: "AI生成",
  brand_voice: "品牌声音",
  template_access: "模板访问",
};

export function useUsageLimit(feature: string) {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageCheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id && feature) {
      checkUsage();
    }
  }, [session, feature]);

  const checkUsage = async () => {
    try {
      const res = await fetch(`/api/usage-limits?feature=${feature}`);
      const data = await res.json();
      setUsage(data);
    } catch (error) {
      console.error("Failed to check usage:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (amount: number = 1) => {
    try {
      const res = await fetch("/api/usage-limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, amount }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setUsage({
          canUse: false,
          usageLimit: data.usageLimit,
          remaining: 0,
        });
        return false;
      }

      const data = await res.json();
      setUsage(data);
      return data.success;
    } catch (error) {
      console.error("Failed to increment usage:", error);
      return false;
    }
  };

  return {
    usage,
    loading,
    checkUsage,
    incrementUsage,
  };
}

export function UsageLimitBanner({ feature }: { feature: string }) {
  const { usage, loading } = useUsageLimit(feature);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  if (loading || !usage || !usage.usageLimit) {
    return null;
  }

  const { usageLimit, remaining } = usage;
  const featureName = FEATURE_NAMES[feature] || feature;
  const isUnlimited = usageLimit.limit === -1;
  const isLow = !isUnlimited && remaining <= 2;
  const isExhausted = !isUnlimited && remaining <= 0;

  if (isUnlimited) {
    return null;
  }

  if (isExhausted) {
    return (
      <>
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">已达到使用上限</h3>
              <p className="text-sm opacity-90 mt-1">
                您的{featureName}次数已用完，升级专业版享受无限使用
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="mt-3 px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                立即升级
              </button>
            </div>
          </div>
        </div>
        {showUpgradeModal && (
          <UpgradeModal
            feature={feature}
            onClose={() => setShowUpgradeModal(false)}
          />
        )}
      </>
    );
  }

  if (isLow) {
    return (
      <>
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">使用次数即将用完</h3>
              <p className="text-sm opacity-90 mt-1">
                您还剩 {remaining} 次{featureName}机会
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300"
                    style={{
                      width: `${(usageLimit.used / usageLimit.limit) * 100}%`,
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-4 py-2 bg-white text-orange-600 rounded-lg font-medium hover:bg-orange-50 transition-colors whitespace-nowrap"
                >
                  升级专业版
                </button>
              </div>
            </div>
          </div>
        </div>
        {showUpgradeModal && (
          <UpgradeModal
            feature={feature}
            onClose={() => setShowUpgradeModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-blue-900">
            今日{featureName}：剩余 {remaining} / {usageLimit.limit} 次
          </span>
        </div>
        <div className="h-2 w-24 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(usageLimit.used / usageLimit.limit) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function UpgradeModal({
  feature,
  onClose,
}: {
  feature: string;
  onClose: () => void;
}) {
  const featureName = FEATURE_NAMES[feature] || feature;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">升级专业版</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🚀</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              解锁无限{featureName}
            </h3>
            <p className="text-gray-600">
              您的免费{featureName}次数已用完，升级专业版享受无限使用
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">无限AI生成</p>
                <p className="text-sm text-gray-600">不再受每日限制</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">10个品牌声音</p>
                <p className="text-sm text-gray-600">管理多个品牌风格</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">全部模板访问</p>
                <p className="text-sm text-gray-600">50+专业模板随意使用</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg">
              立即升级 ¥99/月
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              稍后再说
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
