import { GenerateStreamOptions } from "./types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("DeepSeek");

function classifyDeepSeekError(status: number, body: string): { message: string; code: string } {
  if (status === 401) {
    return { message: "DeepSeek API key invalid or expired. Please check your DEEPSEEK_API_KEY.", code: "invalid_key" };
  }
  if (status === 403) {
    return { message: "DeepSeek API access forbidden. Your account may be restricted.", code: "forbidden" };
  }
  if (status === 429) {
    return { message: "DeepSeek rate limit exceeded or insufficient balance. Please check your API quota.", code: "rate_limit" };
  }
  if (status === 400) {
    return { message: `DeepSeek bad request: ${body || "invalid parameters"}`, code: "bad_request" };
  }
  if (status >= 500) {
    return { message: `DeepSeek server error (${status}). The service may be down.`, code: "server_error" };
  }
  return { message: `DeepSeek API error: ${status} - ${body || "unknown"}`, code: `http_${status}` };
}

export async function generateDeepSeekStream(options: GenerateStreamOptions): Promise<ReadableStream<Uint8Array>> {
  const {
    prompt,
    systemPrompt = "You are a helpful AI assistant.",
    model = "deepseek-chat",
    maxTokens = 4096,
    temperature = 0.7,
  } = options;

  const apiKey = process.env.DEEPSEEK_API_KEY;

  logger.info("Starting generation", { model });

  if (!apiKey || ["your-api-key-here", "your-deepseek-api-key-here"].includes(apiKey) || apiKey.length < 10) {
    logger.warn("API key missing or invalid");
    throw new Error("DeepSeek API key not configured");
  }

  const requestBody = JSON.stringify({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
    temperature,
    stream: true,
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      logger.info("Attempting request", { attempt: attempt + 1 });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: requestBody,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      logger.info("Response received", { status: response.status });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        logger.error("API error response", { status: response.status, body: errBody.substring(0, 200) });
        const classified = classifyDeepSeekError(response.status, errBody);
        lastError = new Error(classified.message);

        if (response.status === 401 || response.status === 403 || response.status === 400) {
          throw lastError;
        }
        continue;
      }

      if (!response.body) {
        logger.error("No response body received");
        lastError = new Error("No response body from DeepSeek API");
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
                    if (parsed.choices?.[0]?.delta?.content) {
                      const text = parsed.choices[0].delta.content;
                      controller.enqueue(encoder.encode(text));
                    }
                  } catch {
                    // ignore parse errors in stream chunks
                  }
                }
              }
            }
            controller.close();
          } catch (error) {
            logger.error("Stream error", { error: (error as Error).message });
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
        logger.warn("Request timed out", { attempt: attempt + 1 });
        lastError = new Error("DeepSeek API request timed out. The service may be slow or unavailable.");
      } else if (msg.includes("Failed to fetch") || msg.includes("fetch") || msg.includes("network") || msg.includes("ENOTFOUND")) {
        logger.warn("Network error", { attempt: attempt + 1, error: msg });
        lastError = new Error("Network error connecting to DeepSeek API. Please check your network connectivity.");
      } else {
        logger.error("Request failed", { attempt: attempt + 1, error: msg });
        lastError = error instanceof Error ? error : new Error(msg);
      }
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError || new Error("DeepSeek API unavailable after 2 attempts");
}