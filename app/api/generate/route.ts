import { NextRequest } from "next/server";
import { generateDeepSeekStream } from "@/lib/ai-providers/deepseek";
import { generateClaudeStream } from "@/lib/ai-providers/claude";
import { checkCostLimit, trackCost } from "@/lib/cost-control";

type ModePrompt = {
  blog: { en: string; zh: string };
  email: { en: string; zh: string };
  social: { en: string; zh: string };
  custom: { en: string; zh: string };
  creative: { en: string; zh: string };
};

function detectLanguage(text: string): "en" | "zh" {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g);
  // Detect even a single Chinese character
  if (chineseChars && chineseChars.length > 0) {
    return "zh";
  }
  return "en";
}

function isCreativeWriting(prompt: string): boolean {
  const creativeKeywords = [
    "小说", "故事", "创作", "穿越", "重生", "言情", "武侠", "科幻", "玄幻",
    "novel", "story", "fiction", "creative writing", "fanfiction", "fantasy"
  ];
  const lowerPrompt = prompt.toLowerCase();
  return creativeKeywords.some(keyword => lowerPrompt.includes(keyword));
}

const modePrompts: ModePrompt = {
  blog: {
    en: `You are an expert blog writer. Write a comprehensive, engaging blog post using markdown formatting. Requirements:
- Start with a compelling H2 title
- Include at least 3 H3 subheadings
- Use bullet points or numbered lists where appropriate
- End with a strong conclusion paragraph
- Keep paragraphs concise (3-4 sentences max)

Topic: `,
    zh: `你是一位专业的博客作者。请使用 Markdown 格式撰写一篇全面且吸引人的博客文章。要求：
- 以引人入胜的 H2 标题开头
- 至少包含 3 个 H3 子标题
- 在合适的地方使用项目符号或编号列表
- 以强有力的结论段落结尾
- 保持段落简洁（最多 3-4 句）

主题：`
  },
  email: {
    en: `You are a professional email copywriter. Write a polished, persuasive email. Requirements:
- Include a clear Subject line at the top
- Professional greeting
- Concise body with a clear call-to-action
- Professional sign-off
- Keep it under 200 words

Brief: `,
    zh: `你是一位专业的邮件文案撰稿人。请撰写一封精炼且有说服力的邮件。要求：
- 顶部包含清晰的主题行
- 专业的问候语
- 简洁的正文，带有明确的行动号召
- 专业的落款
- 保持在 200 字以内

要点：`
  },
  social: {
    en: `You are a social media content creator. Write an engaging social media post. Requirements:
- Hook the reader in the first line
- Keep it under 280 characters for the main text
- Include 3-5 relevant hashtags at the end
- Use an energetic, conversational tone
- Add emojis where appropriate

Topic: `,
    zh: `你是一位社交媒体内容创作者。请撰写一篇引人入胜的社交媒体帖子。要求：
- 第一行就抓住读者注意力
- 正文保持在 280 字以内
- 末尾包含 3-5 个相关的标签
- 使用充满活力的对话式语气
- 在合适的地方添加表情符号

主题：`
  },
  custom: {
    en: "",
    zh: ""
  },
  creative: {
    en: `You are a master creative writer. Please create literary content based on the user's prompt. Keep your writing fluent, plot vivid, and characters distinct. Strictly follow the user's style requirements and story settings. `,
    zh: `你是一位创意写作大师。请根据用户的提示进行文学创作。保持文笔流畅、情节生动、人物鲜明。严格遵循用户的风格要求和故事设定。`
  },
};

