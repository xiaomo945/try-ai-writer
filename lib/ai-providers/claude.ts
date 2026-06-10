import { GenerateStreamOptions } from "./types";

export async function generateClaudeStream(options: GenerateStreamOptions): Promise<ReadableStream<Uint8Array>> {
  const {
    prompt,
    systemPrompt = "You are a helpful AI assistant.",
    model = "claude-sonnet-4-20250514",
    maxTokens = 4096,
    temperature = 0.7,
  } = options;

  const apiKey = process.env.CLAUDE_API_KEY;

  console.log("[Claude] Starting generation...");
  console.log(`[Claude] API Key: ${apiKey ? apiKey.substring(0, Math.min(8, apiKey.length)) + "..." : "NOT SET"}`);
  console.log(`[Claude] Model: ${model}`);

  if (!apiKey || ["your-api-key-here", "sk-ant-xxxxx"].includes(apiKey) || apiKey.length < 10) {
    console.log("[Claude] API Key missing or invalid, falling back to mock mode");
    throw new Error("Claude API key not configured");
  }

  const requestBody = JSON.stringify({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    stream: true,
    messages: [{ role: "user", content: prompt }],
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      console.log(`[Claude] Attempt ${attempt + 1}/2...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`[Claude] Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        console.error(`[Claude] Error response: ${errBody}`);
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Claude API key invalid or expired (${response.status}).`);
        }
        if (response.status === 429) {
          throw new Error("Claude rate limit exceeded or insufficient balance.");
        }
        lastError = new Error(`Claude API error: ${response.status} - ${errBody}`);
        continue;
      }

      if (!response.body) {
        console.error("[Claude] No response body received");
        lastError = new Error("No response body from Claude API");
        continue;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      return new ReadableStream({
        async start(controller) {
          try {
            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith("data: ")) {
                  const data = trimmed.slice(6);
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
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("aborted") || msg.includes("timeout") || msg.includes("Timeout")) {
        console.error(`[Claude] Attempt ${attempt + 1} timed out`);
        lastError = new Error("Claude API request timed out.");
      } else if (msg.includes("Failed to fetch") || msg.includes("fetch") || msg.includes("network") || msg.includes("ENOTFOUND")) {
        console.error(`[Claude] Attempt ${attempt + 1} network error: ${msg}`);
        lastError = new Error("Network error connecting to Claude API.");
      } else {
        console.error(`[Claude] Attempt ${attempt + 1} failed: ${msg}`);
        lastError = error instanceof Error ? error : new Error(msg);
      }
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("Claude API unavailable after 2 attempts");
}
