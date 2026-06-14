"use client";

import { useState } from "react";

interface FeaturePreviewProps {
  feature: string;
  title: string;
  description: string;
  icon: string;
  proOnly?: boolean;
}

export function FeaturePreview({
  feature,
  title,
  description,
  icon,
  proOnly = true,
}: FeaturePreviewProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  return (
    <>
      <div className="relative group">
        <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 transition-all cursor-pointer">
          {/* Pro Badge */}
          {proOnly && (
            <div className="absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full">
              专业版
            </div>
          )}

          {/* Icon */}
          <div className="text-4xl mb-4">{icon}</div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>

          {/* Lock overlay */}
          {proOnly && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsUpgradeModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
              >
                解锁此功能
              </button>
            </div>
          )}
        </div>
      </div>

      {isUpgradeModalOpen && (
        <UpgradeModal
          feature={feature}
          onClose={() => setIsUpgradeModalOpen(false)}
        />
      )}
    </>
  );
}

export function ProFeatureGrid() {
  const features = [
    {
      feature: "brand_voice",
      title: "品牌声音管理",
      description: "创建和管理多个品牌声音，让AI生成的内容更符合您的品牌风格",
      icon: "🎨",
    },
    {
      feature: "advanced_templates",
      title: "高级模板库",
      description: "访问50+专业模板，覆盖营销、商务、社交媒体等场景",
      icon: "📚",
    },
    {
      feature: "team_collaboration",
      title: "团队协作",
      description: "邀请团队成员共同管理内容，提升协作效率",
      icon: "👥",
    },
    {
      feature: "analytics",
      title: "高级分析",
      description: "深入了解内容表现，获取优化建议",
      icon: "📊",
    },
    {
      feature: "api_access",
      title: "API访问",
      description: "通过API集成到您的工作流程中",
      icon: "🔌",
    },
    {
      feature: "priority_support",
      title: "优先支持",
      description: "享受专属客服支持，快速解决问题",
      icon: "💬",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature) => (
        <FeaturePreview key={feature.feature} {...feature} />
      ))}
    </div>
  );
}

function UpgradeModal({
  feature,
  onClose,
}: {
  feature: string;
  onClose: () => void;
}) {
  const featureNames: Record<string, string> = {
    brand_voice: "品牌声音管理",
    advanced_templates: "高级模板库",
    team_collaboration: "团队协作",
    analytics: "高级分析",
    api_access: "API访问",
    priority_support: "优先支持",
  };

  const featureName = featureNames[feature] || feature;

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
              解锁{featureName}
            </h3>
            <p className="text-gray-600">
              升级专业版即可使用{featureName}功能
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
