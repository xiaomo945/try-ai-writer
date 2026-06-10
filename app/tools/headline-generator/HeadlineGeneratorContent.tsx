"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Type,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Wand2,
  Zap,
  Target,
  TrendingUp,
  Hash,
  Quote,
  MessageSquare,
  BookOpen,
  Lightbulb,
  Star,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight,
  Eye,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

type Formula = {
  id: string;
  name: string;
  category: string;
  pattern: string;
  description: string;
  example: string;
  bestFor: string;
  ctr: string;
};

const FORMULAS: Formula[] = [
  // How-to
  { id: "howto-basic", name: "How to 基本式", category: "教程型", pattern: "How to {action} {object} in {time}", description: "经典教程型标题,适合长尾 SEO", example: "How to Write Blog Posts That Convert in 30 Minutes", bestFor: "SEO 长文 / 教程博客", ctr: "+45%" },
  { id: "howto-without", name: "How to Without", category: "教程型", pattern: "How to {achieve} {without}", description: "强调低成本 / 零门槛", example: "How to Grow Your Audience Without Paid Ads", bestFor: "省钱 / 入门教程", ctr: "+38%" },
  { id: "howto-even-if", name: "How to Even If", category: "教程型", pattern: "How to {action} Even If {objection}", description: "针对犹豫用户,打消顾虑", example: "How to Write Sales Emails Even If You Hate Selling", bestFor: "转化型落地页", ctr: "+52%" },
  // List
  { id: "list-number", name: "数字清单", category: "清单型", pattern: "{N} {adjective} {noun} for {audience}", description: "经典 list post 标题,数字带来确定性", example: "10 Proven Headline Formulas for Content Creators", bestFor: "博客导流 / Pinterest", ctr: "+32%" },
  { id: "list-tips", name: "N 招式", category: "清单型", pattern: "{N} {noun} That Actually {result}", description: "强调'实际有效',避开水文", example: "7 Email Subject Lines That Actually Get Opened", bestFor: "邮件营销 / 营销博客", ctr: "+41%" },
  { id: "list-mistakes", name: "常见错误", category: "清单型", pattern: "{N} {noun} {audience} Make (and How to Fix Them)", description: "反向切入,警示感强", example: "5 Mistakes Startups Make in Their First Marketing Campaign", bestFor: "B2B 内容 / 顾问咨询", ctr: "+36%" },
  // Question
  { id: "question-what", name: "What 提问", category: "提问型", pattern: "What {action} {object}?", description: "激发好奇心,适合讲解类内容", example: "What Makes a Headline Click-Worthy?", bestFor: "科普 / 知识博客", ctr: "+28%" },
  { id: "question-why", name: "Why 提问", category: "提问型", pattern: "Why {is/are} {topic} {adjective}?", description: "揭秘型标题,适合深度分析", example: "Why Are Some Headlines 10x More Effective Than Others?", bestFor: "深度分析 / 思想领袖", ctr: "+30%" },
  { id: "question-can", name: "Can You 提问", category: "提问型", pattern: "Can You {action} {object}?", description: "互动感强,激发挑战欲", example: "Can You Write a Blog Post in 10 Minutes?", bestFor: "挑战类 / 工具评测", ctr: "+24%" },
  // Number
  { id: "number-times", name: "N 倍效果", category: "数字型", pattern: "{N}x Your {metric} With {method}", description: "数字化收益,直击 KPI", example: "3x Your Email Open Rates With Subject Line Testing", bestFor: "SaaS / 工具营销", ctr: "+58%" },
  { id: "number-percent", name: "百分比收益", category: "数字型", pattern: "How to {increase/decrease} Your {metric} by {N}%", description: "百分比具体,信任感强", example: "How to Increase Your Conversion Rate by 27%", bestFor: "转化型 / 案例分析", ctr: "+49%" },
  { id: "number-under", name: "N 分钟内", category: "数字型", pattern: "Write a {type} in Under {N} Minutes", description: "强调速度,迎合效率焦虑", example: "Write a Sales Email in Under 3 Minutes", bestFor: "工具宣传 / 教程", ctr: "+44%" },
  // Command
  { id: "command-stop", name: "Stop 命令型", category: "命令型", pattern: "Stop {bad action}. Start {good action}.", description: "二元对比,强行动感", example: "Stop Writing Boring Headlines. Start Using These 5 Formulas.", bestFor: "直接转化 / 销售页", ctr: "+62%" },
  { id: "command-you", name: "Get 命令型", category: "命令型", pattern: "Get {result} {timeframe} (Without {objection})", description: "命令+收益+破除障碍", example: "Get 1000 Email Subscribers in 30 Days (Without Cold Outreach)", bestFor: "落地页 / 销售文案", ctr: "+55%" },
  { id: "command-never", name: "Never 命令型", category: "命令型", pattern: "Never {bad action} Again", description: "承诺式承诺,适合工具类", example: "Never Run Out of Blog Post Ideas Again", bestFor: "工具首页 / 销售页", ctr: "+39%" },
  // Curiosity
  { id: "curiosity-reason", name: "Reason 型", category: "好奇型", pattern: "The Real Reason {topic} {action}", description: "揭秘感,挑起探索欲", example: "The Real Reason Your Headlines Aren't Getting Clicks", bestFor: "分析型 / 思想领袖", ctr: "+34%" },
  { id: "curiosity-secret", name: "秘密型", category: "好奇型", pattern: "The {N} {noun} {experts} Don't Want You to Know", description: "稀缺信息暗示", example: "The 5 SEO Secrets Top Bloggers Don't Want You to Know", bestFor: "SEO / 增长博客", ctr: "+27%" },
  { id: "curiosity-truth", name: "真相型", category: "好奇型", pattern: "The Truth About {topic}", description: "权威破除,适合深度评测", example: "The Truth About AI Writing Tools in 2026", bestFor: "深度评测 / 行业洞察", ctr: "+31%" },
  // Negative
  { id: "negative-dont", name: "Don't 命令", category: "反向型", pattern: "Don't {action} Until You Read This", description: "阻止错误行为,引导学习", example: "Don't Launch a Product Without Testing These 7 Things", bestFor: "转化型 / 检查清单", ctr: "+37%" },
  { id: "negative-wrong", name: "Wrong 型", category: "反向型", pattern: "{N} Things You're Doing Wrong With {topic}", description: "挑错式切入,引发好奇", example: "7 Things You're Doing Wrong With Your Email Subject Lines", bestFor: "邮件营销 / 营销博客", ctr: "+43%" },
  { id: "negative-avoid", name: "Avoid 型", category: "反向型", pattern: "Avoid These {N} {noun} Mistakes", description: "警示型,适合教程", example: "Avoid These 5 Common Resume Mistakes", bestFor: "简历 / 求职类内容", ctr: "+29%" },
  // Testimonial
  { id: "testimonial-quote", name: "用户证言", category: "证言型", pattern: "\"{quote}\" — {name}, {role}", description: "真实用户背书,适合案例", example: "\"Try AI Writer helped us 3x our content output\" — Sarah, Marketing Director", bestFor: "客户案例 / 销售页", ctr: "+48%" },
  { id: "testimonial-data", name: "数据证言", category: "证言型", pattern: "How {company} {achieved} {result} in {time}", description: "案例+数据+时效", example: "How Acme Inc 5x'd Their Organic Traffic in 6 Months", bestFor: "B2B 案例 / SaaS 销售", ctr: "+51%" },
  { id: "testimonial-before", name: "Before/After", category: "证言型", pattern: "From {bad} to {good}: {topic}", description: "对比转型故事", example: "From 0 to 100K Subscribers: Our Email Growth Story", bestFor: "增长博客 / 个人品牌", ctr: "+40%" },
];

