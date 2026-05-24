type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type DeepSeekChatCompletionRequest = {
  model: string;
  messages: DeepSeekMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
};

type DeepSeekStreamResponse = {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
};

export async function generateDeepSeekStream(
  apiKey: string,
  messages: DeepSeekMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 4096,
    } as DeepSeekChatCompletionRequest),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errBody}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No stream available from DeepSeek API");
  }

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
                const parsed = JSON.parse(data) as DeepSeekStreamResponse;
                if (parsed.choices?.[0]?.delta?.content) {
                  controller.enqueue(encoder.encode(parsed.choices[0].delta.content));
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
}
