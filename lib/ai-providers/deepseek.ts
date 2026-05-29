import { GenerateStreamOptions } from "./types";

export async function generateDeepSeekStream(options: GenerateStreamOptions): Promise<ReadableStream<Uint8Array>> {
  const { 
    prompt, 
    systemPrompt = "You are a helpful AI assistant.", 
    model = "deepseek-chat", 
    maxTokens = 4096, 
    temperature = 0.7 
  } = options;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  // 调试日志
  console.log("[DeepSeek] Starting generation...");
  console.log(`[DeepSeek] API Key: ${apiKey ? apiKey.substring(0, 8) + "..." : "NOT SET"}`);
  console.log(`[DeepSeek] Model: ${model}`);
  
  if (!apiKey || apiKey === "your-deepseek-api-key-here" || apiKey.startsWith("your-")) {
    console.log("[DeepSeek] API Key missing or invalid, falling back to mock mode");
    throw new Error("DeepSeek API key not configured");
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
      stream: true,
    }),
  });

  console.log(`[DeepSeek] Response status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    const errBody = await response.text();
    console.error(`[DeepSeek] Error response: ${errBody}`);
    throw new Error(`DeepSeek API error: ${response.status} - ${errBody}`);
  }

  if (!response.body) {
    console.error("[DeepSeek] No response body received");
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
                if (parsed.choices?.[0]?.delta?.content) {
                  const text = parsed.choices[0].delta.content;
                  controller.enqueue(encoder.encode(text));
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
        controller.close();
      } catch (error) {
        console.error("[DeepSeek] Stream error:", error);
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
