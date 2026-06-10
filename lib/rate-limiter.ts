/**
 * Simple in-memory rate limiter for API routes.
 * Tracks requests per IP/session in a sliding window.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically (every 60s)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 60000);
}

export interface RateLimitConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // New or expired window
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    store.set(key, newEntry);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Increment existing window
  entry.count += 1;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed: entry.count <= config.maxRequests,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Extract a rate limit key from a NextRequest.
 * Falls back from CF-Connecting-IP → X-Forwarded-For → anonymous.
 */
export function getRateLimitKey(req: Request): string {
  // Prefer Cloudflare's connecting IP header
  const cfIp = req.headers.get("CF-Connecting-IP");
  if (cfIp) return `ip:${cfIp}`;

  const forwarded = req.headers.get("X-Forwarded-For");
  if (forwarded) return `ip:${forwarded.split(",")[0]?.trim() || "unknown"}`;

  // Fallback for local dev
  return "ip:anonymous";
}

export const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,      // 10 requests per minute
};