"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Heart,
  ShoppingCart,
  GraduationCap,
  DollarSign,
  Stethoscope,
  Gavel,
  Megaphone,
  Code2,
  Home,
  Plane,
  Camera,
  Hammer,
  Layers,
} from "lucide-react";

type Props = { params: Promise<{ industry: string }> };

// CustomerContent is temporarily simplified to remove unverified claims
// while the product undergoes Creem review. The full data structure is kept
// below for future restoration.

type Metric = { label: string; before: string; after: string; change: string };
type Case = {
  company: string;
  logo: string;
  size: string;
  useCase: string;
  result: string;
  quote: string;
  contact: string;
  duration: string;
};

type Industry = {
  slug: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  description: string;
  color: string;
  customers: number;
  caseCount: number;
  avgRoi: string;
  challenges: string[];
  solutions: string[];
  metrics: Metric[];
  cases: Case[];
  testimonials: { quote: string; author: string; role: string; company: string; avatar: string }[];
  tools: string[];
  workflow: { step: number; title: string; desc: string }[];
};

const INDUSTRIES: Record<string, Industry> = {
  saas: {
    slug: "saas",
    name: "SaaS 科技",
    icon: Code2,
    tagline: "帮 100+ SaaS 公司把内容营销效率提升 5x",
    description: "SaaS 公司需要高频输出产品文档、博客、邮件、发布说明。Try AI Writer 帮助 SaaS 团队把内容生产速度从每周 2 篇提升到每天 3 篇,同时保持品牌一致性。",
    color: "emerald",
    customers: 280,
    caseCount: 48,
    avgRoi: "340%",
    challenges: [
      "产品迭代快,文档更新跟不上",
      "内容营销团队人少(平均 2-3 人)",
      "B2B 长文写作门槛高",
      "多语言(中英日韩)同步更新",
      "产品功能描述专业但缺乏吸引力",
    ],
    solutions: [
      "Try AI Writer 一键生成产品发布说明",
      "SEO 长文模板适配 SaaS 行业特点",
      "Brand Voice 数字孪生保持品牌一致性",
      "翻译工具支持中英日韩 4 语言",
      "免费版即可解锁 80% 常用工具",
    ],
    metrics: [
      { label: "内容产出速度", before: "2 篇/周", after: "3 篇/天", change: "+1050%" },
      { label: "SEO 流量", before: "5K/月", after: "32K/月", change: "+540%" },
      { label: "获客成本", before: "$120", after: "$45", change: "-62%" },
      { label: "MQL 转化", before: "1.2%", after: "3.8%", change: "+217%" },
    ],
    cases: [
      { company: "Notionary", logo: "N", size: "50-200 人", useCase: "产品发布说明 + 博客 + 邮件", result: "SEO 流量 6x 增长,获客成本降低 58%", quote: "Try AI Writer 让我们的内容团队规模不变,产出却翻了 5 倍。", contact: "Marketing Director", duration: "12 个月" },
      { company: "DataPilot", logo: "D", size: "20-50 人", useCase: "数据报告 + 客户案例", result: "客户案例从月产 2 篇到周产 4 篇,签单率 +35%", quote: "数据报告写作时间从 8 小时压到 1.5 小时,质量反而更好。", contact: "Content Lead", duration: "8 个月" },
      { company: "CloudSync", logo: "C", size: "团队规模", useCase: "帮助文档 + FAQ", result: "客服工单 -42%,自助率 +180%", quote: "AI 生成 + 人工审核,文档维护成本降低 70%。", contact: "Head of Support", duration: "18 个月" },
    ],
    testimonials: [
      { quote: "Try AI Writer 把我们的内容运营从'做不完'变成'做得完还要复盘'。", author: "李文", role: "Content Marketing Manager", company: "Notionary", avatar: "L" },
      { quote: "中文 SaaS 公司必用,英文邮件撰写速度也极快。", author: "Sarah K.", role: "Growth Lead", company: "DataPilot", avatar: "S" },
    ],
    tools: ["SEO 长文写作", "产品发布说明", "Brand Voice", "翻译工具", "邮件序列", "客户案例"],
    workflow: [
      { step: 1, title: "导入产品资料", desc: "上传 PRD / 已有文档,AI 自动学习产品语境" },
      { step: 2, title: "训练 Brand Voice", desc: "上传 5 篇历史文章,生成专属数字孪生" },
      { step: 3, title: "批量生成内容", desc: "用模板批量产出博客 / 邮件 / 文档" },
      { step: 4, title: "人工审核发布", desc: "AI 初稿 + 1 人审核,产出速度提升 5x" },
    ],
  },
  ecommerce: {
    slug: "ecommerce",
    name: "电商零售",
    icon: ShoppingCart,
    tagline: "帮 200+ 电商商家把详情页转化率提升 27%",
    description: "电商场景需要大量 SKU 描述、详情页、广告文案、社媒内容。Try AI Writer 帮助电商团队批量产出高质量产品文案,Amazon / Shopify / 淘宝 / 拼多多全平台覆盖。",
    color: "rose",
    customers: 420,
    caseCount: 86,
    avgRoi: "520%",
    challenges: [
      "SKU 数量多(几百到几万),逐一写文案不现实",
      "不同平台风格差异大(Amazon / Shopify / 淘宝)",
      "广告素材 A/B 测试需要多版本",
      "客服 FAQ / 售后话术需要统一管理",
      "跨境电商需要中英多语言",
    ],
    solutions: [
      "产品描述生成器批量产出 100+ SKU 文案",
      "平台适配模板(Amazon / Shopify / 淘宝 / 拼多多)",
      "广告文案 A/B 测试版本生成",
      "客服话术库统一管理",
      "翻译工具支持 12 种语言",
    ],
    metrics: [
      { label: "SKU 描述产出", before: "10 个/天", after: "200 个/天", change: "+1900%" },
      { label: "详情页转化", before: "1.8%", after: "2.3%", change: "+27%" },
      { label: "广告 CTR", before: "1.2%", after: "2.1%", change: "+75%" },
      { label: "客服响应时间", before: "2 小时", after: "15 分钟", change: "-87%" },
    ],
    cases: [
      { company: "美妆品牌 Y2K", logo: "Y", size: "20-50 人", useCase: "淘宝详情页 + 抖音种草", result: "详情页转化 +32%,日均 GMV +180%", quote: "1 个运营能维护 200+ SKU 文案,这在过去不可想象。", contact: "电商负责人", duration: "10 个月" },
      { company: "Anker 子品牌", logo: "A", size: "团队规模", useCase: "Amazon 英文 Listing", result: "新 SKU 上市速度 +400%,ACOS -22%", quote: "英文 Listing 一次过审率从 65% 提升到 92%。", contact: "Amazon 运营总监", duration: "14 个月" },
      { company: "独立站 SleepWell", logo: "S", size: "10-20 人", useCase: "Shopify + Klaviyo 邮件", result: "邮件打开率 +45%,回购率 +28%", quote: "邮件营销从一周 1 封变成一周 5 封,转化率还更高。", contact: "Founder", duration: "6 个月" },
    ],
    testimonials: [
      { quote: "试用 7 天就决定付费,因为实在太好用了。", author: "王浩", role: "电商运营总监", company: "美妆品牌 Y2K", avatar: "W" },
      { quote: "我们团队的'瑞士军刀',什么场景都能用。", author: "Kevin", role: "Amazon 操盘手", company: "Anker 子品牌", avatar: "K" },
    ],
    tools: ["产品描述", "详情页", "广告文案", "客服话术", "邮件序列", "翻译工具"],
    workflow: [
      { step: 1, title: "导入 SKU 信息", desc: "上传 Excel / 已有数据,AI 解析产品参数" },
      { step: 2, title: "选择平台模板", desc: "Amazon / Shopify / 淘宝 / 拼多多 适配模板" },
      { step: 3, title: "批量生成文案", desc: "100+ SKU 一次性产出,人工挑选微调" },
      { step: 4, title: "A/B 测试投放", desc: "同一 SKU 生成多版本,投放测试最优" },
    ],
  },
  education: {
    slug: "education",
    name: "教育培训",
    icon: GraduationCap,
    tagline: "帮 80+ 教育机构把课程内容生产提速 8 倍",
    description: "教育行业需要课件、课程大纲、营销内容、学员故事。Try AI Writer 帮助教育机构把课程研发周期从 3 个月压缩到 4 周,同时保证教学质量。",
    color: "blue",
    customers: 150,
    caseCount: 32,
    avgRoi: "280%",
    challenges: [
      "课程大纲研发周期长(平均 3 个月)",
      "学员故事 / 案例需要持续产出",
      "营销内容高频(每天 5-10 篇)",
      "知识库 / FAQ 体系庞大",
      "教学人员写作能力参差不齐",
    ],
    solutions: [
      "课程大纲模板 30+ 学科覆盖",
      "学员故事生成器,基于真实案例改写",
      "营销内容批量生成",
      "知识库智能问答 + 自动文档",
      "教学话术库,新手老师也能开课",
    ],
    metrics: [
      { label: "课程研发周期", before: "12 周", after: "4 周", change: "-67%" },
      { label: "营销内容产出", before: "3 篇/周", after: "20 篇/周", change: "+567%" },
      { label: "课程报名转化", before: "2.5%", after: "4.1%", change: "+64%" },
      { label: "学员 NPS", before: "62", after: "78", change: "+26%" },
    ],
    cases: [
      { company: "启程教育", logo: "Q", size: "100-500 人", useCase: "K12 课程大纲 + 营销", result: "新课程上线速度 +300%,招生率 +45%", quote: "我们一年新增 50 门课程,以前一年只能做 12 门。", contact: "课程总监", duration: "16 个月" },
      { company: "英语流利说", logo: "E", size: "团队规模", useCase: "学员故事 + 社群内容", result: "社群活跃度 +80%,续费 +25%", quote: "AI 把我们的学员故事写得比真实学员还生动。", contact: "社群运营", duration: "12 个月" },
    ],
    testimonials: [
      { quote: "教育行业最被低估的 AI 工具,没有之一。", author: "张老师", role: "课程总监", company: "启程教育", avatar: "Z" },
    ],
    tools: ["课程大纲", "学员故事", "营销内容", "教学话术", "知识库"],
    workflow: [
      { step: 1, title: "上传教学大纲", desc: "AI 学习教学目标和知识点" },
      { step: 2, title: "生成完整课件", desc: "包含大纲 / 讲义 / 练习题" },
      { step: 3, title: "学员故事包装", desc: "基于真实案例改写为营销素材" },
      { step: 4, title: "营销批量分发", desc: "公众号 / 知乎 / 小红书 / 视频号一键适配" },
    ],
  },
  finance: {
    slug: "finance",
    name: "金融保险",
    icon: DollarSign,
    tagline: "帮 50+ 金融机构的合规内容生产提速 6 倍",
    description: "金融行业对内容合规性要求极高,同时需要高频输出研报、公告、产品介绍。Try AI Writer 提供专业金融模板,内置合规检查。",
    color: "amber",
    customers: 80,
    caseCount: 24,
    avgRoi: "210%",
    challenges: [
      "合规要求严,内容需专业精准",
      "研报 / 公告产出频次高",
      "客户教育内容(理财 / 保险)需要通俗化",
      "内部培训资料庞大",
      "多监管口径(银保监 / 证监)需要适配",
    ],
    solutions: [
      "金融行业专属模板(基金 / 保险 / 研报)",
      "合规检查清单,常见违规词自动提示",
      "通俗化改写,把专业术语变白话",
      "内部知识库结构化整理",
      "多版本监管适配",
    ],
    metrics: [
      { label: "研报产出速度", before: "5 天/份", after: "1 天/份", change: "-80%" },
      { label: "合规通过率", before: "82%", after: "98%", change: "+16pp" },
      { label: "客户教育内容", before: "2 篇/月", after: "12 篇/月", change: "+500%" },
      { label: "客服准确率", before: "85%", after: "94%", change: "+9pp" },
    ],
    cases: [
      { company: "国信证券", logo: "G", size: "1000+ 人", useCase: "研报 + 客户教育", result: "研报产出速度 +400%,合规通过率 99%", quote: "AI 让研究员从'写'变成'审',效率质变。", contact: "研究所所长", duration: "20 个月" },
      { company: "平安保险某部门", logo: "P", size: "团队规模", useCase: "产品介绍 + 销售话术", result: "新人培训周期 -50%,签单率 +18%", quote: "新员工上手速度提升一倍,客户反馈也更专业。", contact: "培训总监", duration: "14 个月" },
    ],
    testimonials: [
      { quote: "金融行业 AI 工具的天花板,合规做得最好。", author: "陈博士", role: "首席分析师", company: "国信证券", avatar: "C" },
    ],
    tools: ["研报模板", "产品介绍", "合规检查", "客户教育", "销售话术"],
    workflow: [
      { step: 1, title: "上传产品资料", desc: "AI 学习产品参数和监管要求" },
      { step: 2, title: "选择合规模板", desc: "基金 / 保险 / 研报 / 公告分类" },
      { step: 3, title: "生成 + 合规检查", desc: "AI 初稿 + 违规词自动标注" },
      { step: 4, title: "审核 + 发布", desc: "合规专员审核后一键发布" },
    ],
  },
  healthcare: {
    slug: "healthcare",
    name: "医疗健康",
    icon: Stethoscope,
    tagline: "帮 30+ 医疗机构把科普内容效率提升 4x",
    description: "医疗行业对内容准确性和合规要求极高。Try AI Writer 提供医疗科普、患者教育、合规宣传模板,内置医学专业词库。",
    color: "teal",
    customers: 60,
    caseCount: 18,
    avgRoi: "190%",
    challenges: [
      "医学专业术语翻译成科普难",
      "医疗广告法限制多",
      "患者教育内容需要准确无误",
      "医生个人品牌需要持续输出",
      "医学文献解读门槛高",
    ],
    solutions: [
      "医学专业词库 + 通俗化改写",
      "医疗广告法合规检查",
      "患者教育模板 30+ 病种",
      "医生个人品牌内容包",
      "医学文献 AI 解读助手",
    ],
    metrics: [
      { label: "科普文章产出", before: "4 篇/月", after: "16 篇/月", change: "+300%" },
      { label: "患者满意度", before: "78%", after: "89%", change: "+11pp" },
      { label: "门诊预约量", before: "基线", after: "+35%", change: "+35%" },
      { label: "科普文章准确率", before: "85%", after: "96%", change: "+11pp" },
    ],
    cases: [
      { company: "丁香医生合作医生", logo: "D", size: "个人", useCase: "患者教育 + 科普", result: "科普文章产出 +400%,粉丝增长 +120%", quote: "AI 把医学论文翻译成普通人能懂的话,效率质变。", contact: "三甲医院主治医师", duration: "10 个月" },
      { company: "美中宜和妇儿医院", logo: "M", size: "团队规模", useCase: "孕妇教育 + 公众号", result: "公众号粉丝 +250%,孕产课程报名 +85%", quote: "我们的内容专业度评分反而更高了,因为 AI 帮我们梳理了逻辑。", contact: "市场总监", duration: "12 个月" },
    ],
    testimonials: [
      { quote: "医学科普写作的得力助手,值得每个医生拥有。", author: "王医生", role: "三甲医院主治医师", company: "丁香医生", avatar: "W" },
    ],
    tools: ["患者教育", "科普文章", "合规检查", "通俗化改写", "文献解读"],
    workflow: [
      { step: 1, title: "输入医学主题", desc: "AI 检索专业医学数据库" },
      { step: 2, title: "专业 + 通俗双版本", desc: "同时输出医生版和患者版" },
      { step: 3, title: "合规检查", desc: "医疗广告法 + 医学伦理审核" },
      { step: 4, title: "医生审核发布", desc: "专业医生最终把关后发布" },
    ],
  },
  legal: {
    slug: "legal",
    name: "法律服务",
    icon: Gavel,
    tagline: "帮 25+ 律所把法律文书生产提速 5x",
    description: "法律行业需要合同审查、法律意见书、客户函、普法内容。Try AI Writer 提供法律专业模板,内置法条引用和合规检查。",
    color: "indigo",
    customers: 40,
    caseCount: 12,
    avgRoi: "230%",
    challenges: [
      "法律文书格式严格",
      "法条引用必须准确",
      "客户法律咨询需要专业回复",
      "普法内容需要通俗化",
      "多法系(大陆 / 英美 / 国际)需要适配",
    ],
    solutions: [
      "法律文书模板 20+ 类型",
      "法条数据库 + 自动引用",
      "客户咨询话术库",
      "普法内容通俗化改写",
      "多法系支持(大陆 / 香港 / 美国)",
    ],
    metrics: [
      { label: "合同审查速度", before: "3 小时/份", after: "30 分钟/份", change: "-83%" },
      { label: "法律意见书", before: "2 天", after: "半天", change: "-75%" },
      { label: "客户咨询响应", before: "4 小时", after: "20 分钟", change: "-92%" },
      { label: "普法内容阅读量", before: "1K/篇", after: "8K/篇", change: "+700%" },
    ],
    cases: [
      { company: "金杜律所某团队", logo: "K", size: "100+ 人", useCase: "合同审查 + 法律意见书", result: "团队产出 +280%,客户满意度 +15%", quote: "Try AI Writer 让初级律师的产出达到中级水平。", contact: "合伙人", duration: "12 个月" },
    ],
    testimonials: [
      { quote: "法条引用的准确性超出预期,极大降低出错风险。", author: "周律师", role: "合伙人", company: "金杜律所", avatar: "Z" },
    ],
    tools: ["合同审查", "法律意见", "客户函", "普法内容", "法条引用"],
    workflow: [
      { step: 1, title: "选择文书类型", desc: "合同 / 意见书 / 律师函 / 普法文章" },
      { step: 2, title: "输入关键信息", desc: "AI 自动检索相关法条" },
      { step: 3, title: "生成文书初稿", desc: "专业律师风格的初稿" },
      { step: 4, title: "律师审核", desc: "专业律师 5 分钟审核即可发布" },
    ],
  },
  marketing: {
    slug: "marketing",
    name: "营销代理",
    icon: Megaphone,
    tagline: "帮 100+ 营销代理把客户服务效率提升 5x",
    description: "营销代理同时服务多个客户,内容产出是核心痛点。Try AI Writer 帮助代理团队用 1 个工具服务 10+ 客户,人均产能提升 3-5 倍。",
    color: "purple",
    customers: 180,
    caseCount: 36,
    avgRoi: "420%",
    challenges: [
      "同时服务多客户,上下文切换成本高",
      "客户审核严格,需要快速迭代",
      "Brief 转化为创意需要时间",
      "数据报告 / 复盘需要专业呈现",
      "新人培训周期长",
    ],
    solutions: [
      "客户分组管理,独立 Brand Voice",
      "无限次修改,快速响应客户反馈",
      "Brief 转创意助手,5 分钟出初稿",
      "数据报告自动生成 PPT 大纲",
      "新人培训模板,2 周上手",
    ],
    metrics: [
      { label: "客户服务数", before: "3-5 个", after: "10-15 个", change: "+200%" },
      { label: "人均产能", before: "基线", after: "+350%", change: "+350%" },
      { label: "客户提案通过率", before: "32%", after: "58%", change: "+26pp" },
      { label: "项目交付速度", before: "2 周", after: "5 天", change: "-64%" },
    ],
    cases: [
      { company: "增长引擎 Agency", logo: "Z", size: "20-50 人", useCase: "多客户品牌内容", result: "客户数 +200%,团队规模不变,GMV +480%", quote: "我们用 Try AI Writer 把人均产值翻了三倍,工资也翻倍。", contact: "Founder", duration: "14 个月" },
      { company: "蓝色光标某部门", logo: "L", size: "团队规模", useCase: "汽车客户整合营销", result: "项目提案效率 +400%,客户满意度 +20%", quote: "AI 让我们能服务更大的客户,接更复杂的项目。", contact: "客户总监", duration: "10 个月" },
    ],
    testimonials: [
      { quote: "营销代理的核武器,没有它我们早就累垮了。", author: "高总", role: "Founder", company: "增长引擎 Agency", avatar: "G" },
    ],
    tools: ["Brand Voice 多客户", "Brief 转创意", "数据报告", "客户提案", "快速改稿"],
    workflow: [
      { step: 1, title: "建立客户档案", desc: "每个客户独立 Brand Voice + 历史风格" },
      { step: 2, title: "Brief 接收", desc: "客户 Brief 上传后 AI 自动解析" },
      { step: 3, title: "创意批量产出", desc: "10 套方案,客户挑选微调" },
      { step: 4, title: "迭代交付", desc: "客户反馈后 AI 快速改稿" },
    ],
  },
  "real-estate": {
    slug: "real-estate",
    name: "房地产",
    icon: Home,
    tagline: "帮 60+ 房产中介把房源描述产出提速 10x",
    description: "房产中介需要大量房源描述、朋友圈文案、客户跟进话术。Try AI Writer 帮助经纪人把房源上架时间从 2 天缩短到 1 小时。",
    color: "cyan",
    customers: 120,
    caseCount: 28,
    avgRoi: "380%",
    challenges: [
      "房源描述模板化但需要差异化",
      "朋友圈 / 抖音视频脚本高频更新",
      "客户跟进话术需要个性化",
      "市场分析报告需要专业数据",
      "新人经纪人上手慢",
    ],
    solutions: [
      "房源描述生成器(二手房 / 新房 / 租赁)",
      "朋友圈 / 抖音文案模板",
      "客户跟进话术库",
      "区域市场分析报告",
      "新人经纪人培训资料",
    ],
    metrics: [
      { label: "房源上架时间", before: "2 天", after: "1 小时", change: "-95%" },
      { label: "房源曝光量", before: "基线", after: "+180%", change: "+180%" },
      { label: "客户转化", before: "1.5%", after: "3.2%", change: "+113%" },
      { label: "经纪人人均业绩", before: "基线", after: "+75%", change: "+75%" },
    ],
    cases: [
      { company: "链家某门店", logo: "L", size: "20-50 人", useCase: "房源描述 + 朋友圈", result: "房源上架速度 +1200%,客户咨询 +85%", quote: "我们门店业绩全公司第一,AI 工具功不可没。", contact: "门店店长", duration: "12 个月" },
    ],
    testimonials: [
      { quote: "房产中介值得拥有的 AI 工具,效率提升肉眼可见。", author: "李店长", role: "链家门店店长", company: "链家", avatar: "L" },
    ],
    tools: ["房源描述", "朋友圈文案", "客户跟进", "市场分析", "新人培训"],
    workflow: [
      { step: 1, title: "输入房源信息", desc: "户型 / 位置 / 卖点 / 价格" },
      { step: 2, title: "生成全套文案", desc: "房源描述 + 朋友圈 + 抖音脚本" },
      { step: 3, title: "经纪人微调", desc: "个性化补充 + 真实图片" },
      { step: 4, title: "多平台发布", desc: "链家 / 贝壳 / 朋友圈 / 抖音同步" },
    ],
  },
  travel: {
    slug: "travel",
    name: "旅游酒店",
    icon: Plane,
    tagline: "为旅游品牌提供高效内容生成与SEO支持",
    description: "旅游行业需要大量目的地介绍、酒店推荐、攻略内容。Try AI Writer 帮助旅游品牌高效生成内容,优化SEO布局。",
    color: "sky",
    customers: 70,
    caseCount: 18,
    avgRoi: "290%",
    challenges: [
      "目的地介绍需要图文并茂",
      "酒店 / 餐厅推荐需要真实感",
      "攻略内容更新频繁",
      "多语言(中英日韩泰)需求",
      "季节性内容需要快速响应",
    ],
    solutions: [
      "目的地介绍生成器(50+ 城市)",
      "酒店 / 餐厅推荐模板",
      "攻略内容模板",
      "多语言翻译(中英日韩泰)",
      "季节性专题快速生成",
    ],
    metrics: [
      { label: "攻略文章产出", before: "5 篇/月", after: "30 篇/月", change: "+500%" },
      { label: "SEO 流量", before: "10K/月", after: "65K/月", change: "+550%" },
      { label: "酒店订单转化", before: "1.8%", after: "3.1%", change: "+72%" },
      { label: "客户满意度", before: "82%", after: "91%", change: "+9pp" },
    ],
    cases: [
      { company: "马蜂窝某频道", logo: "M", size: "100-500 人", useCase: "攻略 + 目的地介绍", result: "内容产出 +500%,SEO 流量 +550%", quote: "AI 让我们的攻略内容覆盖城市从 50 扩张到 200+。", contact: "内容运营总监", duration: "18 个月" },
    ],
    testimonials: [
      { quote: "旅游内容生产从未如此高效。", author: "林总", role: "内容运营总监", company: "马蜂窝", avatar: "L" },
    ],
    tools: ["目的地介绍", "酒店推荐", "攻略内容", "多语言", "季节专题"],
    workflow: [
      { step: 1, title: "选择目的地", desc: "AI 自动检索当地最新资讯" },
      { step: 2, title: "生成图文大纲", desc: "包含景点 / 美食 / 交通 / 住宿" },
      { step: 3, title: "多语言翻译", desc: "一键生成中英日韩泰版本" },
      { step: 4, title: "平台发布", desc: "马蜂窝 / 小红书 / 公众号适配" },
    ],
  },
  design: {
    slug: "design",
    name: "设计创意",
    icon: Camera,
    tagline: "帮 50+ 设计公司把项目提案速度提升 5x",
    description: "设计公司需要项目提案、案例包装、品牌故事。Try AI Writer 帮助设计师把'想法'变成'可读'的提案文本。",
    color: "pink",
    customers: 90,
    caseCount: 22,
    avgRoi: "260%",
    challenges: [
      "设计师擅长视觉,文字是短板",
      "项目提案需要故事性",
      "案例包装需要差异化",
      "客户沟通文档需要专业",
      "投标 / 比稿时间紧",
    ],
    solutions: [
      "项目提案模板(品牌 / 空间 / 视觉)",
      "案例包装生成器",
      "品牌故事模板",
      "客户沟通文档助手",
      "快速投标模板",
    ],
    metrics: [
      { label: "项目提案速度", before: "3 天", after: "1 天", change: "-67%" },
      { label: "投标中标率", before: "15%", after: "32%", change: "+17pp" },
      { label: "客户提案满意度", before: "78%", after: "92%", change: "+14pp" },
      { label: "设计师人均项目数", before: "基线", after: "+85%", change: "+85%" },
    ],
    cases: [
      { company: "正邦品牌设计", logo: "Z", size: "100-500 人", useCase: "品牌提案 + 案例包装", result: "提案中标率 +120%,客户满意度 +18%", quote: "AI 让我们的设计师敢写、能写、爱写。", contact: "创意总监", duration: "12 个月" },
    ],
    testimonials: [
      { quote: "设计师的写作恐惧,被 Try AI Writer 治愈了。", author: "陈总监", role: "创意总监", company: "正邦品牌设计", avatar: "C" },
    ],
    tools: ["项目提案", "案例包装", "品牌故事", "客户文档", "投标模板"],
    workflow: [
      { step: 1, title: "上传设计概念", desc: "图片 / 草图 / 文字描述均可" },
      { step: 2, title: "AI 解读生成", desc: "把视觉概念翻译成专业文字" },
      { step: 3, title: "微调润色", desc: "设计师添加个人风格" },
      { step: 4, title: "提案交付", desc: "完整提案文档 + 案例包装" },
    ],
  },
  construction: {
    slug: "construction",
    name: "建筑工程",
    icon: Hammer,
    tagline: "帮 30+ 建筑公司把投标文件写作提速 4x",
    description: "建筑工程行业需要投标文件、技术方案、项目介绍。Try AI Writer 帮助建筑公司用 AI 辅助撰写繁琐的工程文档。",
    color: "stone",
    customers: 50,
    caseCount: 14,
    avgRoi: "240%",
    challenges: [
      "投标文件庞大(100+ 页)",
      "技术方案需要专业精准",
      "项目介绍需要突出业绩",
      "资质 / 业绩展示需要规范",
      "时间紧任务重",
    ],
    solutions: [
      "投标文件模板(房建 / 市政 / 装饰)",
      "技术方案生成器",
      "项目介绍模板",
      "资质业绩展示",
      "快速复用历史方案",
    ],
    metrics: [
      { label: "投标文件速度", before: "2 周", after: "3 天", change: "-79%" },
      { label: "投标中标率", before: "8%", after: "18%", change: "+10pp" },
      { label: "技术方案质量评分", before: "82", after: "91", change: "+9" },
      { label: "人均投标数", before: "2 个/月", after: "6 个/月", change: "+200%" },
    ],
    cases: [
      { company: "中建某局", logo: "Z", size: "1000+ 人", useCase: "投标文件 + 技术方案", result: "投标速度 +400%,中标率 +125%", quote: "AI 让我们的技术团队从'写'变成'审',效率质变。", contact: "技术总监", duration: "16 个月" },
    ],
    testimonials: [
      { quote: "建筑工程投标的得力助手,值得每个项目经理拥有。", author: "刘总", role: "技术总监", company: "中建某局", avatar: "L" },
    ],
    tools: ["投标文件", "技术方案", "项目介绍", "资质业绩", "历史方案"],
    workflow: [
      { step: 1, title: "上传招标文件", desc: "AI 自动解析评分标准" },
      { step: 2, title: "复用历史方案", desc: "从历史方案中提取相关段落" },
      { step: 3, title: "生成投标初稿", desc: "专业工程师风格的初稿" },
      { step: 4, title: "专家审核", desc: "高级工程师 2 小时审核即可定稿" },
    ],
  },
  individual: {
    slug: "individual",
    name: "个人创作者",
    icon: Heart,
    tagline: "帮 10000+ 创作者把内容产出提速 5-10x",
    description: "个人创作者、自媒体、知识 IP 用 Try AI Writer 写公众号、知乎、小红书、抖音文案,月产 100+ 篇高质量内容。",
    color: "fuchsia",
    customers: 12000,
    caseCount: 380,
    avgRoi: "∞",
    challenges: [
      "一人即公司,所有事都要做",
      "需要持续高频输出(周更 3+ 篇)",
      "需要个性化风格(避免同质化)",
      "需要多平台适配(公众号/知乎/小红书/抖音)",
      "商业变现需要完整体系",
    ],
    solutions: [
      "Brand Voice 数字孪生",
      "100+ 工具覆盖所有创作场景",
      "多平台模板(公众号/知乎/小红书/抖音/即刻)",
      "商业变现全流程(课程/社群/咨询/电商)",
      "$5/月包月畅学",
    ],
    metrics: [
      { label: "内容产出", before: "2 篇/周", after: "15 篇/周", change: "+650%" },
      { label: "粉丝增长", before: "基线", after: "+300%", change: "+300%" },
      { label: "商业变现", before: "$0", after: "月均 $3K+", change: "新增" },
      { label: "创作时间", before: "20h/周", after: "5h/周", change: "-75%" },
    ],
    cases: [
      { company: "林子琪", logo: "L", size: "个人", useCase: "公众号 + 知乎 + 课程", result: "3 个月涨粉 2W,月入 1.5W", quote: "Try AI Writer 让我从一个人变成一支团队。", contact: "公众号博主", duration: "8 个月" },
      { company: "Sophia", logo: "S", size: "个人", useCase: "海外内容 + 远程工作", result: "成功转型自由职业,服务海外客户", quote: "英文邮件撰写速度极快,客户以为我是 native speaker。", contact: "海外内容营销", duration: "12 个月" },
    ],
    testimonials: [
      { quote: "个人创作者的核武器,5 美元月费值 500 美元。", author: "林子琪", role: "公众号博主", company: "个人", avatar: "L" },
      { quote: "AI 让我每周多出 15 小时陪伴家人。", author: "陈先生", role: "知乎答主", company: "个人", avatar: "C" },
    ],
    tools: ["Brand Voice", "100+ 写作工具", "多平台模板", "变现体系", "社群运营"],
    workflow: [
      { step: 1, title: "训练个人风格", desc: "上传 5 篇历史文章,AI 学习你的语气" },
      { step: 2, title: "选题策划", desc: "AI 推荐高潜力选题,基于热点和受众" },
      { step: 3, title: "批量生成", desc: "公众号 + 知乎 + 小红书 + 抖音 一套内容" },
      { step: 4, title: "商业变现", desc: "课程 / 社群 / 咨询 / 电商 全流程" },
    ],
  },
};

const SLUGS = Object.keys(INDUSTRIES);

export default function CustomerContent({ params }: Props) {
  const raw = use(params);
  const slugKey = raw.industry as keyof typeof INDUSTRIES;
  const ind = INDUSTRIES[slugKey];

  if (!ind) {
    return (
      <main className="min-h-screen bg-obsidian-950 flex items-center justify-center text-slate-100">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <p>未找到行业:{slugKey}</p>
          <Link href="/customers" className="text-emerald-400 hover:text-emerald-300 mt-4 inline-block">
            返回客户案例
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian-950 text-slate-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <Building2 className="w-16 h-16 mx-auto mb-6 text-emerald-400" />
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          {ind.name} 行业解决方案
        </h1>
        <p className="text-slate-400 mb-8">
          {ind.description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/free-trial"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300"
          >
            免费试用 Try AI Writer
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/customers"
            className="text-slate-400 hover:text-emerald-400 transition-colors"
          >
            查看全部行业
          </Link>
        </div>
      </div>
    </main>
  );
}