const mockResponses: { [key: string]: { en: string; zh: string } } = {
  blog: {
    en: `## Getting Started with AI Writing in 2025

The landscape of content creation has shifted dramatically. With AI-powered tools, writers can now produce high-quality drafts in minutes rather than hours.

### Why AI Writing Matters

AI writing tools are no longer just glorified autocomplete. They understand context, maintain tone, and adapt to your unique voice. Here is what makes them indispensable:

- **Speed**: Generate full drafts in under 30 seconds
- **Quality**: Professionally structured content with proper formatting
- **Consistency**: Maintain your brand voice across all pieces

### Best Practices for AI-Assisted Writing

1. Start with a clear, specific prompt
2. Review and edit the AI output for accuracy
3. Add your personal touch and unique insights
4. Fact-check any claims or statistics

### The Future is Collaborative

The most successful creators use AI as a collaborator, not a replacement. Your expertise combined with AI efficiency creates content that neither could produce alone.

### Conclusion

AI writing is here to stay. The question is not whether to use it, but how to use it well. Start experimenting today and find the workflow that works for you.`,
    zh: `## 2025 年 AI 写作入门指南

内容创作领域已发生翻天覆地的变化。借助 AI 工具，创作者现在只需几分钟而非几小时就能产出高质量的初稿。

### 为什么 AI 写作很重要

AI 写作工具不再只是高级的自动补全。它们理解上下文、保持语气，并适应你独特的风格。以下是让它们变得不可或缺的原因：

- **速度**：30 秒内生成完整初稿
- **质量**：专业结构化的内容，格式规范
- **一致性**：在所有作品中保持你的品牌声音

### AI 辅助写作最佳实践

1. 从清晰、具体的提示开始
2. 检查并编辑 AI 输出以确保准确性
3. 添加你的个人风格和独特见解
4. 核实任何主张或统计数据

### 未来是协作的

最成功的创作者将 AI 视为协作者而非替代品。你的专业知识与 AI 的效率相结合，创造出任何一方都无法单独完成的内容。

### 结论

AI 写作已成为常态。问题不在于是否使用它，而在于如何用好它。今天就开始尝试，找到适合你的工作流程。`
  },
  email: {
    en: `Subject: Quick question about your Q2 content strategy

Hi there,

I hope this email finds you well. I wanted to follow up on our conversation about scaling your content output this quarter.

Here is what I would recommend:

1. **Leverage AI for first drafts** - Cut writing time by 60%
2. **Create a content calendar** - Plan 2 weeks ahead minimum
3. **Batch similar tasks** - Write all blog posts on Monday, edit on Tuesday

Would you be open to a quick 15-minute call this week to discuss? I have some ideas that could really move the needle for your team.

Looking forward to hearing from you.

Best regards`,
    zh: `主题：关于你的 Q2 内容策略的快速询问

你好，

希望你一切顺利。我想就我们之前关于本季度扩大内容产出的谈话跟进一下。

以下是我的建议：

1. **利用 AI 完成初稿** - 减少 60% 的写作时间
2. **创建内容日历** - 至少提前 2 周规划
3. **批量处理类似任务** - 周一撰写所有博客，周二编辑

本周可以安排一个 15 分钟的快速电话讨论吗？我有一些想法可能会对你的团队有所帮助。

期待你的回复。

祝好`
  },
  social: {
    en: `🚀 Stop writing from scratch.

AI-powered writing tools can generate blog posts, emails, and social content in seconds.

The best part? They learn your style and get better every time.

Try it free today. Your future self will thank you. ✨

#AIWriting #ContentCreation #ProductivityHacks #WriterLife #AItools`,
    zh: `🚀 不要从零开始写作。

AI 写作工具可以在几秒钟内生成博客文章、邮件和社交媒体内容。

最棒的是？它们会学习你的风格，每次都变得更好。

今天就免费试用吧。未来的你会感谢你的。✨

#AI写作 #内容创作 #效率技巧 #作家生活 #AI工具`
  },
  custom: {
    en: `Here is your custom generated content:\n\nThank you for using Use AI Writer. In a full setup with API credentials, this section would contain AI-generated content tailored to your specific prompt.\n\nTo unlock full functionality, please configure your API key in the environment variables.`,
    zh: `这是你的自定义生成内容：\n\n感谢使用 Use AI Writer。在完整配置 API 凭证后，此部分将包含根据你具体提示生成的 AI 内容。\n\n要解锁完整功能，请在环境变量中配置你的 API 密钥。`
  },
  creative: {
    en: `Once upon a time in a land far away, there was a writer who discovered the magic of AI-assisted storytelling...`,
    zh: `从前，在一个遥远的地方，有一位作家发现了 AI 辅助故事创作的魔力...`
  },
};

type AIProvider = "deepseek" | "claude" | "mock";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: string | undefined = body.prompt;
    const mode: keyof typeof modePrompts = (body.mode || "custom") as keyof typeof modePrompts;
    const brandContext: string | undefined = body.brandContext;
    const viewpoints: string[] = body.viewpoints || [];

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const lang = detectLanguage(prompt);
    const isCreative = isCreativeWriting(prompt);
    let systemPrompt: string;

    if (isCreative) {
      const creativePrompts = modePrompts.creative;
      const creativePrompt = creativePrompts[lang];
      systemPrompt = `${creativePrompt}${prompt}`;
    } else if (mode === "custom") {
      systemPrompt = prompt;
    } else {
      const basePrompts = modePrompts[mode];
      const basePrompt = basePrompts[lang];
      systemPrompt = `${basePrompt}${prompt}`;
    }

    if (brandContext) {
      systemPrompt = `${brandContext}\n\n${systemPrompt}`;
    }

    if (viewpoints.length > 0) {
      const viewpointPrompt = lang === "zh" 
        ? `\n\n在你过去的作品中，你表达了以下观点：${viewpoints.map(v => `\n- ${v}`).join("")}\n\n请在当前创作中保持这些观点的一致性，除非当前提示有相反的要求。` 
        : `\n\nIn your past writings, you have expressed the following viewpoints:${viewpoints.map(v => `\n- ${v}`).join("")}\n\nPlease ensure consistency with these viewpoints unless the current prompt suggests otherwise.`;
      systemPrompt += viewpointPrompt;
    }

    const aiProvider = (process.env.AI_PROVIDER || "mock") as AIProvider;
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    
    let isMockMode = aiProvider === "mock";
    if (aiProvider === "deepseek" && (!deepseekApiKey || deepseekApiKey.startsWith("your-"))) {
      isMockMode = true;
    }
    if (aiProvider === "claude" && (!claudeApiKey || claudeApiKey.startsWith("your-"))) {
      isMockMode = true;
    }

    if (isMockMode) {
      const mockTexts = (mockResponses[mode] || mockResponses.custom)!;
      const mockText = mockTexts[lang];
      return new Response(mockText, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // Cost check (using dummy userId for now)
    const userId = "anonymous";
    if (!checkCostLimit(userId)) {
      return Response.json({ error: "今日服务繁忙，请稍后再试" }, { status: 429 });
    }

    let stream: ReadableStream<Uint8Array>;
    let model: AIProvider;

    if (aiProvider === "deepseek" && deepseekApiKey) {
      stream = await generateDeepSeekStream(deepseekApiKey, [
        { role: "user", content: systemPrompt },
      ]);
      model = "deepseek";
    } else if (aiProvider === "claude" && claudeApiKey) {
      stream = await generateClaudeStream(claudeApiKey, [
        { role: "user", content: systemPrompt },
      ]);
      model = "claude";
    } else {
      const mockTexts = (mockResponses[mode] || mockResponses.custom)!;
      const mockText = mockTexts[lang];
      return new Response(mockText, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    // Track cost after successful stream start
    // Estimate tokens as 2000 (rough estimate for max_tokens 4096)
    trackCost(userId, model, 2000);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
