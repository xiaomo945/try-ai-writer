import { NextRequest } from "next/server";
import { generateClaudeStream } from "@/lib/ai-providers/claude";
import { generateDeepSeekStream } from "@/lib/ai-providers/deepseek";
import { rateLimit, getRateLimitKey, DEFAULT_RATE_LIMIT } from "@/lib/rate-limiter";

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

type GenerationOptions = {
  prompt: string;
  systemPrompt: string;
  model?: string;
  claudeModel?: string;
  maxTokens: number;
  temperature: number;
};

type ProviderAttemptResult = {
  success: boolean;
  stream?: ReadableStream<Uint8Array>;
  error?: { message: string; hint: string };
};

const MOCK_RESPONSES: ModePrompt = {
  blog: `## Getting Started with AI Writing in 2025\n\nThe landscape of content creation has shifted dramatically. With AI-powered tools, writers can now produce high-quality drafts in minutes rather than hours.\n\n### Why AI Writing Matters\n\nAI writing tools are no longer just glorified autocomplete. They understand context, maintain tone, and adapt to your unique voice. Here is what makes them indispensable:\n\n- **Speed**: Generate full drafts in under 30 seconds\n- **Quality**: Professionally structured content with proper formatting\n- **Consistency**: Maintain your brand voice across all pieces\n\n### Best Practices for AI-Assisted Writing\n\n1. Start with a clear, specific prompt\n2. Review and edit the AI output for accuracy\n3. Add your personal touch and unique insights\n4. Fact-check any claims or statistics\n\n### The Future is Collaborative\n\nThe most successful creators use AI as a collaborator, not a replacement. Your expertise combined with AI efficiency creates content that neither could produce alone.\n\n### Conclusion\n\nAI writing is here to stay. The question is not whether to use it, but how to use it well. Start experimenting today and find the workflow that works for you.`,
  email: `Subject: Quick question about your Q2 content strategy\n\nHi there,\n\nI hope this email finds you well. I wanted to follow up on our conversation about scaling your content output this quarter.\n\nHere is what I would recommend:\n\n1. **Leverage AI for first drafts** - Cut writing time by 60%\n2. **Create a content calendar** - Plan 2 weeks ahead minimum\n3. **Batch similar tasks** - Write all blog posts on Monday, edit on Tuesday\n\nWould you be open to a quick 15-minute call this week to discuss? I have some ideas that could really move the needle for your team.\n\nLooking forward to hearing from you.\n\nBest regards`,
  social: `🚀 Stop writing from scratch.\n\nAI-powered writing tools can generate blog posts, emails, and social content in seconds.\n\nThe best part? They learn your style and get better every time.\n\nTry it free today. Your future self will thank you. ✨\n\n#AIWriting #ContentCreation #ProductivityHacks #WriterLife #AItools`,
  custom: `Here is your custom generated content based on your prompt.\n\nThank you for using Try AI Writer. In a full setup with API credentials, this section would contain AI-generated content tailored to your specific prompt.\n\nTo unlock full functionality, please configure your Claude or DeepSeek API key in the environment variables.`,
};

function analyzeDeepSeekError(err: unknown): { message: string; hint: string } {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes("invalid or expired") || lower.includes("401") || lower.includes("api key")) {
    return {
      message: "DeepSeek API Key 无效或已过期，请检查你的 DEEPSEEK_API_KEY 配置。",
      hint: "请在 Vercel 项目设置中更新 DEEPSEEK_API_KEY，或前往 DeepSeek 控制台生成新的 API Key。",
    };
  }
  if (lower.includes("rate limit") || lower.includes("429") || lower.includes("quota") || lower.includes("balance")) {
    return {
      message: "DeepSeek API 已超出调用频率或账户余额不足。",
      hint: "请检查你的 DeepSeek 账户余额与 API 调用配额，或稍后再试。",
    };
  }
  if (lower.includes("forbidden") || lower.includes("403")) {
    return {
      message: "DeepSeek API 访问被拒绝，你的账户可能被限制。",
      hint: "请登录 DeepSeek 控制台检查账户状态。",
    };
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("enotfound")) {
    return {
      message: "无法连接到 DeepSeek API，网络异常。",
      hint: "请检查服务器网络连接，或稍后再试。",
    };
  }
  if (lower.includes("timeout") || lower.includes("aborted")) {
    return {
      message: "DeepSeek API 请求超时（30秒），服务可能较慢或不可用。",
      hint: "请稍后再试，或切换到其他 AI Provider。",
    };
  }
  return {
    message: `DeepSeek 生成失败：${msg}`,
    hint: "请检查 API Key 与账户状态，或稍后再试。",
  };
}

