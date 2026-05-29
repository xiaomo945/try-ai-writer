export interface GenerateStreamOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  generateStream(options: GenerateStreamOptions): Promise<ReadableStream<Uint8Array>>;
}
