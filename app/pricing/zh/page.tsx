import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import CheckoutButton from "@/components/CheckoutButton";

export const metadata: Metadata = {
  title: "定价 — Use AI Writer | 从 ¥0 到 ¥199/月",
  description: "选择最适合你的套餐。免费版可用，看广告获得额外次数。无需信用卡。",
};

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  recommended?: boolean;
};

type FAQ = {
  question: string;
  answer: string;
};

const plans: Plan[] = [
  {
    name: "白嫖版",
    price: "¥0",
    description: "免费入门",
    features: ["0 Claude 次/月", "50 DeepSeek 次/天", "基础模板", "邮件支持"],
    cta: "开始使用",
  },
  {
    name: "基础版",
    price: "¥29",
    description: "个人日常使用",
    features: ["0 Claude 次/月", "无限 DeepSeek 次/天", "所有模板", "邮件支持"],
    cta: "开始基础版",
  },
  {
    name: "Pro 版",
    price: "¥79",
    description: "专业创作者",
    features: ["150 Claude 次/月", "无限 DeepSeek 次/天", "所有模板", "API 访问", "优先支持", "自定义语气"],
    cta: "开始 Pro 版",
    recommended: true,
  },
  {
    name: "Max 版",
    price: "¥199",
    description: "最受欢迎",
    features: ["500 Claude 次/月", "无限 DeepSeek 次/天", "所有模板", "API 访问", "优先支持", "自定义语气", "品牌套件"],
    cta: "开始 Max 版",
    popular: true,
  },
];

const faqs: FAQ[] = [
  { question: "我可以随时取消订阅吗？", answer: "是的，你可以随时取消订阅。没有隐藏费用，没有合同。" },
  { question: "什么算作一次生成？", answer: "每次点击生成并获得 AI 输出都算作一次生成。未使用的草稿也会计数。" },
  { question: "未使用的次数会累积吗？", answer: "不会，次数每天重置。未使用的不会延续到第二天。" },
  { question: "我的数据安全吗？", answer: "你的数据已加密，不会用于训练我们的 AI 模型。我们尊重你的隐私。" },
];

export default function PricingPage() {
  return (
    <main className="flex flex-col items-center w-full">
      {/* Header */}
      <section className="w-full max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl lg:text-6xl text-slate-900 dark:text-white mb-6">选择最适合你的套餐</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">从免费开始。需要更多功能时升级。</p>
      </section>

      {/* Pricing Cards */}
      <section className="w-full bg-slate-50 dark:bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card flex flex-col ${plan.recommended || plan.popular ? "border-2 border-emerald-600 relative" : ""}`}
              >
                {plan.recommended && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    推荐
                  </span>
                )}
                {plan.popular && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    最受欢迎
                  </span>
                )}
                <h3 className="text-2xl font-display font-extrabold mb-2">{plan.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{plan.description}</p>
                <p className="text-4xl font-bold mb-6">
                  {plan.price}
                  <span className="text-lg font-normal text-slate-500">/月</span>
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check size={18} className="text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.name === "白嫖版" ? (
                    <Link href="/login" className="btn-outline w-full">
                      {plan.cta}
                    </Link>
                  ) : (
                    <CheckoutButton
                      plan={
                        plan.name === "基础版" ? "basic" : plan.name === "Pro 版" ? "pro" : plan.name === "Max 版" ? "max" : "team"
                      }
                      currency="cny"
                      label={plan.cta}
                      variant={plan.recommended || plan.popular ? "primary" : "outline"}
                    />
                  )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="w-full max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-4 text-slate-700 dark:text-slate-300">
          <p><strong>Claude</strong> 为海外顶级 AI 写作模型，写作质量公认最佳</p>
          <p><strong>DeepSeek</strong> 为国产优秀模型，中文写作流畅自然</p>
          <p>所有套餐按月计费，到期自动续费，可随时取消</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-3xl mx-auto px-4 py-24">
        <h2 className="text-4xl text-center mb-12 font-display font-extrabold">常见问题</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="card group cursor-pointer"
            >
              <summary className="flex items-center justify-between list-none text-lg font-semibold text-slate-900 dark:text-white">
                {faq.question}
                <ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="text-slate-600 dark:text-slate-400 mt-4">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full bg-slate-900 dark:bg-gray-950 py-24">
        <div className="max-w-2xl mx-auto text-center px-4 space-y-6">
          <h2 className="text-4xl text-white">准备好写作快 3 倍了吗？</h2>
          <p className="text-xl text-slate-300">已有 100+ 创作者在使用 Use AI Writer。</p>
          <Link href="/login" className="btn-primary text-lg px-10 py-4">免费开始写作</Link>
        </div>
      </section>
    </main>
  );
}
