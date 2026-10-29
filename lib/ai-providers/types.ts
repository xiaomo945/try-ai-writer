export interface GenerateStreamOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /**
   * Bring-your-own-key: when set, the provider uses this key instead of the
   * server env var. Never persisted — it lives only for this request.
   */
  apiKey?: string;
}

export interface AIProvider {
  generateStream(options: GenerateStreamOptions): Promise<ReadableStream<Uint8Array>>;
}
