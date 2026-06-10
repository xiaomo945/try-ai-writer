import { NextRequest } from "next/server";
import { generateClaudeStream } from "@/lib/ai-providers/claude";
import { generateDeepSeekStream } from "@/lib/ai-providers/deepseek";

type ModePrompt = {
  blog: string;
  email: string;
  social: string;
  custom: string;
};

const modePrompts: ModePrompt = {
  blog: `You are an expert blog writer. Write a comprehensive, engaging blog post using markdown formatting. Requirements:
- Start with a compelling H2 title
- Include at least 3 H3 subheadings
- Use bullet points or numbered lists where appropriate
- End with a strong conclusion paragraph
- Keep paragraphs concise (3-4 sentences max)

Topic: `,
  email: `You are a professional email copywriter. Write a polished, persuasive email. Requirements:
- Include a clear Subject line at the top
- Professional greeting
- Concise body with a clear call-to-action
- Professional sign-off
- Keep it under 200 words

Brief: `,
  social: `You are a social media content creator. Write an engaging social media post. Requirements:
- Hook the reader in the first line
- Keep it under 280 characters for the main text
- Include 3-5 relevant hashtags at the end
- Use an energetic, conversational tone
- Add emojis where appropriate

Topic: `,
  custom: "",
};

function buildMockStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      const chunkSize = 50;
      for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.substring(i, i + chunkSize);
        controller.enqueue(encoder.encode(chunk));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      controller.close();
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prompt: string | undefined = body.prompt;
    const mode: string | undefined = body.mode;
    const enhancedPrompt: string | undefined = body.enhancedPrompt;
    const relevantMemories: string[] | undefined = body.relevantMemories;

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    let systemPrompt: string;
    if (enhancedPrompt) {
      systemPrompt = enhancedPrompt;
    } else {
      const basePrompt = modePrompts[mode as keyof ModePrompt] || modePrompts.custom;
      systemPrompt = mode === "custom" ? prompt : `${basePrompt}${prompt}`;
    }

    if (relevantMemories && relevantMemories.length > 0) {
      const memoriesText = relevantMemories.join("\n\n");
      systemPrompt = `以下是你过去的相关想法，请在创作时保持观点的连贯性：\n\n${memoriesText}\n\n---\n\n${systemPrompt}`;
    }

    const aiProvider = (process.env.AI_PROVIDER || "").toLowerCase();
    const hasClaudeKey =
      !!process.env.CLAUDE_API_KEY &&
      process.env.CLAUDE_API_KEY.length > 10 &&
      !["your-api-key-here", "sk-ant-xxxxx"].includes(process.env.CLAUDE_API_KEY);
    const hasDeepSeekKey =
      !!process.env.DEEPSEEK_API_KEY &&
      process.env.DEEPSEEK_API_KEY.length > 10 &&
      !["your-api-key-here"].includes(process.env.DEEPSEEK_API_KEY);

    console.log(`[Generate] AI_PROVIDER env: "${process.env.AI_PROVIDER}" -> parsed: "${aiProvider}"`);
    console.log(`[Generate] Has Claude Key: ${hasClaudeKey} (raw: ${!!process.env.CLAUDE_API_KEY})`);
    console.log(`[Generate] Has DeepSeek Key: ${hasDeepSeekKey} (raw: ${!!process.env.DEEPSEEK_API_KEY})`);

    // 当 AI_PROVIDER 明确设置时，只用该 provider，不自动降级
    // 只有 AI_PROVIDER 未设置、或设置为 mock/auto 时，才使用自动检测 + 降级链
    let fullChain: string[] = [];
    const isExplicitProvider = aiProvider && aiProvider !== "mock" && aiProvider !== "auto" && aiProvider !== "";

    if (isExplicitProvider) {
      // 显式指定的 provider：只尝试它，失败则报错（不降级）
      fullChain = [aiProvider];
    } else {
      // 未指定或 mock：按 DeepSeek -> Claude -> Mock 的优先级自动选择
      if (hasDeepSeekKey) fullChain.push("deepseek");
      if (hasClaudeKey) fullChain.push("claude");
      fullChain.push("mock");
    }

    console.log(`[Generate] Provider chain: ${fullChain.join(" -> ")}`);

    const generationOptions = {
      prompt,
      systemPrompt,
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      claudeModel: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
      maxTokens: 4096,
      temperature: 0.7,
    };

    let lastError: Error | null = null;

    for (const provider of fullChain) {
      try {
        console.log(`[Generate] Trying provider: ${provider}`);
        if (provider === "deepseek") {
          const stream = await generateDeepSeekStream(generationOptions);
          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        }
        if (provider === "claude") {
          const stream = await generateClaudeStream({
            ...generationOptions,
            model: generationOptions.claudeModel,
          });
          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[Generate] Provider ${provider} failed: ${msg}`);
        lastError = err instanceof Error ? err : new Error(msg);
      }
    }

    // 显式指定的 provider 全部失败 → 返回错误，不走 Mock
    if (isExplicitProvider && lastError) {
      const errMsg = lastError.message || "AI provider unavailable";
      console.error(`[Generate] Explicit provider "${aiProvider}" failed, returning error: ${errMsg}`);
      return Response.json(
        { error: errMsg, suggestion: "AI服务暂时不可用，请稍后再试。如问题持续，请检查API配置。" },
        { status: 500 }
      );
    }

    console.log("[Generate] All providers failed. Falling back to mock mode.");
    const mockResponses: ModePrompt = {
      blog: `## Getting Started with AI Writing in 2025\n\nThe landscape of content creation has shifted dramatically. With AI-powered tools, writers can now produce high-quality drafts in minutes rather than hours.\n\n### Why AI Writing Matters\n\nAI writing tools are no longer just glorified autocomplete. They understand context, maintain tone, and adapt to your unique voice. Here is what makes them indispensable:\n\n- **Speed**: Generate full drafts in under 30 seconds\n- **Quality**: Professionally structured content with proper formatting\n- **Consistency**: Maintain your brand voice across all pieces\n\n### Best Practices for AI-Assisted Writing\n\n1. Start with a clear, specific prompt\n2. Review and edit the AI output for accuracy\n3. Add your personal touch and unique insights\n4. Fact-check any claims or statistics\n\n### The Future is Collaborative\n\nThe most successful creators use AI as a collaborator, not a replacement. Your expertise combined with AI efficiency creates content that neither could produce alone.\n\n### Conclusion\n\nAI writing is here to stay. The question is not whether to use it, but how to use it well. Start experimenting today and find the workflow that works for you.`,
      email: `Subject: Quick question about your Q2 content strategy\n\nHi there,\n\nI hope this email finds you well. I wanted to follow up on our conversation about scaling your content output this quarter.\n\nHere is what I would recommend:\n\n1. **Leverage AI for first drafts** - Cut writing time by 60%\n2. **Create a content calendar** - Plan 2 weeks ahead minimum\n3. **Batch similar tasks** - Write all blog posts on Monday, edit on Tuesday\n\nWould you be open to a quick 15-minute call this week to discuss? I have some ideas that could really move the needle for your team.\n\nLooking forward to hearing from you.\n\nBest regards`,
      social: `🚀 Stop writing from scratch.\n\nAI-powered writing tools can generate blog posts, emails, and social content in seconds.\n\nThe best part? They learn your style and get better every time.\n\nTry it free today. Your future self will thank you. ✨\n\n#AIWriting #ContentCreation #ProductivityHacks #WriterLife #AItools`,
      custom: `Here is your custom generated content based on: "${prompt.slice(0, 100)}"\n\nThank you for using Try AI Writer. In a full setup with API credentials, this section would contain AI-generated content tailored to your specific prompt.\n\nTo unlock full functionality, please configure your Claude or DeepSeek API key in the environment variables.`,
    };

    const mockText = mockResponses[mode as keyof ModePrompt] || mockResponses.custom;
    const stream = buildMockStream(mockText);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[Generate] Fatal error:", error);
    return Response.json({ error: message, suggestion: "AI服务暂时不可用，请稍后再试" }, { status: 500 });
  }
}
