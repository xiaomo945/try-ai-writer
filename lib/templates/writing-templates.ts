export type TemplateCategory =
  | "marketing"
  | "email"
  | "social"
  | "blog"
  | "creative"
  | "academic";

export interface WritingTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  prompt: string;
  example?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedWords: string;
  icon: string;
}

export const CATEGORY_INFO: Record<
  TemplateCategory,
  { label: string; icon: string; color: string }
> = {
  marketing: { label: "营销文案", icon: "📢", color: "emerald" },
  email: { label: "商务邮件", icon: "📧", color: "blue" },
  social: { label: "社交媒体", icon: "📱", color: "purple" },
  blog: { label: "博客文章", icon: "📝", color: "orange" },
  creative: { label: "创意写作", icon: "🎨", color: "pink" },
  academic: { label: "学术写作", icon: "📚", color: "indigo" },
};

export const WRITING_TEMPLATES: WritingTemplate[] = [
  // ==================== 营销文案 (10) ====================
  {
    id: "mkt-001",
    title: "产品发布文案",
    description: "用于新产品上线时的推广文案，突出核心卖点和用户价值",
    category: "marketing",
    tags: ["产品发布", "推广", "卖点"],
    prompt:
      "请为以下产品写一篇产品发布推广文案：\n\n产品名称：{product_name}\n核心功能：{features}\n目标用户：{target_audience}\n独特卖点：{unique_selling_point}\n\n要求：\n1. 标题吸引眼球\n2. 突出痛点和解决方案\n3. 包含明确的行动号召\n4. 字数500-800字",
    difficulty: "intermediate",
    estimatedWords: "500-800",
    icon: "🚀",
  },
  {
    id: "mkt-002",
    title: "限时促销活动",
    description: "限时折扣、闪购等促销活动的推广文案",
    category: "marketing",
    tags: ["促销", "折扣", "限时"],
    prompt:
      "请写一篇限时促销活动推广文案：\n\n活动名称：{campaign_name}\n折扣力度：{discount}\n活动时间：{duration}\n参与产品：{products}\n\n要求：\n1. 制造紧迫感\n2. 突出优惠力度\n3. 简洁明了的行动指引\n4. 字数300-500字",
    difficulty: "beginner",
    estimatedWords: "300-500",
    icon: "🔥",
  },
  {
    id: "mkt-003",
    title: "品牌故事",
    description: "讲述品牌创立背景、使命和价值观的品牌故事文案",
    category: "marketing",
    tags: ["品牌", "故事", "价值观"],
    prompt:
      "请为以下品牌撰写品牌故事：\n\n品牌名称：{brand_name}\n创立年份：{year}\n创始人故事：{founder_story}\n品牌使命：{mission}\n核心价值：{values}\n\n要求：\n1. 情感共鸣\n2. 真实可信\n3. 传递品牌温度\n4. 字数600-1000字",
    difficulty: "advanced",
    estimatedWords: "600-1000",
    icon: "✨",
  },
  {
    id: "mkt-004",
    title: "客户案例",
    description: "展示客户成功故事和使用体验的案例文案",
    category: "marketing",
    tags: ["案例", "客户", "成功故事"],
    prompt:
      "请撰写一篇客户成功案例：\n\n客户名称：{customer_name}\n客户行业：{industry}\n使用产品：{product}\n解决的问题：{problem}\n取得的效果：{results}\n客户评价：{testimonial}\n\n要求：\n1. 结构清晰（背景-挑战-方案-成果）\n2. 数据支撑\n3. 真实可信\n4. 字数800-1200字",
    difficulty: "intermediate",
    estimatedWords: "800-1200",
    icon: "🏆",
  },
  {
    id: "mkt-005",
    title: "广告标题组",
    description: "为产品或活动生成多个广告标题选项",
    category: "marketing",
    tags: ["广告", "标题", "创意"],
    prompt:
      "请为以下产品/活动生成10个广告标题：\n\n产品/活动：{subject}\n核心卖点：{selling_point}\n目标受众：{audience}\n投放渠道：{channel}\n\n要求：\n1. 每个标题风格不同\n2. 包含情感型、理性型、紧迫型等多种类型\n3. 简洁有力，适合广告投放\n4. 每个标题不超过20字",
    difficulty: "beginner",
    estimatedWords: "200-300",
    icon: "💡",
  },
  {
    id: "mkt-006",
    title: "产品对比文案",
    description: "突出产品竞争优势的对比分析文案",
    category: "marketing",
    tags: ["对比", "竞品", "优势"],
    prompt:
      "请撰写一篇产品对比文案：\n\n我们的产品：{our_product}\n竞品名称：{competitor}\n我们的优势：{our_advantages}\n目标用户：{audience}\n\n要求：\n1. 客观公正\n2. 突出差异化优势\n3. 用数据说话\n4. 字数500-800字",
    difficulty: "intermediate",
    estimatedWords: "500-800",
    icon: "⚖️",
  },
  {
    id: "mkt-007",
    title: "用户证言集",
    description: "收集和整理用户好评、使用体验的文案",
    category: "marketing",
    tags: ["证言", "口碑", "评价"],
    prompt:
      "请整理以下用户评价，编写用户证言集：\n\n产品名称：{product}\n用户评价原始数据：{raw_reviews}\n\n要求：\n1. 精选最有代表性的评价\n2. 按主题分类整理\n3. 突出具体使用场景\n4. 保持原始真实性",
    difficulty: "beginner",
    estimatedWords: "400-600",
    icon: "💬",
  },
  {
    id: "mkt-008",
    title: "落地页文案",
    description: "高转化率的落地页完整文案",
    category: "marketing",
    tags: ["落地页", "转化", "Landing Page"],
    prompt:
      "请撰写一个完整的落地页文案：\n\n产品/服务：{product}\n目标动作：{cta}\n目标受众：{audience}\n核心卖点：{selling_points}\n社会证明：{social_proof}\n\n要求：\n1. 包含：标题区-痛点区-方案区-功能展示-社会证明-FAQ-CTA\n2. 说服逻辑清晰\n3. 每个区块都有明确的转化目标\n4. 字数1500-2500字",
    difficulty: "advanced",
    estimatedWords: "1500-2500",
    icon: "🎯",
  },
  {
    id: "mkt-009",
    title: "节日营销文案",
    description: "结合节日热点的营销活动文案",
    category: "marketing",
    tags: ["节日", "热点", "活动"],
    prompt:
      "请撰写一篇节日营销文案：\n\n节日名称：{holiday}\n品牌/产品：{brand}\n活动形式：{activity}\n优惠内容：{offer}\n\n要求：\n1. 结合节日氛围\n2. 自然融入品牌信息\n3. 有互动性\n4. 字数400-600字",
    difficulty: "beginner",
    estimatedWords: "400-600",
    icon: "🎉",
  },
  {
    id: "mkt-010",
    title: "新闻稿",
    description: "企业或产品新闻发布稿",
    category: "marketing",
    tags: ["新闻", "PR", "发布"],
    prompt:
      "请撰写一篇新闻稿：\n\n新闻主题：{topic}\n发布单位：{company}\n关键信息：{key_info}\n引用人物：{spokesperson}\n\n要求：\n1. 倒金字塔结构\n2. 客观专业\n3. 包含新闻五要素\n4. 字数600-1000字",
    difficulty: "intermediate",
    estimatedWords: "600-1000",
    icon: "📰",
  },

  // ==================== 商务邮件 (8) ====================
  {
    id: "email-001",
    title: "商务合作邀请",
    description: "向潜在合作伙伴发送的合作邀请邮件",
    category: "email",
    tags: ["合作", "商务", "邀请"],
    prompt:
      "请撰写一封商务合作邀请邮件：\n\n发件方：{sender_company}\n收件方：{recipient_company}\n合作方向：{cooperation_type}\n我方优势：{our_advantages}\n期望合作方式：{expected_cooperation}\n\n要求：\n1. 专业得体\n2. 突出双赢\n3. 简洁明了\n4. 包含明确的下一步",
    difficulty: "intermediate",
    estimatedWords: "300-500",
    icon: "🤝",
  },
  {
    id: "email-002",
    title: "客户跟进邮件",
    description: "对潜在客户或已有客户的跟进邮件",
    category: "email",
    tags: ["跟进", "客户", "销售"],
    prompt:
      "请撰写一封客户跟进邮件：\n\n客户名称：{customer}\n上次沟通内容：{last_contact}\n本次跟进目的：{purpose}\n需要推进的事项：{action_items}\n\n要求：\n1. 语气友好不过分热情\n2. 提供新的价值信息\n3. 有明确的行动号召\n4. 字数200-400字",
    difficulty: "beginner",
    estimatedWords: "200-400",
    icon: "📬",
  },
  {
    id: "email-003",
    title: "项目进度汇报",
    description: "向领导或客户汇报项目进展的邮件",
    category: "email",
    tags: ["项目", "汇报", "进度"],
    prompt:
      "请撰写一封项目进度汇报邮件：\n\n项目名称：{project}\n汇报对象：{recipient}\n本期完成：{completed}\n进行中：{in_progress}\n遇到问题：{issues}\n下期计划：{next_steps}\n\n要求：\n1. 结构清晰\n2. 重点突出\n3. 问题附带解决方案\n4. 字数300-500字",
    difficulty: "intermediate",
    estimatedWords: "300-500",
    icon: "📊",
  },
  {
    id: "email-004",
    title: "会议邀请",
    description: "邀请参加内部或外部会议的邮件",
    category: "email",
    tags: ["会议", "邀请", "日程"],
    prompt:
      "请撰写一封会议邀请邮件：\n\n会议主题：{meeting_topic}\n会议时间：{time}\n会议地点/方式：{location}\n参会人员：{attendees}\n会议议程：{agenda}\n\n要求：\n1. 信息完整\n2. 提前说明准备事项\n3. 礼貌专业\n4. 字数200-300字",
    difficulty: "beginner",
    estimatedWords: "200-300",
    icon: "📅",
  },
  {
    id: "email-005",
    title: "投诉处理回复",
    description: "回复客户投诉的邮件模板",
    category: "email",
    tags: ["投诉", "客服", "处理"],
    prompt:
      "请撰写一封投诉处理回复邮件：\n\n客户姓名：{customer}\n投诉内容：{complaint}\n调查结果：{investigation}\n解决方案：{solution}\n补偿措施：{compensation}\n\n要求：\n1. 先表达歉意\n2. 说明原因不过度辩解\n3. 给出明确解决方案\n4. 字数300-500字",
    difficulty: "advanced",
    estimatedWords: "300-500",
    icon: "🛡️",
  },
  {
    id: "email-006",
    title: "工作周报",
    description: "向领导汇报一周工作情况的邮件",
    category: "email",
    tags: ["周报", "汇报", "总结"],
    prompt:
      "请撰写一封工作周报邮件：\n\n汇报人：{name}\n部门：{department}\n本周完成工作：{completed}\n下周计划：{planned}\n需要协调：{needs_support}\n\n要求：\n1. 条理清晰\n2. 量化成果\n3. 问题附带建议\n4. 字数300-500字",
    difficulty: "beginner",
    estimatedWords: "300-500",
    icon: "📋",
  },
  {
    id: "email-007",
    title: "感谢信",
    description: "向客户、合作伙伴或员工表达感谢的邮件",
    category: "email",
    tags: ["感谢", "礼仪", "关系"],
    prompt:
      "请撰写一封感谢信：\n\n感谢对象：{recipient}\n感谢原因：{reason}\n具体事项：{details}\n期望关系：{relationship}\n\n要求：\n1. 真诚不浮夸\n2. 具体说明感谢内容\n3. 展望未来合作\n4. 字数200-400字",
    difficulty: "beginner",
    estimatedWords: "200-400",
    icon: "🙏",
  },
  {
    id: "email-008",
    title: "冷启动开发信",
    description: "向陌生潜在客户发送的开发信",
    category: "email",
    tags: ["开发", "冷启动", "销售"],
    prompt:
      "请撰写一封冷启动开发信：\n\n目标客户：{target}\n客户痛点：{pain_point}\n我方产品：{product}\n核心价值：{value}\n期望动作：{cta}\n\n要求：\n1. 标题引起好奇\n2. 开头快速建立关联\n3. 突出价值而非功能\n4. 字数150-250字",
    difficulty: "intermediate",
    estimatedWords: "150-250",
    icon: "🎣",
  },

  // ==================== 社交媒体 (10) ====================
  {
    id: "soc-001",
    title: "小红书种草笔记",
    description: "适合小红书平台的种草分享笔记",
    category: "social",
    tags: ["小红书", "种草", "分享"],
    prompt:
      "请写一篇小红书种草笔记：\n\n产品/体验：{product}\n使用场景：{scenario}\n核心亮点：{highlights}\n个人感受：{feelings}\n\n要求：\n1. 使用emoji增加活力\n2. 口语化表达\n3. 包含使用tips\n4. 字数300-500字\n5. 添加合适的标签",
    difficulty: "beginner",
    estimatedWords: "300-500",
    icon: "📕",
  },
  {
    id: "soc-002",
    title: "微博热点文案",
    description: "结合热点事件的微博营销文案",
    category: "social",
    tags: ["微博", "热点", "营销"],
    prompt:
      "请写一篇微博热点文案：\n\n热点事件：{hot_topic}\n品牌/产品：{brand}\n结合角度：{angle}\n期望互动：{engagement}\n\n要求：\n1. 借势自然不牵强\n2. 简短有力\n3. 引发讨论\n4. 字数100-200字\n5. 包含话题标签",
    difficulty: "intermediate",
    estimatedWords: "100-200",
    icon: "🔥",
  },
  {
    id: "soc-003",
    title: "朋友圈文案",
    description: "适合微信朋友圈分享的生活/营销文案",
    category: "social",
    tags: ["朋友圈", "微信", "分享"],
    prompt:
      "请写一条朋友圈文案：\n\n分享主题：{topic}\n场景/心情：{mood}\n配图描述：{image}\n期望效果：{effect}\n\n要求：\n1. 自然不做作\n2. 引发共鸣或互动\n3. 字数50-150字\n4. 适当使用emoji",
    difficulty: "beginner",
    estimatedWords: "50-150",
    icon: "💚",
  },
  {
    id: "soc-004",
    title: "Twitter/X推文",
    description: "适合Twitter平台的英文或中英双语推文",
    category: "social",
    tags: ["Twitter", "X", "国际"],
    prompt:
      "请写一条Twitter/X推文：\n\n主题：{topic}\n语言：{language}\n核心信息：{message}\n目标受众：{audience}\n\n要求：\n1. 280字符以内\n2. 简洁有力\n3. 包含hashtag\n4. 适合转发",
    difficulty: "beginner",
    estimatedWords: "50-100",
    icon: "🐦",
  },
  {
    id: "soc-005",
    title: "LinkedIn专业帖",
    description: "适合LinkedIn平台的职场专业内容",
    category: "social",
    tags: ["LinkedIn", "职场", "专业"],
    prompt:
      "请写一篇LinkedIn帖子：\n\n主题：{topic}\n行业背景：{industry}\n核心观点：{viewpoint}\n个人经验：{experience}\n\n要求：\n1. 专业但不枯燥\n2. 有数据或案例支撑\n3. 引发行业讨论\n4. 字数300-500字",
    difficulty: "intermediate",
    estimatedWords: "300-500",
    icon: "💼",
  },
  {
    id: "soc-006",
    title: "抖音/短视频脚本",
    description: "短视频平台的口播脚本或文案",
    category: "social",
    tags: ["抖音", "短视频", "脚本"],
    prompt:
      "请写一个短视频脚本：\n\n视频主题：{topic}\n视频类型：{type}\n目标时长：{duration}\n核心信息：{message}\n\n要求：\n1. 开头3秒吸引注意力\n2. 节奏紧凑\n3. 包含画面描述\n4. 结尾有互动引导",
    difficulty: "intermediate",
    estimatedWords: "200-400",
    icon: "🎬",
  },
  {
    id: "soc-007",
    title: "Instagram图文",
    description: "适合Instagram的图文帖文案",
    category: "social",
    tags: ["Instagram", "图文", "视觉"],
    prompt:
      "请写一条Instagram图文帖：\n\n图片主题：{image_theme}\n品牌调性：{brand_tone}\n核心信息：{message}\n语言：{language}\n\n要求：\n1. 视觉化描述\n2. 简洁有格调\n3. 包含hashtag组\n4. 字数100-200字",
    difficulty: "beginner",
    estimatedWords: "100-200",
    icon: "📸",
  },
  {
    id: "soc-008",
    title: "社群运营文案",
    description: "微信群、QQ群等社群运营文案",
    category: "social",
    tags: ["社群", "运营", "群"],
    prompt:
      "请撰写社群运营文案：\n\n社群类型：{community_type}\n运营目的：{purpose}\n文案类型：{copy_type}\n活动/内容：{content}\n\n要求：\n1. 符合社群调性\n2. 促进互动\n3. 有明确行动指引\n4. 字数200-400字",
    difficulty: "beginner",
    estimatedWords: "200-400",
    icon: "👥",
  },
  {
    id: "soc-009",
    title: "KOL合作Brief",
    description: "给KOL/达人的合作需求说明文档",
    category: "social",
    tags: ["KOL", "达人", "合作"],
    prompt:
      "请撰写一份KOL合作Brief：\n\n品牌名称：{brand}\n产品信息：{product}\n合作形式：{format}\n目标受众：{audience}\n核心卖点：{selling_points}\n创作要求：{requirements}\n\n要求：\n1. 信息完整清晰\n2. 给达人创作空间\n3. 包含注意事项\n4. 专业规范",
    difficulty: "intermediate",
    estimatedWords: "500-800",
    icon: "🌟",
  },
  {
    id: "soc-010",
    title: "直播话术脚本",
    description: "直播带货或品牌直播的话术脚本",
    category: "social",
    tags: ["直播", "话术", "带货"],
    prompt:
      "请写一份直播话术脚本：\n\n直播主题：{theme}\n产品类型：{products}\n直播时长：{duration}\n促销信息：{promotion}\n\n要求：\n1. 包含开场-暖场-产品讲解-互动-促单-收尾\n2. 话术自然口语化\n3. 设计互动环节\n4. 包含应急话术",
    difficulty: "advanced",
    estimatedWords: "800-1500",
    icon: "📺",
  },

  // ==================== 博客文章 (10) ====================
  {
    id: "blog-001",
    title: "教程型博客",
    description: "步骤清晰的how-to教程文章",
    category: "blog",
    tags: ["教程", "How-to", "指南"],
    prompt:
      "请写一篇教程型博客文章：\n\n主题：{topic}\n目标读者：{audience}\n读者水平：{level}\n核心技能：{skill}\n\n要求：\n1. 清晰的步骤结构\n2. 配合示例说明\n3. 包含常见问题解答\n4. 字数1500-2500字",
    difficulty: "intermediate",
    estimatedWords: "1500-2500",
    icon: "📖",
  },
  {
    id: "blog-002",
    title: "清单型文章",
    description: "数字列表形式的干货文章",
    category: "blog",
    tags: ["清单", "列表", "干货"],
    prompt:
      "请写一篇清单型文章：\n\n主题：{topic}\n清单数量：{number}\n目标读者：{audience}\n核心角度：{angle}\n\n要求：\n1. 标题包含数字\n2. 每条内容独立有价值\n3. 简洁有力\n4. 字数1000-2000字",
    difficulty: "beginner",
    estimatedWords: "1000-2000",
    icon: "📋",
  },
  {
    id: "blog-003",
    title: "观点评论文",
    description: "针对行业热点或趋势的观点文章",
    category: "blog",
    tags: ["观点", "评论", "热点"],
    prompt:
      "请写一篇观点评论文章：\n\n话题：{topic}\n我的立场：{stance}\n支撑论据：{arguments}\n目标读者：{audience}\n\n要求：\n1. 观点鲜明\n2. 论据充分\n3. 逻辑严密\n4. 字数1000-2000字",
    difficulty: "advanced",
    estimatedWords: "1000-2000",
    icon: "💭",
  },
  {
    id: "blog-004",
    title: "行业分析报告",
    description: "深度分析行业趋势和数据的报告型文章",
    category: "blog",
    tags: ["分析", "报告", "数据"],
    prompt:
      "请写一篇行业分析报告：\n\n行业领域：{industry}\n分析主题：{theme}\n数据来源：{data_sources}\n分析维度：{dimensions}\n\n要求：\n1. 数据支撑观点\n2. 多维度分析\n3. 给出趋势预判\n4. 字数2000-3500字",
    difficulty: "advanced",
    estimatedWords: "2000-3500",
    icon: "📈",
  },
  {
    id: "blog-005",
    title: "人物专访",
    description: "对行业人物或用户的采访稿",
    category: "blog",
    tags: ["专访", "人物", "采访"],
    prompt:
      "请撰写一篇人物专访：\n\n采访对象：{interviewee}\n对象背景：{background}\n采访主题：{theme}\n核心问题：{questions}\n\n要求：\n1. 问答形式或叙述形式\n2. 展现人物个性\n3. 有深度洞察\n4. 字数1500-2500字",
    difficulty: "advanced",
    estimatedWords: "1500-2500",
    icon: "🎤",
  },
  {
    id: "blog-006",
    title: "产品评测",
    description: "对产品或服务的详细评测文章",
    category: "blog",
    tags: ["评测", "测评", "产品"],
    prompt:
      "请写一篇产品评测文章：\n\n产品名称：{product}\n评测维度：{dimensions}\n使用时长：{usage_period}\n优缺点：{pros_cons}\n\n要求：\n1. 客观公正\n2. 有实际使用体验\n3. 包含对比\n4. 字数1200-2000字",
    difficulty: "intermediate",
    estimatedWords: "1200-2000",
    icon: "🔍",
  },
  {
    id: "blog-007",
    title: "经验分享文",
    description: "分享个人经验和心得的文章",
    category: "blog",
    tags: ["经验", "分享", "心得"],
    prompt:
      "请写一篇经验分享文章：\n\n经验主题：{topic}\n个人背景：{background}\n核心经验：{experience}\n读者收获：{takeaway}\n\n要求：\n1. 真实可信\n2. 有具体案例\n3. 可操作的建议\n4. 字数1000-1800字",
    difficulty: "beginner",
    estimatedWords: "1000-1800",
    icon: "💎",
  },
  {
    id: "blog-008",
    title: "SEO优化文章",
    description: "针对搜索引擎优化的高质量内容",
    category: "blog",
    tags: ["SEO", "优化", "关键词"],
    prompt:
      "请写一篇SEO优化文章：\n\n目标关键词：{keyword}\n相关关键词：{related_keywords}\n搜索意图：{intent}\n目标读者：{audience}\n\n要求：\n1. 标题包含关键词\n2. 自然分布关键词\n3. 结构清晰含H2/H3\n4. 字数1500-2500字",
    difficulty: "intermediate",
    estimatedWords: "1500-2500",
    icon: "🔎",
  },
  {
    id: "blog-009",
    title: "故事型文章",
    description: "以叙事方式传达信息的文章",
    category: "blog",
    tags: ["故事", "叙事", "情感"],
    prompt:
      "请写一篇故事型文章：\n\n故事主题：{theme}\n核心信息：{message}\n人物/角色：{characters}\n情感基调：{tone}\n\n要求：\n1. 有代入感\n2. 情节有起伏\n3. 自然传达信息\n4. 字数1200-2000字",
    difficulty: "advanced",
    estimatedWords: "1200-2000",
    icon: "📚",
  },
  {
    id: "blog-010",
    title: "年度/季度总结",
    description: "回顾总结一段时间的成果和反思",
    category: "blog",
    tags: ["总结", "回顾", "反思"],
    prompt:
      "请写一篇年度/季度总结文章：\n\n总结周期：{period}\n主要成果：{achievements}\n遇到的挑战：{challenges}\n经验教训：{lessons}\n未来计划：{plans}\n\n要求：\n1. 数据支撑成果\n2. 坦诚面对不足\n3. 有前瞻性\n4. 字数1500-2500字",
    difficulty: "intermediate",
    estimatedWords: "1500-2500",
    icon: "📊",
  },

  // ==================== 创意写作 (6) ====================
  {
    id: "cre-001",
    title: "微小说",
    description: "短小精悍的微型小说创作",
    category: "creative",
    tags: ["小说", "微小说", "故事"],
    prompt:
      "请创作一篇微小说：\n\n主题/灵感：{theme}\n风格类型：{genre}\n字数要求：{word_count}\n特殊要求：{requirements}\n\n要求：\n1. 有完整的叙事弧线\n2. 结尾出人意料\n3. 语言精炼\n4. 字数500-1500字",
    difficulty: "advanced",
    estimatedWords: "500-1500",
    icon: "📖",
  },
  {
    id: "cre-002",
    title: "诗歌创作",
    description: "现代诗或古体诗创作",
    category: "creative",
    tags: ["诗歌", "现代诗", "文学"],
    prompt:
      "请创作一首诗歌：\n\n主题：{theme}\n风格：{style}\n情感基调：{mood}\n意象要求：{imagery}\n\n要求：\n1. 意象鲜明\n2. 节奏感强\n3. 情感真挚\n4. 形式自由",
    difficulty: "advanced",
    estimatedWords: "100-500",
    icon: "🌸",
  },
  {
    id: "cre-003",
    title: "广告创意脚本",
    description: "视频广告或广播广告的创意脚本",
    category: "creative",
    tags: ["广告", "创意", "脚本"],
    prompt:
      "请创作一个广告创意脚本：\n\n产品/品牌：{product}\n广告时长：{duration}\n目标受众：{audience}\n核心信息：{message}\n创意方向：{direction}\n\n要求：\n1. 创意新颖\n2. 画面感强\n3. 信息传达清晰\n4. 包含画面和旁白描述",
    difficulty: "advanced",
    estimatedWords: "300-600",
    icon: "🎬",
  },
  {
    id: "cre-004",
    title: "产品命名方案",
    description: "为产品或品牌提供命名创意",
    category: "creative",
    tags: ["命名", "品牌", "创意"],
    prompt:
      "请为以下产品/品牌提供命名方案：\n\n产品类型：{product_type}\n目标受众：{audience}\n品牌调性：{tone}\n核心特点：{features}\n\n要求：\n1. 提供10个命名方案\n2. 每个方案附带释义\n3. 考虑商标注册可行性\n4. 中英文方案各半",
    difficulty: "intermediate",
    estimatedWords: "500-800",
    icon: "✨",
  },
  {
    id: "cre-005",
    title: "歌词创作",
    description: "歌曲歌词创作",
    category: "creative",
    tags: ["歌词", "音乐", "创作"],
    prompt:
      "请创作一首歌词：\n\n主题：{theme}\n曲风：{genre}\n情感：{emotion}\n结构要求：{structure}\n\n要求：\n1. 包含主歌和副歌\n2. 押韵自然\n3. 有画面感\n4. 适合演唱",
    difficulty: "advanced",
    estimatedWords: "200-500",
    icon: "🎵",
  },
  {
    id: "cre-006",
    title: "创意故事接龙",
    description: "基于给定开头进行创意故事续写",
    category: "creative",
    tags: ["故事", "续写", "接龙"],
    prompt:
      "请基于以下开头续写故事：\n\n故事开头：{opening}\n故事类型：{genre}\n期望走向：{direction}\n字数要求：{word_count}\n\n要求：\n1. 承接开头风格\n2. 情节有发展\n3. 人物有成长\n4. 结尾有余韵",
    difficulty: "intermediate",
    estimatedWords: "800-1500",
    icon: "🔗",
  },

  // ==================== 学术写作 (6) ====================
  {
    id: "aca-001",
    title: "论文摘要",
    description: "学术论文摘要撰写",
    category: "academic",
    tags: ["论文", "摘要", "学术"],
    prompt:
      "请撰写一篇论文摘要：\n\n论文主题：{topic}\n研究方法：{method}\n主要发现：{findings}\n研究意义：{significance}\n\n要求：\n1. 结构完整（目的-方法-结果-结论）\n2. 语言精炼\n3. 关键词3-5个\n4. 字数200-400字",
    difficulty: "advanced",
    estimatedWords: "200-400",
    icon: "📄",
  },
  {
    id: "aca-002",
    title: "文献综述",
    description: "学术研究文献综述",
    category: "academic",
    tags: ["文献", "综述", "研究"],
    prompt:
      "请撰写一篇文献综述：\n\n研究主题：{topic}\n综述范围：{scope}\n核心文献：{key_papers}\n综述角度：{angle}\n\n要求：\n1. 按主题或时间组织\n2. 批判性分析\n3. 指出研究空白\n4. 字数2000-3000字",
    difficulty: "advanced",
    estimatedWords: "2000-3000",
    icon: "📚",
  },
  {
    id: "aca-003",
    title: "研究报告",
    description: "实验或调研报告撰写",
    category: "academic",
    tags: ["报告", "研究", "实验"],
    prompt:
      "请撰写一篇研究报告：\n\n研究主题：{topic}\n研究背景：{background}\n研究方法：{method}\n数据/结果：{results}\n\n要求：\n1. 标准学术格式\n2. 数据呈现清晰\n3. 讨论深入\n4. 字数3000-5000字",
    difficulty: "advanced",
    estimatedWords: "3000-5000",
    icon: "🔬",
  },
  {
    id: "aca-004",
    title: "课题申请书",
    description: "科研项目或课题申请文书",
    category: "academic",
    tags: ["课题", "申请", "科研"],
    prompt:
      "请撰写课题申请书核心内容：\n\n课题名称：{title}\n研究领域：{field}\n研究内容：{content}\n创新点：{innovation}\n预期成果：{outcomes}\n\n要求：\n1. 学术价值明确\n2. 可行性论证充分\n3. 预算合理\n4. 格式规范",
    difficulty: "advanced",
    estimatedWords: "2000-4000",
    icon: "📝",
  },
  {
    id: "aca-005",
    title: "学术演讲稿",
    description: "学术会议演讲或答辩稿",
    category: "academic",
    tags: ["演讲", "答辩", "学术"],
    prompt:
      "请撰写学术演讲稿：\n\n演讲主题：{topic}\n演讲场合：{occasion}\n时长：{duration}\n核心观点：{key_points}\n\n要求：\n1. 逻辑清晰\n2. 重点突出\n3. 时间控制合理\n4. 包含过渡语",
    difficulty: "intermediate",
    estimatedWords: "1500-3000",
    icon: "🎓",
  },
  {
    id: "aca-006",
    title: "学术书评",
    description: "对学术著作的评论文章",
    category: "academic",
    tags: ["书评", "评论", "学术"],
    prompt:
      "请撰写一篇学术书评：\n\n书名：{book_title}\n作者：{author}\n出版信息：{publication}\n书评角度：{angle}\n\n要求：\n1. 概述书籍内容\n2. 评价学术贡献\n3. 指出局限性\n4. 字数1500-2500字",
    difficulty: "advanced",
    estimatedWords: "1500-2500",
    icon: "📖",
  },
];

export function getTemplatesByCategory(category: TemplateCategory): WritingTemplate[] {
  return WRITING_TEMPLATES.filter((t) => t.category === category);
}

export function searchTemplates(query: string): WritingTemplate[] {
  const lower = query.toLowerCase();
  return WRITING_TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(lower) ||
      t.description.toLowerCase().includes(lower) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lower))
  );
}

export function getTemplateById(id: string): WritingTemplate | undefined {
  return WRITING_TEMPLATES.find((t) => t.id === id);
}