function analyzeClaudeError(err: unknown): { message: string; hint: string } {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes("invalid or expired") || lower.includes("401") || lower.includes("403")) {
    return {
      message: "Claude API Key 无效或已过期，请检查你的 CLAUDE_API_KEY 配置。",
      hint: "请在 Vercel 项目设置中更新 CLAUDE_API_KEY，或前往 Anthropic 控制台生成新的 API Key。",
    };
  }
  if (lower.includes("rate limit") || lower.includes("429")) {
    return {
      message: "Claude API 已超出调用频率限制。",
      hint: "请稍后再试，或升级你的 Anthropic API 套餐。",
    };
  }
  if (lower.includes("network") || lower.includes("fetch") || lower.includes("enotfound")) {
    return {
      message: "无法连接到 Claude API，网络异常。",
      hint: "请检查服务器网络连接，或稍后再试。",
    };
  }
  if (lower.includes("timeout") || lower.includes("aborted")) {
    return {
      message: "Claude API 请求超时（30秒），服务可能较慢或不可用。",
      hint: "请稍后再试，或切换到其他 AI Provider。",
    };
  }
  return {
    message: `Claude 生成失败：${msg}`,
    hint: "请检查 API Key 与账户状态，或稍后再试。",
  };
}

async function attemptWithTimeoutAndRetry(
  providerName: string,
  fn: () => Promise<ReadableStream<Uint8Array>>
): Promise<ProviderAttemptResult> {
  const attempts = 2;
  const timeoutMs = 30000;
  const delayBetweenAttemptsMs = 800;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    console.log(`[Generate] ${providerName} 尝试 ${attempt}/${attempts} (timeout: ${timeoutMs}ms)`);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const stream = await Promise.race([
        fn(),
        new Promise<ReadableStream<Uint8Array>>((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(new Error(`${providerName} 请求超时（${timeoutMs}ms）`));
          });
        }),
      ]);

      clearTimeout(timeoutId);
      console.log(`[Generate] ${providerName} 尝试 ${attempt}/${attempts} 成功`);
      return { success: true, stream };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Generate] ${providerName} 尝试 ${attempt}/${attempts} 失败: ${msg}`);
      lastError = err;
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayBetweenAttemptsMs));
      }
    }
  }

  return { success: false, error: { message: lastError instanceof Error ? lastError.message : String(lastError), hint: "" } };
}

function streamResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

function errorResponse(message: string, hint: string, status: number = 500): Response {
  return Response.json({ error: message, hint, statusCode: status }, { status });
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const limitResult = rateLimit(rateLimitKey, DEFAULT_RATE_LIMIT);
    if (!limitResult.allowed) {
      return Response.json(
        {
          error: "请求过于频繁，请稍后再试。",
          hint: `每分钟最多 ${DEFAULT_RATE_LIMIT.maxRequests} 次请求，${Math.ceil((limitResult.resetAt - Date.now()) / 1000)} 秒后重置。`,
          retryAfter: Math.ceil((limitResult.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limitResult.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(limitResult.resetAt),
          },
        }
      );
    }

    const body = await request.json();
    const prompt: string | undefined = body.prompt;
    const mode: string | undefined = body.mode;
    const enhancedPrompt: string | undefined = body.enhancedPrompt;
    const relevantMemories: string[] | undefined = body.relevantMemories;

    if (!prompt || typeof prompt !== "string") {
      return errorResponse("Prompt 参数缺失或类型不正确", "请提供有效的 prompt 字符串", 400);
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

    console.log(`[Generate] 配置读取 — AI_PROVIDER: ${process.env.AI_PROVIDER}`);
    console.log(`[Generate] 配置读取 — DEEPSEEK_API_KEY 已配置: ${!!process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.length > 10}`);
    console.log(`[Generate] 配置读取 — CLAUDE_API_KEY 已配置: ${!!process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY.length > 10}`);

    const aiProvider = (process.env.AI_PROVIDER || "").toLowerCase();

    const generationOptions: GenerationOptions = {
      prompt,
      systemPrompt,
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      claudeModel: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
      maxTokens: 4096,
      temperature: 0.7,
    };

    const isExplicitMock = aiProvider === "mock";
    const isExplicitDeepSeek = aiProvider === "deepseek";
    const isExplicitClaude = aiProvider === "claude";
    const isAutoMode = !isExplicitMock && !isExplicitDeepSeek && !isExplicitClaude;

    if (isExplicitMock) {
      console.log("[Generate] Provider 策略: mock (显式)");
      const mockText = MOCK_RESPONSES[mode as keyof ModePrompt] || MOCK_RESPONSES.custom;
      return streamResponse(buildMockStream(mockText));
    }

    if (isExplicitDeepSeek) {
      console.log("[Generate] Provider 策略: deepseek (显式，不降级)");
      const hasKey = !!process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.length > 10;
      if (!hasKey) {
        return errorResponse(
          "配置错误: DeepSeek API Key 未设置。请在环境变量中配置 DEEPSEEK_API_KEY。",
          "请在 Vercel 项目设置中添加 DEEPSEEK_API_KEY 环境变量",
          500
        );
      }

      const result = await attemptWithTimeoutAndRetry("DeepSeek", () =>
        generateDeepSeekStream(generationOptions)
      );

      if (result.success && result.stream) {
        return streamResponse(result.stream);
      }

      const analyzed = analyzeDeepSeekError(result.error ? new Error(result.error.message) : new Error("未知错误"));
      return errorResponse(analyzed.message, analyzed.hint, 500);
    }

    if (isExplicitClaude) {
      console.log("[Generate] Provider 策略: claude (显式，不降级)");
      const hasKey = !!process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY.length > 10;
      if (!hasKey) {
        return errorResponse(
          "配置错误: Claude API Key 未设置。请在环境变量中配置 CLAUDE_API_KEY。",
          "请在 Vercel 项目设置中添加 CLAUDE_API_KEY 环境变量",
          500
        );
      }

      const result = await attemptWithTimeoutAndRetry("Claude", () =>
        generateClaudeStream({
          ...generationOptions,
          model: generationOptions.claudeModel,
        })
      );

      if (result.success && result.stream) {
        return streamResponse(result.stream);
      }

      const analyzed = analyzeClaudeError(result.error ? new Error(result.error.message) : new Error("未知错误"));
      return errorResponse(analyzed.message, analyzed.hint, 500);
    }

    console.log("[Generate] Provider 策略: auto (deepseek -> claude -> mock)");

    const hasDeepSeekKey = !!process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.length > 10;
    const hasClaudeKey = !!process.env.CLAUDE_API_KEY && process.env.CLAUDE_API_KEY.length > 10;

    if (hasDeepSeekKey) {
      console.log("[Generate] 自动模式 — 尝试 DeepSeek");
      const result = await attemptWithTimeoutAndRetry("DeepSeek", () =>
        generateDeepSeekStream(generationOptions)
      );
      if (result.success && result.stream) {
        return streamResponse(result.stream);
      }
      const analyzed = analyzeDeepSeekError(result.error ? new Error(result.error.message) : new Error("未知错误"));
      console.error(`[Generate] 自动模式 — DeepSeek 失败: ${analyzed.message}`);
    } else {
      console.log("[Generate] 自动模式 — 跳过 DeepSeek（未配置 DEEPSEEK_API_KEY）");
    }

    if (hasClaudeKey) {
      console.log("[Generate] 自动模式 — 尝试 Claude");
      const result = await attemptWithTimeoutAndRetry("Claude", () =>
        generateClaudeStream({
          ...generationOptions,
          model: generationOptions.claudeModel,
        })
      );
      if (result.success && result.stream) {
        return streamResponse(result.stream);
      }
      const analyzed = analyzeClaudeError(result.error ? new Error(result.error.message) : new Error("未知错误"));
      console.error(`[Generate] 自动模式 — Claude 失败: ${analyzed.message}`);
    } else {
      console.log("[Generate] 自动模式 — 跳过 Claude（未配置 CLAUDE_API_KEY）");
    }

    console.log("[Generate] 自动模式 — 回退到 Mock");
    const mockText = MOCK_RESPONSES[mode as keyof ModePrompt] || MOCK_RESPONSES.custom;
    return streamResponse(buildMockStream(mockText));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[Generate] 致命错误:", error);
    return errorResponse(message, "请稍后重试", 500);
  }
}
