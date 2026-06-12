import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, getRateLimitKey, DEFAULT_RATE_LIMIT } from "../rate-limiter";

describe("rateLimit", () => {
  beforeEach(() => {
    // Reset by using a unique key each time
  });

  it("should allow requests within the limit", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < DEFAULT_RATE_LIMIT.maxRequests; i++) {
      const result = rateLimit(key, DEFAULT_RATE_LIMIT);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DEFAULT_RATE_LIMIT.maxRequests - i - 1);
    }
  });

  it("should block requests exceeding the limit", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < DEFAULT_RATE_LIMIT.maxRequests; i++) {
      rateLimit(key, DEFAULT_RATE_LIMIT);
    }
    const result = rateLimit(key, DEFAULT_RATE_LIMIT);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should return resetAt in the future", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    const result = rateLimit(key, DEFAULT_RATE_LIMIT);
    expect(result.resetAt).toBeGreaterThan(Date.now());
    expect(result.resetAt).toBeLessThanOrEqual(Date.now() + DEFAULT_RATE_LIMIT.windowMs);
  });

  it("should use separate counters for different keys", () => {
    const key1 = `test-${Date.now()}-1`;
    const key2 = `test-${Date.now()}-2`;

    // Exhaust key1
    for (let i = 0; i < DEFAULT_RATE_LIMIT.maxRequests; i++) {
      rateLimit(key1, DEFAULT_RATE_LIMIT);
    }
    const blocked = rateLimit(key1, DEFAULT_RATE_LIMIT);
    expect(blocked.allowed).toBe(false);

    // key2 should still be allowed
    const allowed = rateLimit(key2, DEFAULT_RATE_LIMIT);
    expect(allowed.allowed).toBe(true);
  });

  it("should respect custom config", () => {
    const config = { windowMs: 1000, maxRequests: 3 };
    const key = `test-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, config).allowed).toBe(true);
    }
    expect(rateLimit(key, config).allowed).toBe(false);
  });
});

describe("getRateLimitKey", () => {
  it("should use CF-Connecting-IP header when present", () => {
    const req = new Request("http://localhost", {
      headers: { "CF-Connecting-IP": "1.2.3.4" },
    });
    expect(getRateLimitKey(req)).toBe("ip:1.2.3.4");
  });

  it("should fall back to X-Forwarded-For", () => {
    const req = new Request("http://localhost", {
      headers: { "X-Forwarded-For": "5.6.7.8, 9.10.11.12" },
    });
    expect(getRateLimitKey(req)).toBe("ip:5.6.7.8");
  });

  it("should fall back to anonymous when no IP headers", () => {
    const req = new Request("http://localhost");
    expect(getRateLimitKey(req)).toBe("ip:anonymous");
  });
});