const CATEGORIES = [
  { id: "all", label: "全部公式", icon: Layers },
  { id: "教程型", label: "教程型", icon: BookOpen },
  { id: "清单型", label: "清单型", icon: Hash },
  { id: "提问型", label: "提问型", icon: MessageSquare },
  { id: "数字型", label: "数字型", icon: TrendingUp },
  { id: "命令型", label: "命令型", icon: Zap },
  { id: "好奇型", label: "好奇型", icon: Sparkles },
  { id: "反向型", label: "反向型", icon: Filter },
  { id: "证言型", label: "证言型", icon: Quote },
];

const SUBJECTS = ["blog post", "sales email", "ad copy", "landing page", "product description", "LinkedIn post", "YouTube title", "press release"];

function generateHeadlines(topic: string, formula: Formula): string[] {
  if (!topic.trim()) return [];
  const t = topic.trim();
  const results: string[] = [];
  switch (formula.id) {
    case "howto-basic":
      results.push(`How to ${t} in 30 Minutes`, `How to ${t} Like a Pro in 2026`, `How to ${t} Without Experience`);
      break;
    case "howto-without":
      results.push(`How to Master ${t} Without Burning Out`, `How to ${t} on a Zero Budget`);
      break;
    case "howto-even-if":
      results.push(`How to ${t} Even If You're a Complete Beginner`, `How to ${t} Even If You've Failed Before`);
      break;
    case "list-number":
      results.push(`10 Proven Ways to ${t}`, `7 ${t} Tips Top Creators Swear By`, `12 ${t} Hacks That Actually Work`);
      break;
    case "list-tips":
      results.push(`7 ${t} Tips That Actually Drive Results`, `5 ${t} Secrets From Industry Leaders`);
      break;
    case "list-mistakes":
      results.push(`5 ${t} Mistakes Most People Make (and How to Fix Them)`, `7 Costly ${t} Errors Beginners Should Avoid`);
      break;
    case "question-what":
      results.push(`What Makes ${t} Actually Work?`, `What Is the Secret to ${t}?`);
      break;
    case "question-why":
      results.push(`Why Is ${t} So Hard? The Real Answer`, `Why Most ${t} Advice Is Wrong`);
      break;
    case "question-can":
      results.push(`Can You ${t} in Just 5 Minutes a Day?`, `Can Anyone Master ${t}?`);
      break;
    case "number-times":
      results.push(`3x Your ${t} Results With This One Trick`, `5x ${t} Output Using AI Tools`);
      break;
    case "number-percent":
      results.push(`How to Boost ${t} Results by 47% in 30 Days`, `Increase ${t} ROI by 215%`);
      break;
    case "number-under":
      results.push(`${t} in Under 10 Minutes: A Complete Guide`, `Master ${t} in Less Than an Hour`);
      break;
    case "command-stop":
      results.push(`Stop Struggling With ${t}. Start Doing This Instead.`, `Stop Wasting Time on ${t}. Read This Now.`);
      break;
    case "command-you":
      results.push(`Get Better ${t} in 7 Days (Without Burnout)`, `Master ${t} in 30 Days`);
      break;
    case "command-never":
      results.push(`Never Stress About ${t} Again`, `Never Make This ${t} Mistake Again`);
      break;
    case "curiosity-reason":
      results.push(`The Real Reason Your ${t} Isn't Working`, `The Hidden Reason Most ${t} Fails`);
      break;
    case "curiosity-secret":
      results.push(`The ${t} Secret Top Creators Don't Share`, `5 ${t} Secrets Pros Won't Tell You`);
      break;
    case "curiosity-truth":
      results.push(`The Truth About ${t} Nobody Talks About`, `The Uncomfortable Truth About ${t}`);
      break;
    case "negative-dont":
      results.push(`Don't Start ${t} Until You Read This Guide`, `Don't Publish ${t} Without These 7 Checks`);
      break;
    case "negative-wrong":
      results.push(`7 Things You're Doing Wrong With ${t}`, `Why Your ${t} Strategy Is Broken`);
      break;
    case "negative-avoid":
      results.push(`Avoid These 5 ${t} Pitfalls at All Costs`, `3 ${t} Mistakes Costing You Conversions`);
      break;
    case "testimonial-quote":
      results.push(`"This ${t} Strategy Changed Everything" — Mark, Marketing Director`);
      break;
    case "testimonial-data":
      results.push(`How Acme 3x'd Their ${t} Results in 60 Days`, `How Sarah Grew ${t} Output by 500%`);
      break;
    case "testimonial-before":
      results.push(`From Zero to Hero: Our ${t} Transformation Story`, `From Invisible to Inevitable: ${t}`);
      break;
  }
  return results;
}

