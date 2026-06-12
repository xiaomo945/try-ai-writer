import { describe, it, expect } from "vitest";
import { scoreStyleMatch, type BrandVoiceProfile } from "../style-matcher";

const profile: BrandVoiceProfile = {
  tone: {
    formality: 70,
    sentiment: "positive",
    pace: "moderate",
  },
  commonPhrases: ["cutting-edge", "seamless integration", "game-changer"],
  avgSentenceLength: 15,
  avgParagraphLength: 60,
  industryTerms: ["AI", "machine learning"],
};

describe("scoreStyleMatch", () => {
  it("should return zero score for empty text", () => {
    const result = scoreStyleMatch("", profile);
    expect(result.score).toBe(0);
    expect(result.breakdown.tone).toBe(0);
    expect(result.breakdown.vocabulary).toBe(0);
    expect(result.breakdown.structure).toBe(0);
  });

  it("should return a score between 0 and 100 for valid text", () => {
    const result = scoreStyleMatch("This is a test text that should match the brand voice", profile);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("should return breakdown with all three dimensions", () => {
    const result = scoreStyleMatch("This is a test", profile);
    expect(result.breakdown.tone).toBeDefined();
    expect(result.breakdown.vocabulary).toBeDefined();
    expect(result.breakdown.structure).toBeDefined();
  });

  it("should give higher score when brand phrases are present", () => {
    const withoutPhrases = scoreStyleMatch("This is a simple test", profile);
    const withPhrases = scoreStyleMatch(
      "This cutting-edge solution provides seamless integration that is a game-changer",
      profile
    );
    expect(withPhrases.breakdown.vocabulary).toBeGreaterThan(withoutPhrases.breakdown.vocabulary);
  });

  it("should provide suggestions when score is low", () => {
    const result = scoreStyleMatch("just a short text", profile);
    expect(result.suggestions).toBeDefined();
    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  it("should handle whitespace-only text", () => {
    const result = scoreStyleMatch("   ", profile);
    expect(result.score).toBe(0);
  });
});