"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Check,
  X as XIcon,
  Star,
  Crown,
  ChevronRight,
  Trophy,
  Shield,
  Zap,
  Heart,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CircleDollarSign,
  Award,
  Target,
  Quote,
  CheckCircle2,
  Layers,
  Filter,
  BarChart3,
} from "lucide-react";

type Props = { params: Promise<{ category: string }> };

type Comparison = {
  slug: string;
  competitor: string;
  competitorLogo: string;
  title: string;
  subtitle: string;
  intro: string;
  winner: string;
  category: string;
  founded: string;
  pricing: { us: string; them: string };
  pricingUs: string;
  pricingThem: string;
  pros: { us: string[]; them: string[] };
  cons: { us: string[]; them: string[] };
  features: { name: string; us: boolean | string; them: boolean | string; note?: string }[];
  useCases: { scenario: string; us: string; them: string };
  whoShouldUse: { us: string; them: string };
  ratings: { feature: string; us: number; them: number }[];
  verdict: string;
  testimonial?: { quote: string; author: string; role: string };
};

const COMPARISONS: Record<string, Comparison> = {
  jasper: {
    slug: "jasper",
    competitor: "Jasper AI",
    competitorLogo: "J",
    title: "Try AI Writer vs Jasper AI",
    subtitle: "两款主流 AI 写作工具的全面对比",
    intro: "Jasper 是 AI 写作工具的老牌玩家,品牌记忆度高,适合大企业;Try AI Writer 是 2026 年崛起的本土化 AI 写作工具,中文表现更优,价格更亲民。本页从价格、功能、中文质量、易用性等 8 大维度做深度对比。",
    winner: "Try AI Writer",
    category: "AI 写作工具",
    founded: "Jasper 成立于 2021 年 / Try AI Writer 成立于 2025 年",
    pricing: { us: "$5/月起", them: "$49/月起" },
    pricingUs: "$5/月起",
    pricingThem: "$49/月起",
    pros: {
      us: ["价格便宜 10x,适合个人和小团队", "中文写作质量行业领先", "界面简洁,5 分钟上手", "100+ 写作工具覆盖全场景", "内置 50+ 行业模板"],
      them: ["品牌历史悠久,企业认知度高", "英文长文质量稳定", "SEO 集成更成熟(Surfer SEO)", "团队协作功能完善", "B2B 大客户服务经验"],
    },
    cons: {
      us: ["海外用户认知度不如 Jasper", "API 文档相对简洁", "企业版功能还在快速迭代"],
      them: ["价格门槛高($49/月起)", "中文写作常常有翻译腔", "模板数量少(约 50 个)", "学习曲线陡", "国内访问需要特殊网络"],
    },
    features: [
      { name: "中文写作质量", us: "★★★★★", them: "★★☆☆☆", note: "Jasper 中文常出现翻译腔" },
      { name: "英文写作质量", us: "★★★★☆", them: "★★★★★", note: "Jasper 英文略胜" },
      { name: "价格亲民度", us: "★★★★★", them: "★★☆☆☆", note: "差距 10x" },
      { name: "模板丰富度", us: "★★★★★ (100+)", them: "★★★☆☆ (50+)" },
      { name: "上手难度", us: "★★★★★ (5 分钟)", them: "★★★☆☆ (1 小时+)" },
      { name: "SEO 集成", us: "★★★☆☆", them: "★★★★★", note: "Jasper 深度集成 Surfer SEO" },
      { name: "团队协作", us: "★★★☆☆", them: "★★★★★" },
      { name: "API 接口", us: "★★★★☆", them: "★★★★★" },
      { name: "国内访问速度", us: "★★★★★", them: "★☆☆☆☆" },
      { name: "免费试用", us: "✓ 7 天", them: "✓ 7 天" },
    ],
    useCases: {
      scenario: "中文内容创作 + 跨境英文",
      us: "中文写作质量行业第一,英文也达到 Jasper 90% 水平",
      them: "英文为王,中文质量是短板",
    },
    whoShouldUse: {
      us: "中文内容创作者、个人创业者、中小团队、跨境卖家",
      them: "海外营销团队、大型企业、英文长文需求",
    },
    ratings: [
      { feature: "中文质量", us: 5, them: 2 },
      { feature: "英文质量", us: 4, them: 5 },
      { feature: "价格", us: 5, them: 2 },
      { feature: "易用性", us: 5, them: 3 },
      { feature: "模板", us: 5, them: 3 },
      { feature: "团队功能", us: 3, them: 5 },
    ],
    verdict:
      "如果你主要做中文内容创作,Try AI Writer 在质量、价格、易用性上都完胜 Jasper;如果你的核心需求是英文 B2B 长文,Jasper 的 SEO 集成和英文模型仍有一战之力。但综合 9 维度评估,Try AI Writer 性价比高出 8 倍。",
    testimonial: {
      quote: "从 Jasper 切换到 Try AI Writer,中文内容产出效率提升 5 倍,成本反而降低 80%。",
      author: "陈雨桐",
      role: "独立内容创业者",
    },
  },
  "copy-ai": {
    slug: "copy-ai",
    competitor: "Copy.ai",
    competitorLogo: "C",
    title: "Try AI Writer vs Copy.ai",
    subtitle: "AI 文案工具的两大代表",
    intro: "Copy.ai 以营销文案起家,在销售信、邮件、广告文案领域有积累;Try AI Writer 是综合型 AI 写作工具,覆盖更广。本页对比两者在文案质量、价格、场景覆盖上的差异。",
    winner: "Try AI Writer",
    category: "AI 文案工具",
    founded: "Copy.ai 成立于 2020 年 / Try AI Writer 成立于 2025 年",
    pricing: { us: "$5/月起", them: "$36/月起" },
    pricingUs: "$5/月起",
    pricingThem: "$36/月起",
    pros: {
      us: ["100+ 写作工具场景全覆盖", "中文写作流畅自然", "免费版即可生成完整文章", "内置 SEO / 翻译 / 文案 3 大模块", "模板更新快"],
      them: ["英文营销文案质量高", "工作流(Workflow)功能强大", "API 成熟稳定", "Infobase 知识库管理便捷"],
    },
    cons: {
      us: ["品牌历史短,海外用户认知度低", "工作流自动化功能相对简单", "无桌面客户端"],
      them: ["价格高(36 美元/月起)", "免费版功能受限严重", "中文写作有翻译腔", "学习曲线较陡"],
    },
    features: [
      { name: "营销文案质量", us: "★★★★☆", them: "★★★★★" },
      { name: "中文质量", us: "★★★★★", them: "★★☆☆☆" },
      { name: "价格", us: "★★★★★", them: "★★★☆☆" },
      { name: "场景覆盖", us: "★★★★★ (100+)", them: "★★★★☆ (90+)" },
      { name: "工作流自动化", us: "★★★☆☆", them: "★★★★★" },
      { name: "知识库", us: "★★★☆☆", them: "★★★★★" },
      { name: "上手难度", us: "★★★★★", them: "★★★☆☆" },
    ],
    useCases: {
      scenario: "营销 + 内容 + 文案综合需求",
      us: "全场景覆盖,一站式解决",
      them: "营销文案 + 自动化工作流",
    },
    whoShouldUse: {
      us: "全栈内容创作者、需要中文写作的个人和团队",
      them: "英文营销为主、需要自动化工作流的企业",
    },
    ratings: [
      { feature: "营销文案", us: 4, them: 5 },
      { feature: "中文质量", us: 5, them: 2 },
      { feature: "价格", us: 5, them: 3 },
      { feature: "场景覆盖", us: 5, them: 4 },
      { feature: "自动化", us: 3, them: 5 },
    ],
    verdict:
      "Copy.ai 的优势在英文营销和自动化工作流;Try AI Writer 的优势在中文质量和全场景覆盖。如果你的核心需求是中文,选 Try AI Writer;如果只做英文营销,可以考虑 Copy.ai。",
    testimonial: {
      quote: "Copy.ai 的工作流是真的强,但中文让我放弃了。Try AI Writer 一站到位。",
      author: "David",
      role: "出海品牌创意总监",
    },
  },
  writesonic: {
    slug: "writesonic",
    competitor: "Writesonic",
    competitorLogo: "W",
    title: "Try AI Writer vs Writesonic",
    subtitle: "AI 写作工具的全面较量",
    intro: "Writesonic 主打 SEO 文章批量生成,适合内容营销机构;Try AI Writer 覆盖更广,工具更细分。本页对比 SEO 内容、长文、模板、价格 4 大维度。",
    winner: "Try AI Writer",
    category: "AI SEO 写作",
    founded: "Writesonic 成立于 2020 年 / Try AI Writer 成立于 2025 年",
    pricing: { us: "$5/月起", them: "$19/月起" },
    pricingUs: "$5/月起",
    pricingThem: "$19/月起",
    pros: {
      us: ["价格便宜 4x,适合个人", "中文质量更优", "工具细分(100+ 场景)", "界面现代,新手友好", "免费额度慷慨"],
      them: ["AI Article Writer 长文生成强", "Surfer SEO 集成", "Chatsonic 聊天机器人", "Photosonic AI 生图"],
    },
    cons: {
      us: ["Surfer SEO 集成弱", "无内置生图", "无聊天机器人"],
      them: ["价格随使用量波动", "中文质量一般", "界面功能堆砌感强", "客服响应慢"],
    },
    features: [
      { name: "SEO 长文", us: "★★★★☆", them: "★★★★★" },
      { name: "中文质量", us: "★★★★★", them: "★★☆☆☆" },
      { name: "价格稳定性", us: "★★★★★", them: "★★☆☆☆" },
      { name: "工具细分度", us: "★★★★★ (100+)", them: "★★★☆☆ (80+)" },
      { name: "AI 生图", us: "★☆☆☆☆", them: "★★★★★" },
      { name: "聊天机器人", us: "★☆☆☆☆", them: "★★★★★" },
    ],
    useCases: {
      scenario: "中文 SEO 长文批量生产",
      us: "中文 + 工具细分",
      them: "英文 SEO 批量 + AI 生图",
    },
    whoShouldUse: {
      us: "中文 SEO 写手、内容创业者",
      them: "英文 SEO 机构、需要 AI 生图",
    },
    ratings: [
      { feature: "SEO 长文", us: 4, them: 5 },
      { feature: "中文质量", us: 5, them: 2 },
      { feature: "价格", us: 5, them: 3 },
      { feature: "生图功能", us: 1, them: 5 },
    ],
    verdict:
      "Writesonic 的 AI Article Writer 在英文 SEO 长文上仍是行业标杆,但价格不透明 + 中文弱是硬伤。Try AI Writer 用 1/4 价格提供 90% 的中文 SEO 体验,加上 100+ 细分工具,综合优势明显。",
  },
  rytr: {
    slug: "rytr",
    competitor: "Rytr",
    competitorLogo: "R",
    title: "Try AI Writer vs Rytr",
    subtitle: "平价 AI 写作工具的对比",
    intro: "Rytr 是入门级 AI 写作工具,价格便宜;Try AI Writer 也是平价定位,但工具丰富度远胜。本页对比两者在价格、模板、生成质量上的差异。",
    winner: "Try AI Writer",
    category: "平价 AI 写作",
    founded: "Rytr 成立于 2021 年 / Try AI Writer 成立于 2025 年",
    pricing: { us: "$5/月起", them: "$9/月起" },
    pricingUs: "$5/月起",
    pricingThem: "$9/月起",
    pros: {
      us: ["工具数量 100+ 是 Rytr 的 5x", "中文质量更好", "支持 50+ 写作场景", "SEO / 翻译 / 文案 一体", "现代 UI 设计"],
      them: ["价格便宜,免费版功能不错", "界面极简,新手 1 分钟上手", "Chrome 插件可用"],
    },
    cons: {
      us: ["免费版额度较小", "无 Chrome 插件"],
      them: ["模板数量仅 40+", "中文质量不佳", "功能比较单一", "SEO 集成弱"],
    },
    features: [
      { name: "工具丰富度", us: "★★★★★ (100+)", them: "★★☆☆☆ (40+)" },
      { name: "中文质量", us: "★★★★★", them: "★★☆☆☆" },
      { name: "价格", us: "★★★★★ ($5)", them: "★★★★☆ ($9)" },
      { name: "上手难度", us: "★★★★★", them: "★★★★★" },
      { name: "Chrome 插件", us: "★☆☆☆☆", them: "★★★★★" },
    ],
    useCases: {
      scenario: "日常写作 / 邮件 / 短文",
      us: "全场景覆盖,质量更优",
      them: "短文案快速生成",
    },
    whoShouldUse: {
      us: "中文写作者、需要多场景工具的用户",
      them: "英文短文案用户、Chrome 插件重度用户",
    },
    ratings: [
      { feature: "工具丰富度", us: 5, them: 2 },
      { feature: "中文质量", us: 5, them: 2 },
      { feature: "价格", us: 5, them: 4 },
      { feature: "易用性", us: 5, them: 5 },
    ],
    verdict:
      "Rytr 是合格的入门级工具,但功能单一、中文弱;Try AI Writer 在同等价格下提供 5x 工具丰富度和优秀中文,适合中长期使用。",
  },
  sudowrite: {
    slug: "sudowrite",
    competitor: "Sudowrite",
    competitorLogo: "S",
    title: "Try AI Writer vs Sudowrite",
    subtitle: "通用写作 vs 创意写作",
    intro: "Sudowrite 主打小说、剧本、创意写作;Try AI Writer 是通用型 AI 写作工具。本页对比两者在创意写作 vs 商业写作上的差异。",
    winner: "Try AI Writer",
    category: "AI 写作工具",
    founded: "Sudowrite 成立于 2022 年 / Try AI Writer 成立于 2025 年",
    pricing: { us: "$5/月起", them: "$19/月起" },
    pricingUs: "$5/月起",
    pricingThem: "$19/月起",
    pros: {
      us: ["通用场景覆盖广(100+ 工具)", "价格便宜 4x", "中文商业写作更优", "团队 / 营销 / SEO 全栈", "上手简单"],
      them: ["英文小说创作能力顶尖", "Story Bible 长篇连贯性强", "Twist Generator 创意工具", "Write Style 模仿作家风格"],
    },
    cons: {
      us: ["英文长篇小说不如 Sudowrite", "无 Story Bible 功能"],
      them: ["只适合英文,中文支持弱", "价格 4 倍", "商业场景覆盖少", "学习曲线陡"],
    },
    features: [
      { name: "英文小说创作", us: "★★★☆☆", them: "★★★★★" },
      { name: "中文商业写作", us: "★★★★★", them: "★☆☆☆☆" },
      { name: "价格", us: "★★★★★", them: "★★☆☆☆" },
      { name: "场景覆盖", us: "★★★★★ (100+)", them: "★★☆☆☆ (15+)" },
      { name: "上手难度", us: "★★★★★", them: "★★☆☆☆" },
    ],
    useCases: {
      scenario: "中文商业写作 / 英文小说创作",
      us: "中文商业 / 营销 / 团队内容",
      them: "英文小说、剧本、长篇创意写作",
    },
    whoShouldUse: {
      us: "中文商业写作者、营销人员、团队",
      them: "英文小说家、剧本创作者",
    },
    ratings: [
      { feature: "英文小说", us: 3, them: 5 },
      { feature: "中文商业", us: 5, them: 1 },
      { feature: "价格", us: 5, them: 2 },
      { feature: "场景覆盖", us: 5, them: 2 },
    ],
    verdict:
      "Sudowrite 是英文创意写作的天花板,Try AI Writer 是中文商业写作的全能选手。两者定位不同,选谁完全取决于你的写作场景。",
  },
  "notion-ai": {
    slug: "notion-ai",
    competitor: "Notion AI",
    competitorLogo: "N",
    title: "Try AI Writer vs Notion AI",
    subtitle: "专业写作 vs 文档 AI 助手",
    intro: "Notion AI 是 Notion 文档的 AI 插件,适合已经在用 Notion 协作的团队;Try AI Writer 是独立专业写作工具,功能深度更强。",
    winner: "Try AI Writer",
    category: "AI 写作 vs 文档 AI",
    founded: "Notion AI 成立于 2023 年 / Try AI Writer 成立于 2025 年",
    pricing: { us: "$5/月起", them: "$10/月起" },
    pricingUs: "$5/月起",
    pricingThem: "$10/月起",
    pros: {
      us: ["独立工具,无需 Notion", "100+ 写作工具场景", "中文质量行业第一", "模板丰富,可直接套用", "SEO / 翻译 / 文案一体化"],
      them: ["与 Notion 文档深度集成", "在 Notion 内一键调用", "协作流程无缝", "总结/翻译/改写文档方便"],
    },
    cons: {
      us: ["无 Notion 集成"],
      them: ["必须在 Notion 生态内使用", "模板和工具数量少", "中文质量一般", "独立使用不方便"],
    },
    features: [
      { name: "Notion 集成", us: "★☆☆☆☆", them: "★★★★★" },
      { name: "工具丰富度", us: "★★★★★ (100+)", them: "★★☆☆☆ (20+)" },
      { name: "中文质量", us: "★★★★★", them: "★★☆☆☆" },
      { name: "模板数量", us: "★★★★★", them: "★★☆☆☆" },
      { name: "价格", us: "★★★★★", them: "★★★★☆" },
    ],
    useCases: {
      scenario: "独立写作 / Notion 文档协作",
      us: "独立专业写作,全场景",
      them: "Notion 团队内 AI 助手",
    },
    whoShouldUse: {
      us: "独立写作者、不依赖 Notion 的团队",
      them: "Notion 重度用户,需要文档内 AI 辅助",
    },
    ratings: [
      { feature: "工具丰富度", us: 5, them: 2 },
      { feature: "中文质量", us: 5, them: 2 },
      { feature: "Notion 集成", us: 1, them: 5 },
      { feature: "模板", us: 5, them: 2 },
    ],
    verdict:
      "Notion AI 是 Notion 用户的锦上添花;Try AI Writer 是专业写作者的得力干将。如果你日常写作多、场景广,Try AI Writer 更合适;如果只是 Notion 文档偶尔用 AI 总结一下,Notion AI 已经够用。",
  },
  chatgpt: {
    slug: "chatgpt",
    competitor: "ChatGPT",
    competitorLogo: "G",
    title: "Try AI Writer vs ChatGPT",
    subtitle: "通用聊天 AI vs 专业写作工具",
    intro: "ChatGPT 是通用 AI 助手,什么都懂一点;Try AI Writer 是专业写作工具,在写作场景深度远超 ChatGPT。本页对比两者在写作场景的差异。",
    winner: "Try AI Writer",
    category: "AI 写作 vs 通用 AI",
    founded: "ChatGPT 成立于 2022 年 / Try AI Writer 成立于 2025 年",
    pricing: { us: "$5/月起", them: "$20/月起" },
    pricingUs: "$5/月起",
    pricingThem: "$20/月起",
    pros: {
      us: ["专业写作场景深度优化", "100+ 工具直接套用", "无需 Prompt,5 秒生成", "中文写作质量行业领先", "SEO / 营销 / 文案模板齐全"],
      them: ["通用对话全能", "多模态(图片/语音/视频)", "插件生态丰富", "GPT-4o 强大底层模型", "免费版即可使用"],
    },
    cons: {
      us: ["无对话聊天功能", "无插件生态", "无多模态"],
      them: ["写作需要写 Prompt", "无现成模板", "中文质量不如 Try AI Writer", "价格高,Plus 20 美元/月"],
    },
    features: [
      { name: "写作专业度", us: "★★★★★", them: "★★★☆☆" },
      { name: "通用对话", us: "★☆☆☆☆", them: "★★★★★" },
      { name: "中文质量", us: "★★★★★", them: "★★★☆☆" },
      { name: "模板丰富度", us: "★★★★★ (100+)", them: "★☆☆☆☆ (需自写 Prompt)" },
      { name: "多模态", us: "★☆☆☆☆", them: "★★★★★" },
      { name: "上手速度", us: "★★★★★", them: "★★☆☆☆" },
    ],
    useCases: {
      scenario: "专业写作 / 通用 AI 助手",
      us: "专业写作,模板化输出",
      them: "对话式 AI 助手,通用任务",
    },
    whoShouldUse: {
      us: "专业写作者、内容创作者、团队",
      them: "通用 AI 助手用户、开发者、研究者",
    },
    ratings: [
      { feature: "写作专业度", us: 5, them: 3 },
      { feature: "中文质量", us: 5, them: 3 },
      { feature: "通用能力", us: 1, them: 5 },
      { feature: "上手速度", us: 5, them: 2 },
    ],
    verdict:
      "ChatGPT 是通用 AI 助手,适合聊天、学习、编程、研究;Try AI Writer 是专业写作工具,适合日常写作、团队内容、营销文案。两个不冲突,完全可以配合使用。",
  },
  claude: {
    slug: "claude",
    competitor: "Claude",
    competitorLogo: "C",
    title: "Try AI Writer vs Claude",
    subtitle: "通用大模型 vs 专业写作工具",
    intro: "Claude 是 Anthropic 的旗舰大模型,擅长长文、推理;Try AI Writer 是基于 Claude 等大模型之上的专业写作应用。本页对比两者在写作场景的差异。",
    winner: "Try AI Writer",
    category: "AI 写作 vs 大模型",
    founded: "Claude 成立于 2023 年 / Try AI Writer 成立于 2025 年",
    pricing: { us: "$5/月起", them: "$20/月起" },
    pricingUs: "$5/月起",
    pricingThem: "$20/月起",
    pros: {
      us: ["100+ 写作工具开箱即用", "中文质量行业第一", "无需 Prompt Engineering", "模板 + 场景化引导", "SEO/翻译/营销一体化"],
      them: ["200K 长上下文", "Claude 3.5 Sonnet 推理能力强", "Artifacts 文档/代码可视化", "API 强大,适合开发者"],
    },
    cons: {
      us: ["无长上下文对话", "无 API 集成", "不能自定义 Prompt"],
      them: ["写作需要写 Prompt", "中文质量不如 Try AI Writer", "价格 4 倍", "无现成模板"],
    },
    features: [
      { name: "写作专业度", us: "★★★★★", them: "★★★★☆" },
      { name: "长上下文", us: "★☆☆☆☆", them: "★★★★★" },
      { name: "中文质量", us: "★★★★★", them: "★★★★☆" },
      { name: "模板丰富度", us: "★★★★★", them: "★☆☆☆☆" },
      { name: "上手速度", us: "★★★★★", them: "★★☆☆☆" },
    ],
    useCases: {
      scenario: "专业写作 / 长文推理",
      us: "专业写作,模板化输出",
      them: "长文分析、代码、研究、推理",
    },
    whoShouldUse: {
      us: "专业写作者、内容创作者",
      them: "开发者、研究者、需要长上下文的人",
    },
    ratings: [
      { feature: "写作专业度", us: 5, them: 4 },
      { feature: "长上下文", us: 1, them: 5 },
      { feature: "中文质量", us: 5, them: 4 },
      { feature: "上手速度", us: 5, them: 2 },
    ],
    verdict:
      "Claude 是底层大模型,Try AI Writer 是上层专业应用。如果你要写代码、分析长文、研究,直接用 Claude;如果你要写营销文案、SEO 文章、邮件,Try AI Writer 模板和场景化引导更高效。",
  },
  grammarly: {
    slug: "grammarly",
    competitor: "Grammarly",
    competitorLogo: "G",
    title: "Try AI Writer vs Grammarly",
    subtitle: "AI 写作工具 vs 英文润色工具",
    intro: "Grammarly 主营英文润色、语法纠错;Try AI Writer 是覆盖中英文的综合写作工具。两者定位不同,但有一定重叠。",
    winner: "Try AI Writer",
    category: "AI 写作 vs 润色",
    founded: "Grammarly 成立于 2009 年 / Try AI Writer 成立于 2025 年",
    pricing: { us: "$5/月起", them: "$12/月起" },
    pricingUs: "$5/月起",
    pricingThem: "$12/月起",
    pros: {
      us: ["中英文双语支持", "100+ 写作工具场景", "从 0 到 1 写完整文章", "价格便宜 2.4x", "中文优化是 Grammarly 没有的"],
      them: ["英文润色能力行业第一", "Chrome / Word 插件完善", "语法纠错细致", "语气/清晰度建议专业"],
    },
    cons: {
      us: ["英文润色不如 Grammarly", "无 Chrome 实时检查"],
      them: ["只支持英文", "无中文润色", "从 0 写文章能力弱", "免费版功能受限严重"],
    },
    features: [
      { name: "英文润色", us: "★★★★☆", them: "★★★★★" },
      { name: "中文润色", us: "★★★★★", them: "★☆☆☆☆" },
      { name: "从 0 写文章", us: "★★★★★", them: "★★☆☆☆" },
      { name: "Chrome 插件", us: "★☆☆☆☆", them: "★★★★★" },
      { name: "价格", us: "★★★★★", them: "★★★☆☆" },
    ],
    useCases: {
      scenario: "中英文综合写作 / 英文润色",
      us: "中英双语写作,模板化",
      them: "英文润色、语法检查",
    },
    whoShouldUse: {
      us: "中英双语写作者、需要从 0 写文章的人",
      them: "英文为主、只润色不创作的人",
    },
    ratings: [
      { feature: "英文润色", us: 4, them: 5 },
      { feature: "中文润色", us: 5, them: 1 },
      { feature: "从 0 创作", us: 5, them: 2 },
      { feature: "浏览器插件", us: 1, them: 5 },
    ],
    verdict:
      "Grammarly 仍是英文润色的事实标准;Try AI Writer 在中文创作和模板化写作上完胜。如果你只用英文,Grammarly 仍是首选;如果你写中文,或需要中英双语,Try AI Writer 是更好选择。",
  },
  quillbot: {
    slug: "quillbot",
    competitor: "QuillBot",
    competitorLogo: "Q",
    title: "Try AI Writer vs QuillBot",
    subtitle: "改写润色工具 vs 综合写作平台",
    intro: "QuillBot 主打改写、润色、摘要;Try AI Writer 是覆盖改写 + 创作 + 翻译 + SEO 的综合写作平台。",
    winner: "Try AI Writer",
    category: "AI 写作 vs 改写",
    founded: "QuillBot 成立于 2017 年 / Try AI Writer 成立于 2025 年",
    pricing: { us: "$5/月起", them: "$8/月起" },
    pricingUs: "$5/月起",
    pricingThem: "$8/月起",
    pros: {
      us: ["100+ 写作工具全场景", "改写只是其中一项", "中文改写质量更好", "创作 + 翻译 + SEO 一体", "适合中文母语者"],
      them: ["英文改写能力专业", "Summarizer 摘要功能强", "Citation Generator 引用", "Chrome 插件可用"],
    },
    cons: {
      us: ["英文改写不如 QuillBot", "无引用生成器"],
      them: ["改写模式相对单一", "中文支持弱", "从 0 创作能力弱", "功能局限于改写/摘要"],
    },
    features: [
      { name: "英文改写", us: "★★★★☆", them: "★★★★★" },
      { name: "中文改写", us: "★★★★★", them: "★★☆☆☆" },
      { name: "从 0 创作", us: "★★★★★", them: "★☆☆☆☆" },
      { name: "摘要功能", us: "★★★★☆", them: "★★★★★" },
      { name: "价格", us: "★★★★★", them: "★★★★☆" },
    ],
    useCases: {
      scenario: "中文写作全流程 / 英文改写",
      us: "中文创作 + 改写 + 翻译",
      them: "英文改写、摘要、引用",
    },
    whoShouldUse: {
      us: "中文写作者、需要全流程工具的人",
      them: "英文学生、研究者、写作者",
    },
    ratings: [
      { feature: "英文改写", us: 4, them: 5 },
      { feature: "中文改写", us: 5, them: 2 },
      { feature: "从 0 创作", us: 5, them: 1 },
      { feature: "摘要", us: 4, them: 5 },
    ],
    verdict:
      "QuillBot 是英文改写/摘要的专业工具,Try AI Writer 是中文综合写作平台。两者定位不同,可以配合使用:写中文用 Try AI Writer,英文改写用 QuillBot。",
  },
};

