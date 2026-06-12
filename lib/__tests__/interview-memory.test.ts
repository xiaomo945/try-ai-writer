import { describe, it, expect } from "vitest";
import { calculateTopicSimilarity } from "../interview-memory";

describe("calculateTopicSimilarity", () => {
  it("should return 1 for identical topics", () => {
    const result = calculateTopicSimilarity("AI technology", "AI technology");
    expect(result).toBe(1);
  });

  it("should return 0 for completely different topics", () => {
    const result = calculateTopicSimilarity("AI technology", "cooking recipes");
    expect(result).toBe(0);
  });

  it("should return 0 for empty topics", () => {
    expect(calculateTopicSimilarity("", "AI")).toBe(0);
    expect(calculateTopicSimilarity("AI", "")).toBe(0);
    expect(calculateTopicSimilarity("", "")).toBe(0);
  });

  it("should detect partial matches", () => {
    const result = calculateTopicSimilarity("AI technology trends", "AI technology future");
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it("should handle Chinese text with common words", () => {
    // Chinese text without spaces splits as single tokens, so only exact substring matches work
    const result = calculateTopicSimilarity("人工智能 技术 发展", "人工智能 应用 前景");
    expect(result).toBeGreaterThan(0);
  });

  it("should be case insensitive", () => {
    const lower = calculateTopicSimilarity("ai technology", "ai technology");
    const upper = calculateTopicSimilarity("AI TECHNOLOGY", "AI TECHNOLOGY");
    const mixed = calculateTopicSimilarity("AI technology", "ai Technology");
    expect(lower).toBe(upper);
    expect(lower).toBe(mixed);
  });

  it("should ignore short words (<=2 chars)", () => {
    // "AI" and "is" are <=2 chars, filtered out; only "great" vs "awesome" remain = no match
    const result = calculateTopicSimilarity("AI is great", "AI is awesome");
    expect(result).toBe(0);
  });

  it("should handle substring matches", () => {
    const result = calculateTopicSimilarity("technology", "tech");
    // "tech" is a substring of "technology", so at least one match
    expect(result).toBeGreaterThan(0);
  });
});