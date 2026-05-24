import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: NextRequest) {
  try {
    const { prompt, mode } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const modePrompts: Record<string, string> = {
      blog: `You are an expert blog writer. Write a comprehensive, engaging blog post based on the following topic. Use markdown formatting with headings, subheadings, and bullet points where appropriate.\n\nTopic: ${prompt}`,
      email: `You are a professional email copywriter. Write a polished, persuasive email based on the following brief. Keep it concise and actionable.\n\nBrief: ${prompt}`,
      social: `You are a social media content creator. Write an engaging social media post based on the following topic. Include relevant hashtags and keep it snappy.\n\nTopic: ${prompt}`,
      custom: prompt,
    };

    const systemPrompt = modePrompts[mode] || modePrompts.custom || prompt;

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key not configured" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: systemPrompt }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "text_delta" && event.delta) {
              controller.enqueue(encoder.encode(event.delta));
            }
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Stream error";
          controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
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