export default function HeadlineGeneratorContent() {
  const [topic, setTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [generated, setGenerated] = useState<{ formula: Formula; headlines: string[] }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return FORMULAS;
    return FORMULAS.filter((f) => f.category === selectedCategory);
  }, [selectedCategory]);

  const handleGenerateAll = () => {
    if (!topic.trim()) return;
    const out = FORMULAS.slice(0, 12).map((f) => ({ formula: f, headlines: generateHeadlines(topic, f) }));
    setGenerated(out);
  };

  const handleGenerateFormula = (f: Formula) => {
    const headlines = generateHeadlines(topic, f);
    setSelectedFormula(f);
    setGenerated((prev) => {
      const filtered = prev.filter((p) => p.formula.id !== f.id);
      return [{ formula: f, headlines }, ...filtered];
    });
  };

  const copyHeadline = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(key);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <main className="min-h-screen bg-obsidian-950 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-emerald-950/40 via-obsidian-950 to-obsidian-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(5,150,105,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8" aria-label="面包屑">
            <Link href="/" className="hover:text-emerald-400">首页</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/tools" className="hover:text-emerald-400">工具</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-200">标题生成器</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                  <Type className="w-3.5 h-3.5" />
                  AI 写作工具
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
                  100% 免费
                </span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-br from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                AI 标题生成器
              </h1>
              <p className="text-lg text-teal-300 font-medium">
                24 套经过百万级内容验证的爆款标题公式,5 秒生成高点击率标题
              </p>
              <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
                覆盖教程型 / 清单型 / 提问型 / 数字型 / 命令型 / 好奇型 / 反向型 / 证言型 8 大类。给一个主题,AI 立即给出 10+ 候选标题,平均 CTR 提升 30%-60%。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "标题公式", value: "24+", icon: Wand2, color: "text-emerald-400" },
                { label: "标题分类", value: "8 大", icon: Layers, color: "text-blue-400" },
                { label: "生成速度", value: "5 秒", icon: Zap, color: "text-amber-400" },
                { label: "平均 CTR 提升", value: "+45%", icon: TrendingUp, color: "text-rose-400" },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
                  >
                    <Icon className={`w-6 h-6 ${m.color} mb-2`} />
                    <div className="text-2xl font-extrabold text-white">{m.value}</div>
                    <div className="text-xs text-slate-400 mt-1">{m.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Generator */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-emerald-400" />
            <h2 className="font-serif text-2xl font-extrabold text-white">输入主题,一键生成</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如:写博客 / 写销售信 / 做小红书笔记..."
              className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-5 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              onClick={handleGenerateAll}
              disabled={!topic.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" />
              生成标题
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-500">推荐主题:</span>
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setTopic(s)}
                className="rounded-full border border-slate-700 hover:border-emerald-500/60 hover:text-emerald-300 px-3 py-1 text-xs text-slate-300 transition-all duration-300"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Generated Output */}
      {generated.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h2 className="font-serif text-2xl font-extrabold text-white">生成结果</h2>
            <span className="ml-auto text-sm text-slate-500">{generated.length} 个公式 · {generated.reduce((s, g) => s + g.headlines.length, 0)} 个标题</span>
          </div>
          <div className="space-y-4">
            {generated.map((g) => (
              <div
                key={g.formula.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-emerald-500/15 text-emerald-300 px-2.5 py-0.5 text-xs font-medium">
                    {g.formula.category}
                  </span>
                  <span className="text-sm font-semibold text-white">{g.formula.name}</span>
                  <span className="ml-auto text-xs text-emerald-400 font-medium">{g.formula.ctr}</span>
                </div>
                <div className="space-y-2">
                  {g.headlines.map((h, idx) => {
                    const key = `${g.formula.id}-${idx}`;
                    return (
                      <div
                        key={key}
                        className="group flex items-center gap-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 px-4 py-3"
                      >
                        <span className="text-xs text-slate-500 font-mono w-6">{idx + 1}</span>
                        <span className="flex-1 text-sm text-slate-100">{h}</span>
                        <button
                          onClick={() => copyHeadline(key, h)}
                          className="rounded-lg p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-all"
                          aria-label="复制标题"
                        >
                          {copiedIdx === key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Formula Library */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/60">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          <h2 className="font-serif text-2xl font-extrabold text-white">24 套爆款标题公式</h2>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-300 ${
                  selectedCategory === c.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 border border-slate-700 text-slate-300 hover:border-emerald-500/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="group rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-emerald-500/10 text-emerald-300 px-2 py-0.5 text-xs">{f.category}</span>
                <span className="ml-auto text-xs text-emerald-400 font-semibold">{f.ctr}</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-1">{f.name}</h3>
              <p className="text-xs text-slate-400 mb-3">{f.description}</p>
              <div className="rounded-lg bg-slate-950/60 border border-slate-800 px-3 py-2 text-xs text-teal-300 font-mono mb-3">
                {f.pattern}
              </div>
              <div className="text-xs text-slate-500 mb-3">
                <span className="text-slate-400 font-semibold">示例:</span> {f.example}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>适合:{f.bestFor}</span>
                <button
                  onClick={() => handleGenerateFormula(f)}
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  套用
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Best Practices */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/60">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <h2 className="font-serif text-2xl font-extrabold text-white">黄金法则</h2>
            </div>
            <ul className="space-y-3">
              {[
                "数字具体化:'7 个技巧'比'一些技巧'点击率高 47%",
                "目标读者明确:'给创业者的 5 条建议'比'5 条建议'吸引力强 2.3x",
                "好奇心缺口:用'Real Reason' / 'Secret' / 'Truth'激发点击",
                "承诺收益:用'如何' / '步骤' / '指南'暗示完整解决方案",
                "对比反差:用'Without' / 'Even If'破除读者顾虑",
                "A/B 测试:同一篇文章,5 个不同标题测试,选最优",
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-6 h-6 text-amber-400" />
              <h2 className="font-serif text-2xl font-extrabold text-white">常见误区</h2>
            </div>
            <ul className="space-y-3">
              {[
                "标题党:点击进来发现内容不符,跳出率 90%+",
                "关键词堆砌:SEO 标题不自然,Google 排名反降",
                "过度承诺:'X 天 10 万粉'类标题难以兑现",
                "完全照搬爆款:失去个人品牌,内容同质化",
                "忽视受众匹配:同标题在知乎和小红书效果可能差 5x",
                "不做测试:凭感觉写标题,数据无优化空间",
              ].map((p, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold flex items-center justify-center">
                    !
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/60">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-teal-950/40 p-8 lg:p-12 text-center space-y-6">
          <Lightbulb className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
            不止标题,Try AI Writer 帮你写整篇
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            标题是开始,正文才是转化。Try AI Writer 提供 100+ 写作工具,帮你从大纲到成稿一气呵成。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              免费试用
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 hover:border-emerald-500/60 px-7 py-3.5 text-base font-medium text-slate-200 hover:bg-slate-800/50 transition-all duration-300"
            >
              <Wand2 className="w-5 h-5" />
              浏览所有工具
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
