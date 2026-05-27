"use client";

interface WritingExample {
  id: string;
  title: string;
  description: string;
  expectedResult: string;
  prompt: string;
}

const examples: WritingExample[] = [
  {
    id: "amazon-listing",
    title: "亚马逊Listing优化",
    description: "输入产品信息，30秒生成高转化亚马逊五点描述",
    expectedResult: "输入产品信息 → AI自动提取卖点 → 生成高转化五点描述",
    prompt: "帮我写一个亚马逊产品五点描述，产品是无线蓝牙耳机，特点是：续航20小时，防水IPX7，主动降噪，舒适佩戴，适合运动使用"
  },
  {
    id: "shopify-blog-seo",
    title: "独立站SEO博客",
    description: "生成针对Shopify店铺的SEO优化博客文章，提升搜索排名",
    expectedResult: "输入关键词 → AI分析搜索意图 → 生成结构化长文",
    prompt: "帮我写一篇1000字左右的SEO优化博客，主题是：2026年如何用内容营销提升Shopify店铺流量，关键词：Shopify SEO、内容营销、电商博客"
  },
  {
    id: "google-ads-copy",
    title: "Google Ads文案",
    description: "写高点击率的Google Ads广告文案，包含标题和描述",
    expectedResult: "输入产品优势 → AI匹配用户痛点 → 生成高CTR广告语",
    prompt: "帮我写3组Google Ads文案，产品是在线AI写作工具，特点是：10秒生成、品牌声音一致、支持SEO优化，面向内容创作者"
  }
];

interface WritingExamplesProps {
  onSelectExample: (prompt: string) => void;
}

export function WritingExamples({ onSelectExample }: WritingExamplesProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {examples.map((example) => (
        <button
          key={example.id}
          onClick={() => onSelectExample(example.prompt)}
          className="card text-left hover:border-emerald-300 hover:shadow-lg transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              ✨
            </div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-1">
                {example.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {example.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 mb-3 bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                <span className="text-emerald-500">→</span>
                {example.expectedResult}
              </div>
              <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                试试这个 →
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
