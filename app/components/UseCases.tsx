"use client";

import { Zap, TrendingUp, Mail, Sparkles } from "lucide-react";

interface UseCase {
  icon: string;
  title: string;
  description: string;
  result: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: "📦",
    title: "Amazon Seller Listing Optimization",
    description: "输入产品信息，AI自动生成高转化五点描述和长描述",
    result: "平均提高点击率35%",
  },
  {
    icon: "📝",
    title: "Dropshipping Blog Writing",
    description: "根据关键词自动生成结构化长文，Google排名提升",
    result: "流量提升50%+",
  },
  {
    icon: "📧",
    title: "Email Marketing Sequences",
    description: "生成高转化欢迎邮件、弃购挽回、促销序列",
    result: "打开率提升28%",
  },
  {
    icon: "✨",
    title: "Creative Writing",
    description: "通过创意采访引擎，从模糊想法到完整故事大纲",
    result: "创作效率提升3倍",
  },
];

const ICON_MAP: Record<string, React.ElementType> = {
  Zap,
  TrendingUp,
  Mail,
  Sparkles,
};

export function UseCases() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4">
            Trusted by Creators Across Industries
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            See how Try AI Writer helps professionals in different fields
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map((useCase, index) => (
            <div
              key={useCase.title}
              className="glass-card p-6 group hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl mb-4">{useCase.icon}</div>
              <h3 className="text-xl font-display font-bold text-white mb-3">
                {useCase.title}
              </h3>
              <p className="text-slate-400 mb-4">
                {useCase.description}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                <span className="text-sm font-medium text-emerald-400">
                  {useCase.result}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/write"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            <Zap className="w-5 h-5" />
            Start Writing for Free
          </a>
        </div>
      </div>
    </section>
  );
}