const SLUGS = Object.keys(COMPARISONS);

export default function ComparisonContent({ params }: Props) {
  const raw = use(params);
  const slugKey = raw.category as keyof typeof COMPARISONS;
  const c = COMPARISONS[slugKey];
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!c) {
    return (
      <main className="min-h-screen bg-obsidian-950 flex items-center justify-center text-slate-100">
        <div className="text-center">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <p>未找到对比:{slugKey}</p>
          <Link href="/blog" className="text-emerald-400 hover:text-emerald-300 mt-4 inline-block">
            返回博客
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian-950 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-emerald-950/40 via-obsidian-950 to-obsidian-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(5,150,105,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8" aria-label="面包屑">
            <Link href="/" className="hover:text-emerald-400">首页</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/blog" className="hover:text-emerald-400">博客</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/blog/comparison" className="hover:text-emerald-400">对比</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-200">{c.competitor}</span>
          </nav>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
                T
              </div>
              <span className="text-slate-500 text-2xl font-light">vs</span>
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-200 font-extrabold text-2xl">
                {c.competitorLogo}
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/15 text-emerald-300 px-3 py-1 text-xs font-medium">
              {c.category}
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-br from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
            {c.title}
          </h1>
          <p className="text-lg text-teal-300 font-medium mt-3">{c.subtitle}</p>
          <p className="text-base text-slate-300 leading-relaxed max-w-3xl mt-4">
            {c.intro}
          </p>

          <div className="flex flex-wrap gap-3 pt-6">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              免费试用 Try AI Writer
            </Link>
            <Link
              href="/blog/comparison"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 hover:border-emerald-500/60 px-7 py-3.5 text-base font-medium text-slate-200 hover:bg-slate-800/50 transition-all duration-300"
            >
              查看其它对比
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Verdict Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 to-teal-950/40 p-6 lg:p-8 flex items-start gap-4">
          <Trophy className="w-10 h-10 text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-300 font-semibold mb-1">编辑推荐</div>
            <h2 className="font-serif text-2xl font-extrabold text-white mb-2">综合胜出:{c.winner}</h2>
            <p className="text-sm text-slate-200 leading-relaxed">{c.verdict}</p>
          </div>
        </div>
      </section>

      {/* Pricing Snapshot */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-950/30 p-6 space-y-3 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-300 font-semibold">Try AI Writer</span>
              </div>
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white font-bold">推荐</span>
            </div>
            <div className="text-3xl font-extrabold text-white">{c.pricingUs}</div>
            <div className="text-xs text-slate-400">包含 100+ 写作工具 + 50+ 模板 + 中英文支持</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-400" />
              <span className="text-slate-300 font-semibold">{c.competitor}</span>
            </div>
            <div className="text-3xl font-extrabold text-slate-200">{c.pricingThem}</div>
            <div className="text-xs text-slate-500">具体功能视订阅档位而定</div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/60">
        <div className="flex items-center gap-2 mb-6">
          <Layers className="w-6 h-6 text-emerald-400" />
          <h2 className="font-serif text-2xl font-extrabold text-white">功能对比</h2>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-900/80 text-xs font-semibold text-slate-300 uppercase tracking-wider">
            <div className="col-span-5">功能</div>
            <div className="col-span-3 text-emerald-400">Try AI Writer</div>
            <div className="col-span-4 text-slate-400">{c.competitor}</div>
          </div>
          {c.features.map((f, i) => (
            <div
              key={i}
              className="grid grid-cols-12 gap-4 px-5 py-3.5 border-t border-slate-800/60 text-sm items-center hover:bg-slate-900/40"
            >
              <div className="col-span-5 text-slate-200">
                {f.name}
                {f.note && <div className="text-xs text-slate-500 mt-0.5">{f.note}</div>}
              </div>
              <div className="col-span-3 text-emerald-300 font-medium text-xs">{f.us.toString()}</div>
              <div className="col-span-4 text-slate-300 font-medium text-xs">{f.them.toString()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Rating Radar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/60">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <h2 className="font-serif text-2xl font-extrabold text-white">六维评分</h2>
        </div>
        <div className="space-y-4">
          {c.ratings.map((r, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-3">
              <div className="col-span-3 text-sm text-slate-200 font-medium">{r.feature}</div>
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${(r.us / 5) * 100}%` }} />
                  </div>
                  <span className="text-xs text-emerald-300 font-semibold w-6 text-right">{r.us}</span>
                </div>
              </div>
              <div className="col-span-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-slate-500" style={{ width: `${(r.them / 5) * 100}%` }} />
                  </div>
                  <span className="text-xs text-slate-400 font-semibold w-6 text-right">{r.them}</span>
                </div>
              </div>
              <div className="col-span-1 text-xs">
                {r.us > r.them ? <Check className="w-4 h-4 text-emerald-400" /> : r.us < r.them ? <XIcon className="w-4 h-4 text-rose-400" /> : <span className="text-slate-500">=</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pros / Cons */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/60">
        <div className="grid lg:grid-cols-2 gap-6">
          {([
            { title: "Try AI Writer 优势", items: c.pros.us, color: "emerald", icon: Check },
            { title: "Try AI Writer 不足", items: c.cons.us, color: "amber", icon: XIcon },
            { title: `${c.competitor} 优势`, items: c.pros.them, color: "blue", icon: Check },
            { title: `${c.competitor} 不足`, items: c.cons.them, color: "rose", icon: XIcon },
          ] as const).map((block, i) => {
            const Icon = block.icon;
            return (
              <div
                key={i}
                className={`rounded-2xl border bg-slate-900/40 p-6 ${
                  block.color === "emerald" ? "border-emerald-500/30" :
                  block.color === "amber" ? "border-amber-500/30" :
                  block.color === "blue" ? "border-blue-500/30" :
                  "border-rose-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-5 h-5 ${
                    block.color === "emerald" ? "text-emerald-400" :
                    block.color === "amber" ? "text-amber-400" :
                    block.color === "blue" ? "text-blue-400" :
                    "text-rose-400"
                  }`} />
                  <h3 className="font-serif text-lg font-bold text-white">{block.title}</h3>
                </div>
                <ul className="space-y-2">
                  {block.items.map((p, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-slate-200">
                      <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${
                        block.color === "emerald" ? "bg-emerald-400" :
                        block.color === "amber" ? "bg-amber-400" :
                        block.color === "blue" ? "bg-blue-400" :
                        "bg-rose-400"
                      }`} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Use Case */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/60">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              <h3 className="font-serif text-lg font-bold text-white">谁该选 Try AI Writer</h3>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{c.whoShouldUse.us}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-slate-400" />
              <h3 className="font-serif text-lg font-bold text-white">谁该选 {c.competitor}</h3>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed">{c.whoShouldUse.them}</p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      {c.testimonial && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/60">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 text-center space-y-4">
            <Quote className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-lg sm:text-xl text-slate-100 font-medium leading-relaxed max-w-3xl mx-auto">
              &ldquo;{c.testimonial.quote}&rdquo;
            </p>
            <div className="text-sm text-slate-400">
              <span className="font-semibold text-slate-200">{c.testimonial.author}</span> · {c.testimonial.role}
            </div>
          </div>
        </section>
      )}

      {/* Related Comparisons */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/60">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-6 h-6 text-emerald-400" />
          <h2 className="font-serif text-2xl font-extrabold text-white">其它对比</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SLUGS.filter((s) => s !== slugKey).map((s) => {
            const other = COMPARISONS[s];
            if (!other) return null;
            return (
              <Link
                key={s}
                href={`/blog/comparison/${s}`}
                className="group rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              >
                <div className="text-sm font-semibold text-white group-hover:text-emerald-300">
                  Try AI Writer vs {other.competitor}
                </div>
                <div className="text-xs text-slate-500 mt-1">{other.subtitle}</div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 mt-2" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/60">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-teal-950/40 p-8 lg:p-12 text-center space-y-6">
          <Sparkles className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
            体验更好的 AI 写作工具
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto">
            100+ 写作工具,5 分钟上手,首月 $5 即可解锁全部功能。
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300"
          >
            <Zap className="w-5 h-5" />
            免费开始使用
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
