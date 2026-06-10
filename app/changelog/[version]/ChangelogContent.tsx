"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  Calendar,
  Tag,
  Zap,
  Bug,
  Wrench,
  Plus,
  ArrowUp,
  Star,
  Rocket,
  Shield,
  Layers,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  Heart,
  Code2,
  PaintBucket,
  Mic,
  MessageSquare,
  Globe,
  Cpu,
} from "lucide-react";

type Props = { params: Promise<{ version: string }> };

type Change = {
  type: "new" | "improved" | "fixed" | "security";
  title: string;
  desc: string;
};

type Version = {
  version: string;
  date: string;
  status: "stable" | "beta" | "deprecated";
  codename: string;
  highlights: string[];
  changes: Change[];
  metrics: { label: string; value: string; change: string }[];
  breakingChanges: string[];
  deprecations: string[];
};

const VERSIONS: Record<string, Version> = {
  "3-2": {
    version: "v3.2.0",
    date: "2026-06-08",
    status: "stable",
    codename: "Phoenix",
    highlights: [
      "全新 AI 翻译工具上线,支持 12 种主流语言 × 6 种翻译风格",
      "标题生成器升级,新增 24 套爆款公式",
      "客户案例按行业分类,12 大行业全覆盖",
      "竞品对比页上线,10 款主流 AI 写作工具全面对比",
    ],
    changes: [
      { type: "new", title: "AI 翻译工具", desc: "支持中英日韩法德西葡俄阿意 12 种语言,6 种翻译风格(直译/流畅/本地化/创意/专业/文学),7 大场景适配" },
      { type: "new", title: "标题生成器 2.0", desc: "24 套爆款公式,8 大类(教程/清单/提问/数字/命令/好奇/反向/证言),AI 自动套用" },
      { type: "new", title: "客户案例行业页", desc: "12 大行业(电商/SaaS/教育/金融/医疗/法律/营销等)客户故事与转化数据" },
      { type: "new", title: "竞品对比页", desc: "Jasper / Copy.ai / Writesonic / Rytr / Sudowrite / Notion AI / ChatGPT / Claude / Grammarly / QuillBot 全面对比" },
      { type: "new", title: "学院学习路径", desc: "6 大路径(内容/营销/文案/设计/视频/增长),8 周系统化学习" },
      { type: "improved", title: "首页性能", desc: "Lighthouse 性能分从 89 提升至 96,首屏渲染时间 -42%" },
      { type: "improved", title: "SEO 优化", desc: "新增 39 条静态预渲染页面,搜索引擎收录速度 +180%" },
      { type: "improved", title: "AI 大纲生成", desc: "支持 8 级大纲深度,大纲结构更清晰" },
      { type: "fixed", title: "修复 dashboard 类型错误", desc: "topMode[0] 在 noUncheckedIndexedAccess 下 undefined 的问题" },
      { type: "fixed", title: "修复翻译工具语言切换闪烁", desc: "语言切换时不再出现中间状态" },
      { type: "fixed", title: "修复写作页面 iOS Safari 输入框抖动", desc: "iOS 16+ 浏览器输入框焦点管理优化" },
      { type: "security", title: "升级依赖库", desc: "修复 npm audit 报告的 2 个低危漏洞" },
    ],
    metrics: [
      { label: "总模块数", value: "80+", change: "+4" },
      { label: "工具数量", value: "100+", change: "+12" },
      { label: "模板数量", value: "50+", change: "+8" },
      { label: "页面数量", value: "200+", change: "+39" },
    ],
    breakingChanges: [],
    deprecations: ["v1.x 的 API 已于 2026-06-01 停止维护"],
  },
  "3-1": {
    version: "v3.1.0",
    date: "2026-05-20",
    status: "stable",
    codename: "Aurora",
    highlights: [
      "Google 文章自动收录功能上线",
      "Brand Voice 2.0 数字孪生升级",
      "实时协作:多人同时编辑同一文档",
      "新增 15 个行业模板",
    ],
    changes: [
      { type: "new", title: "Google 自动收录", desc: "文章发布后自动提交到 Google Indexing API,索引时间从 7 天缩短至 2 小时" },
      { type: "new", title: "Brand Voice 2.0", desc: "数字孪生升级,3 份样本文档即可训练专属风格,准确率 +40%" },
      { type: "new", title: "实时协作", desc: "支持 5 人同时编辑同一文档,光标 / 选区 / 评论实时同步" },
      { type: "new", title: "行业模板 +15", desc: "新增法律 / 医疗 / 房地产 / 教育等 15 个行业专属模板" },
      { type: "improved", title: "AI 编辑器性能", desc: "段落生成速度提升 3x,从 8 秒降至 2.5 秒" },
      { type: "improved", title: "知识库容量", desc: "免费版 100MB → 500MB,Pro 版 5GB → 20GB" },
      { type: "fixed", title: "修复 Markdown 导出表格错位", desc: "复杂表格导出 PDF 时列宽计算错误" },
      { type: "fixed", title: "修复中文标点智能识别", desc: "训练数据增强,中文标点处理准确率 +25%" },
      { type: "security", title: "API 限流加固", desc: "新增 IP + 账号双维度限流,防止滥用" },
    ],
    metrics: [
      { label: "收录速度", value: "2 小时", change: "-85%" },
      { label: "生成速度", value: "2.5 秒", change: "-69%" },
      { label: "知识库容量", value: "5x", change: "↑" },
      { label: "协作人数", value: "5 人", change: "新增" },
    ],
    breakingChanges: ["v2.x 的 Brand Voice API 需迁移到 v3 路径,迁移工具见文档"],
    deprecations: [],
  },
  "3-0": {
    version: "v3.0.0",
    date: "2026-04-15",
    status: "stable",
    codename: "Genesis",
    highlights: [
      "Try AI Writer 3.0 重大版本升级",
      "全新 Dashboard,数据可视化 2.0",
      "Paddle 支付集成,支持国际信用卡",
      "Affiliate 系统上线,推荐返佣 30%",
    ],
    changes: [
      { type: "new", title: "全新 Dashboard", desc: "本周写作量 / 风格匹配度 / AI 使用率 / 节省时间 4 大模块,数据图表化" },
      { type: "new", title: "Paddle 支付集成", desc: "支持 Visa / Mastercard / Amex / PayPal,全球 200+ 国家可用" },
      { type: "new", title: "Affiliate 联盟", desc: "推荐链接 + 实时佣金追踪 + 月度自动结算,返佣比例 30%" },
      { type: "new", title: "团队工作空间", desc: "Pro 版起支持 5 人团队,共享 Brand Voice 与模板库" },
      { type: "improved", title: "UI 全面升级", desc: "深色主题 + 玻璃拟态 + 渐变高亮,设计语言现代化" },
      { type: "improved", title: "性能优化", desc: "首屏加载从 2.8s 降至 1.6s,Lighthouse 89 → 96" },
      { type: "fixed", title: "修复 12 个稳定性问题", desc: "包括并发编辑、文件上传、API 限流等" },
      { type: "security", title: "SOC 2 Type I 认证", desc: "完成 SOC 2 Type I 安全合规审计" },
    ],
    metrics: [
      { label: "加载速度", value: "1.6 秒", change: "-43%" },
      { label: "Lighthouse 分", value: "96", change: "+7" },
      { label: "团队成员", value: "5 人", change: "新增" },
      { label: "返佣比例", value: "30%", change: "新增" },
    ],
    breakingChanges: [
      "v2.x 的 /api/v1 路径已废弃,请迁移到 /api/v3",
      "Brand Voice 1.0 模型已下线,请重新训练 Brand Voice 2.0",
    ],
    deprecations: ["v2.x 的所有 API 已于 2026-04-15 停止支持"],
  },
  "2-5": {
    version: "v2.5.0",
    date: "2026-03-01",
    status: "stable",
    codename: "Mirage",
    highlights: [
      "AI 写作核心升级,引入 Claude 3.5 Sonnet",
      "新增 30+ 写作工具(覆盖全场景)",
      "SEO 助手:关键词密度实时检测",
    ],
    changes: [
      { type: "new", title: "Claude 3.5 Sonnet 集成", desc: "中文写作质量提升 47%,长文连贯性增强" },
      { type: "new", title: "SEO 助手", desc: "写作时实时显示关键词密度、标题 / 描述建议、字数统计" },
      { type: "new", title: "30+ 新工具", desc: "覆盖销售信 / 邮件 / 落地页 / 公众号 / 知乎 / 小红书 / 抖音 / 即刻" },
      { type: "improved", title: "免费版额度", desc: "从 1000 字 / 月提升到 5000 字 / 月" },
      { type: "fixed", title: "修复 API 限流误判", desc: "修复短时间高频请求被误限流的问题" },
    ],
    metrics: [
      { label: "中文质量", value: "+47%", change: "↑" },
      { label: "工具数量", value: "100+", change: "+30" },
      { label: "免费额度", value: "5000 字", change: "+400%" },
    ],
    breakingChanges: [],
    deprecations: [],
  },
  "2-0": {
    version: "v2.0.0",
    date: "2026-01-15",
    status: "stable",
    codename: "Horizon",
    highlights: [
      "Try AI Writer 2.0 全新架构",
      "Next.js 16 + React 19 + Turbopack",
      "支持 50+ 写作场景模板",
    ],
    changes: [
      { type: "new", title: "Next.js 16 升级", desc: "Turbopack 构建,冷启动 12 秒,热更新 < 200ms" },
      { type: "new", title: "50+ 写作场景模板", desc: "公众号 / 知乎 / 小红书 / 抖音 / 邮件 / 销售信 / 简历" },
      { type: "new", title: "历史记录搜索", desc: "支持按关键词 / 时间 / 工具类型多维检索历史写作" },
      { type: "improved", title: "UI 重设计", desc: "深色主题 + Playfair Display + Inter 字体组合" },
    ],
    metrics: [
      { label: "构建时间", value: "12 秒", change: "-70%" },
      { label: "热更新", value: "<200ms", change: "新" },
      { label: "模板数量", value: "50+", change: "新增" },
    ],
    breakingChanges: ["v1.x 的所有路由已废弃,新路径为 /tools/* /blog/*"],
    deprecations: ["v1.x 已于 2026-02-15 完全下线"],
  },
  "1-5": {
    version: "v1.5.0",
    date: "2025-12-01",
    status: "stable",
    codename: "Compass",
    highlights: [
      "添加 Brand Voice 数字孪生",
      "写作风格学习功能",
      "新增文件导入(.docx / .pdf / .txt)",
    ],
    changes: [
      { type: "new", title: "Brand Voice 数字孪生", desc: "上传 5 篇文章,AI 学习你的写作风格,新文章保持你的语气" },
      { type: "new", title: "文件导入", desc: "支持 .docx / .pdf / .txt 导入,自动提取文本继续写作" },
      { type: "improved", title: "导出格式", desc: "新增 Markdown / HTML / TXT 导出" },
    ],
    metrics: [
      { label: "风格准确度", value: "85%", change: "新增" },
      { label: "导入格式", value: "3 种", change: "新增" },
    ],
    breakingChanges: [],
    deprecations: [],
  },
  "1-0": {
    version: "v1.0.0",
    date: "2025-10-01",
    status: "stable",
    codename: "Aurora",
    highlights: [
      "Try AI Writer 正式版发布",
      "30+ 基础写作工具",
      "支持中文 / 英文双语",
    ],
    changes: [
      { type: "new", title: "30+ 写作工具", desc: "覆盖博客 / 邮件 / 营销 / 文案 / 简历 / 翻译等基础场景" },
      { type: "new", title: "中英双语", desc: "AI 模型针对中文优化,英文同步支持" },
      { type: "new", title: "用户系统", desc: "邮箱注册 / 登录 / 找回密码完整流程" },
      { type: "new", title: "免费版", desc: "每月 1000 字免费额度,无需信用卡" },
    ],
    metrics: [
      { label: "工具数量", value: "30+", change: "首发" },
      { label: "免费额度", value: "1000 字", change: "首发" },
    ],
    breakingChanges: [],
    deprecations: [],
  },
  "0-1": {
    version: "v0.1.0",
    date: "2025-08-15",
    status: "deprecated",
    codename: "Genesis",
    highlights: [
      "Try AI Writer Beta 内测首发",
      "10 个核心写作工具",
      "支持 GPT-4 底层模型",
    ],
    changes: [
      { type: "new", title: "Beta 内测", desc: "邀请 1000 名种子用户参与内测" },
      { type: "new", title: "10 个核心工具", desc: "博客 / 邮件 / 翻译 / 文案 / 简历 / 总结等" },
      { type: "new", title: "GPT-4 集成", desc: "底层使用 GPT-4,保证生成质量" },
    ],
    metrics: [
      { label: "内测用户", value: "1000 人", change: "首发" },
      { label: "工具数量", value: "10 个", change: "首发" },
    ],
    breakingChanges: [],
    deprecations: ["v0.1.0 已于 2025-10-01 正式版发布后停止维护"],
  },
};

