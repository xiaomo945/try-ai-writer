import { GenerateStreamOptions } from "./types";

export async function generateClaudeStream(options: GenerateStreamOptions): Promise<ReadableStream<Uint8Array>> {
  const { 
    prompt, 
    systemPrompt = "You are a helpful AI assistant.", 
    model = "claude-sonnet-4-20250514", 
    maxTokens = 4096, 
    temperature = 0.7 
  } = options;

  const apiKey = process.env.CLAUDE_API_KEY;
  
  console.log("[Claude] Starting generation...");
  console.log(`[Claude] API Key: ${apiKey ? apiKey.substring(0, Math.min(8, apiKey.length)) + "..." : "NOT SET"}`);
  console.log(`[Claude] Model: ${model}`);
  
  if (!apiKey || ["your-api-key-here", "sk-ant-xxxxx"].includes(apiKey) || apiKey.length < 10) {
    console.log("[Claude] API Key missing or invalid, falling back to mock mode");
    throw new Error("Claude API key not configured");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      stream: true,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  console.log(`[Claude] Response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errBody = await response.text();
    console.error(`[Claude] Error response: ${errBody}`);
    throw new Error(`Claude API error: ${response.status} - ${errBody}`);
  }

  if (!response.body) {
    console.error("[Claude] No response body received");
    throw new Error("No response body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
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
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
        controller.close();
      } catch (error) {
        console.error("[Claude] Stream error:", error);
        try {
          controller.error(error);
        } catch {
          // ignore
        }
      } finally {
        try {
          reader.releaseLock();
        } catch {
          // ignore
        }
      }
    },
  });
}
