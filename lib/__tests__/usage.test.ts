import { describe, it, expect } from "vitest";
import { isNoiseInput } from "../usage";

describe("isNoiseInput", () => {
  it("should detect empty input as noise", () => {
    const result = isNoiseInput("");
    expect(result.isNoise).toBe(true);
    expect(result.reason).toBe("empty");
  });

  it("should detect whitespace-only input as noise", () => {
    const result = isNoiseInput("   \n  \t  ");
    expect(result.isNoise).toBe(true);
    expect(result.reason).toBe("empty");
  });

  it("should detect pure greetings as noise", () => {
    const result = isNoiseInput("你好");
    expect(result.isNoise).toBe(true);
    expect(result.reason).toBe("greeting");
  });

  it("should detect 'hello' as noise", () => {
    const result = isNoiseInput("hello");
    expect(result.isNoise).toBe(true);
    expect(result.reason).toBe("greeting");
  });

  it("should detect pure punctuation as noise", () => {
    const result = isNoiseInput("!?.,;:()");
    expect(result.isNoise).toBe(true);
    expect(result.reason).toBe("punctuation");
  });

  it("should detect pure numbers as noise", () => {
    const result = isNoiseInput("12345 67890");
    expect(result.isNoise).toBe(true);
    expect(result.reason).toBe("numbers");
  });

  it("should detect too short input without meaningful words as noise", () => {
    const result = isNoiseInput("ab");
    expect(result.isNoise).toBe(true);
    expect(result.reason).toBe("too_short");
  });

  it("should detect repeated characters as garbled noise", () => {
    const result = isNoiseInput("asdfasdfasdfasdf");
    expect(result.isNoise).toBe(true);
    expect(result.reason).toBe("garbled");
  });

  it("should detect garbled English as noise", () => {
    const result = isNoiseInput("asdf ghjk zxcv bnmq");
    expect(result.isNoise).toBe(true);
    expect(result.reason).toBe("garbled");
  });

  it("should accept valid content input", () => {
    const result = isNoiseInput("写一篇关于AI的文章，主题是人工智能的未来发展");
    expect(result.isNoise).toBe(false);
  });

  it("should accept meaningful short input", () => {
    const result = isNoiseInput("写文章");
    expect(result.isNoise).toBe(false);
  });

  it("should accept English content", () => {
    const result = isNoiseInput("Write a blog post about AI technology trends");
    expect(result.isNoise).toBe(false);
  });
});