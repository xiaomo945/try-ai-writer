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

const mockResponses: ModePrompt = {
  blog: `## Getting Started with AI Writing in 2025

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
  email: `Subject: Quick question about your Q2 content strategy

Hi there,

I hope this email finds you well. I wanted to follow up on our conversation about scaling your content output this quarter.

Here is what I would recommend:

1. **Leverage AI for first drafts** - Cut writing time by 60%
2. **Create a content calendar** - Plan 2 weeks ahead minimum
3. **Batch similar tasks** - Write all blog posts on Monday, edit on Tuesday

Would you be open to a quick 15-minute call this week to discuss? I have some ideas that could really move the needle for your team.

Looking forward to hearing from you.

Best regards`,
  social: `🚀 Stop writing from scratch.

AI-powered writing tools can generate blog posts, emails, and social content in seconds.

The best part? They learn your style and get better every time.

Try it free today. Your future self will thank you. ✨

#AIWriting #ContentCreation #ProductivityHacks #WriterLife #AItools`,
  custom: `Here is your custom generated content:\n\nThank you for using Use AI Writer. In a full setup with API credentials, this section would contain AI-generated content tailored to your specific prompt.\n\nTo unlock full functionality, please configure your Claude or DeepSeek API key in the environment variables.`,
};

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

    // Inject relevant memories into the system prompt
    if (relevantMemories && relevantMemories.length > 0) {
      const memoriesText = relevantMemories.join("\n\n");
      systemPrompt = `以下是你过去的相关想法，请在创作时保持观点的连贯性：\n\n${memoriesText}\n\n---\n\n${systemPrompt}`;
    }

    const aiProvider = (process.env.AI_PROVIDER || "claude").toLowerCase();
    console.log(`[Generate] Selected AI Provider: ${aiProvider}`);

    let stream: ReadableStream<Uint8Array>;

    // 只有明确设置为 mock 时才走 Mock
    if (aiProvider === "mock") {
      console.log("[Generate] Using mock mode explicitly");
      const mockText = mockResponses[mode as keyof ModePrompt] || mockResponses.custom;
      const encoder = new TextEncoder();
      
      // 模拟流式响应
      stream = new ReadableStream({
        async start(controller) {
          const chunkSize = 50;
          for (let i = 0; i < mockText.length; i += chunkSize) {
            const chunk = mockText.substring(i, i + chunkSize);
            controller.enqueue(encoder.encode(chunk));
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          controller.close();
        },
      });
    } else if (aiProvider === "deepseek") {
      console.log("[Generate] Using DeepSeek provider...");
      stream = await generateDeepSeekStream({
        prompt,
        systemPrompt,
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        maxTokens: 4096,
        temperature: 0.7,
      });
    } else if (aiProvider === "claude") {
      console.log("[Generate] Using Claude provider...");
      stream = await generateClaudeStream({
        prompt,
        systemPrompt,
        model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
        maxTokens: 4096,
        temperature: 0.7,
      });
    } else {
      console.warn(`[Generate] Unknown provider: ${aiProvider}, falling back to Claude`);
      stream = await generateClaudeStream({
        prompt,
        systemPrompt,
        model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
        maxTokens: 4096,
        temperature: 0.7,
      });
    }

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
    return Response.json({ error: message }, { status: 500 });
  }
}
