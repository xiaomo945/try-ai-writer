"use client";

import { ScrollReveal } from "./ScrollReveal";

interface UseCase {
  id: number;
  icon: string;
  title: string;
  description: string;
  result: string;
}

const useCases: UseCase[] = [
  {
    id: 1,
    icon: "📦",
    title: "Amazon Sellers",
    description: "输入产品信息，AI自动生成高转化五点描述和长描述",
    result: "平均提高点击率 35%"
  },
  {
    id: 2,
    icon: "📝",
    title: "独立站运营",
    description: "根据关键词自动生成结构化长文，Google排名提升",
    result: "流量提升 50%+"
  },
  {
    id: 3,
    icon: "📧",
    title: "邮件营销",
    description: "生成高转化欢迎邮件、弃购挽回、促销序列",
    result: "打开率提升 28%"
  },
  {
    id: 4,
    icon: "✨",
    title: "创意写作",
    description: "通过创意采访引擎，从模糊想法到完整故事大纲",
    result: "创作效率提升 3倍"
  }
];

export function UseCases() {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-2">
              Trusted by Creators Across Industries
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              See how Use AI Writer helps professionals in different fields
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <ScrollReveal key={useCase.id} delay={index * 150}>
              <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 ease-out group">
                <div className="text-4xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-slate-300 mb-3">
                  {useCase.description}
                </p>
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-emerald-400 font-semibold">
                    {useCase.result}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
