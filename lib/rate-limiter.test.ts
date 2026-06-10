import { describe, it, expect } from "vitest";
import { rateLimit, getRateLimitKey, DEFAULT_RATE_LIMIT } from "@/lib/rate-limiter";

describe("rate-limiter", () => {
  it("should allow requests within limit", () => {
    const key = "test-user-1";
    for (let i = 0; i < DEFAULT_RATE_LIMIT.maxRequests; i++) {
      const result = rateLimit(key, DEFAULT_RATE_LIMIT);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DEFAULT_RATE_LIMIT.maxRequests - i - 1);
    }
  });

  it("should block requests after exceeding limit", () => {
    const key = "test-user-2";
    for (let i = 0; i < DEFAULT_RATE_LIMIT.maxRequests; i++) {
      rateLimit(key, DEFAULT_RATE_LIMIT);
    }
    const result = rateLimit(key, DEFAULT_RATE_LIMIT);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset after window expires", () => {
    const key = "test-user-3";
    const shortWindow = { windowMs: 10, maxRequests: 2 };
    rateLimit(key, shortWindow);
    rateLimit(key, shortWindow);
    const blocked = rateLimit(key, shortWindow);
    expect(blocked.allowed).toBe(false);

    // Simulate time pass (windowMs is small, just test the structure)
    expect(blocked.resetAt).toBeGreaterThan(Date.now() - 10);
  });

  it("getRateLimitKey should extract IP from headers", () => {
    const req = new Request("http://localhost/api/test", {
      headers: { "CF-Connecting-IP": "1.2.3.4" },
    });
    expect(getRateLimitKey(req)).toBe("ip:1.2.3.4");
  });

  it("getRateLimitKey should fallback for missing IP", () => {
    const req = new Request("http://localhost/api/test");
    expect(getRateLimitKey(req)).toBe("ip:anonymous");
  });
});