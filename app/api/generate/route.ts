import { NextRequest } from "next/server";

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

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        stream: true,
        messages: [{ role: "user", content: systemPrompt }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return Response.json(
        { error: `Claude API error: ${response.status} - ${errBody}` },
        { status: response.status }
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return Response.json({ error: "No stream available" }, { status: 500 });
    }

    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);
                if (data === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                    controller.enqueue(encoder.encode(parsed.delta.text));
                  }
                } catch {
                  // ignore parse errors
                }
              }
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

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