const SLUGS = Object.keys(VERSIONS);
const TYPE_META = {
  new: { label: "新增", color: "emerald", icon: Plus },
  improved: { label: "改进", color: "blue", icon: ArrowUp },
  fixed: { label: "修复", color: "amber", icon: Wrench },
  security: { label: "安全", color: "rose", icon: Shield },
};

export default function ChangelogContent({ params }: Props) {
  const raw = use(params);
  const versionKey = raw.version as keyof typeof VERSIONS;
  const v = VERSIONS[versionKey];
  const [filter, setFilter] = useState<"all" | "new" | "improved" | "fixed" | "security">("all");

  if (!v) {
    return (
      <main className="min-h-screen bg-obsidian-950 flex items-center justify-center text-slate-100">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <p>未找到版本:{versionKey}</p>
          <Link href="/changelog" className="text-emerald-400 hover:text-emerald-300 mt-4 inline-block">
            返回更新日志
          </Link>
        </div>
      </main>
    );
  }

  const filtered = filter === "all" ? v.changes : v.changes.filter((c) => c.type === filter);

  return (
    <main className="min-h-screen bg-obsidian-950 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-emerald-950/40 via-obsidian-950 to-obsidian-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(5,150,105,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8" aria-label="面包屑">
            <Link href="/" className="hover:text-emerald-400">首页</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/changelog" className="hover:text-emerald-400">更新日志</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-200">{v.version}</span>
          </nav>

          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              v.status === "stable" ? "bg-emerald-500/15 text-emerald-300" :
              v.status === "beta" ? "bg-amber-500/15 text-amber-300" :
              "bg-slate-700 text-slate-400"
            }`}>
              {v.status === "stable" ? "稳定版" : v.status === "beta" ? "公测版" : "已废弃"}
            </span>
            <span className="rounded-full bg-slate-800 text-slate-300 px-3 py-1 text-xs">
              代号:{v.codename}
            </span>
            <span className="rounded-full bg-slate-800 text-slate-300 px-3 py-1 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {v.date}
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-br from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
            {v.version}
          </h1>
          <p className="text-lg text-teal-300 font-medium mt-3">{v.codename} - Try AI Writer 更新日志</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
            {v.metrics.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              >
                <div className="text-2xl font-extrabold text-white">{m.value}</div>
                <div className="text-xs text-slate-400 mt-1">{m.label}</div>
                <div className="text-xs text-emerald-400 font-semibold mt-1">{m.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-teal-950/20 p-6 lg:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-6 h-6 text-amber-400" />
            <h2 className="font-serif text-2xl font-extrabold text-white">核心亮点</h2>
          </div>
          <ul className="space-y-2">
            {v.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-100">
                <Rocket className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex flex-wrap gap-2">
          {([
            { id: "all", label: "全部", count: v.changes.length },
            { id: "new", label: "新增", count: v.changes.filter((c) => c.type === "new").length },
            { id: "improved", label: "改进", count: v.changes.filter((c) => c.type === "improved").length },
            { id: "fixed", label: "修复", count: v.changes.filter((c) => c.type === "fixed").length },
            { id: "security", label: "安全", count: v.changes.filter((c) => c.type === "security").length },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
                filter === t.id
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 border border-slate-700 text-slate-300 hover:border-emerald-500/60"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </section>

      {/* Changes List */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-3">
          {filtered.map((c, i) => {
            const tm = TYPE_META[c.type];
            const Icon = tm.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                    tm.color === "emerald" ? "bg-emerald-500/15 text-emerald-300" :
                    tm.color === "blue" ? "bg-blue-500/15 text-blue-300" :
                    tm.color === "amber" ? "bg-amber-500/15 text-amber-300" :
                    "bg-rose-500/15 text-rose-300"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        tm.color === "emerald" ? "bg-emerald-500/15 text-emerald-300" :
                        tm.color === "blue" ? "bg-blue-500/15 text-blue-300" :
                        tm.color === "amber" ? "bg-amber-500/15 text-amber-300" :
                        "bg-rose-500/15 text-rose-300"
                      }`}>
                        {tm.label}
                      </span>
                      <h3 className="text-base font-semibold text-white">{c.title}</h3>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Breaking Changes */}
      {v.breakingChanges.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-800/60">
          <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-950/20 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-amber-400" />
              <h2 className="font-serif text-xl font-extrabold text-amber-200">⚠️ 重大变更</h2>
            </div>
            <ul className="space-y-2">
              {v.breakingChanges.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-amber-100">
                  <span className="text-amber-400 font-bold">·</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Deprecations */}
      {v.deprecations.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <h2 className="font-serif text-xl font-extrabold text-slate-200">已废弃</h2>
            </div>
            <ul className="space-y-2">
              {v.deprecations.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-slate-500">·</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Other Versions */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/60">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-6 h-6 text-emerald-400" />
          <h2 className="font-serif text-2xl font-extrabold text-white">其它版本</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SLUGS.filter((s) => s !== versionKey).map((s) => {
            const other = VERSIONS[s];
            if (!other) return null;
            return (
              <Link
                key={s}
                href={`/changelog/${s}`}
                className="group rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-semibold text-white group-hover:text-emerald-300">
                    {other.version}
                  </div>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                    other.status === "stable" ? "bg-emerald-500/15 text-emerald-300" :
                    other.status === "beta" ? "bg-amber-500/15 text-amber-300" :
                    "bg-slate-700 text-slate-400"
                  }`}>
                    {other.status === "stable" ? "稳定" : other.status === "beta" ? "公测" : "废弃"}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mb-1">{other.codename}</div>
                <div className="text-xs text-slate-400">{other.date}</div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 mt-2" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/60">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-teal-950/40 p-8 lg:p-12 text-center space-y-6">
          <Heart className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
            喜欢这次更新?给我们一个 Star
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            如果 Try AI Writer 帮到了你,欢迎在 GitHub / Product Hunt / Twitter 给我们一个 Star,这是对我们最大的支持。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              免费使用 Try AI Writer
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
