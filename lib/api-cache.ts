/**
 * API Cache Utilities
 * Provides cache header generation, ETag support, and CORS headers
 * for API routes with different caching strategies.
 */

// ─── Cache Strategy Types ────────────────────────────────────────────────────

export type CacheStrategy = "analytics" | "static" | "user" | "none";

interface CacheStrategyConfig {
  maxAge: number;
  sMaxAge: number;
  staleWhileRevalidate: number;
  isPublic: boolean;
  vary: string[];
}

const STRATEGIES: Record<CacheStrategy, CacheStrategyConfig> = {
  analytics: {
    maxAge: 300,        // 5 minutes client cache
    sMaxAge: 600,       // 10 minutes CDN cache
    staleWhileRevalidate: 3600, // 1 hour stale-while-revalidate
    isPublic: true,
    vary: ["Accept-Encoding"],
  },
  static: {
    maxAge: 86400,      // 1 day client cache
    sMaxAge: 604800,    // 1 week CDN cache
    staleWhileRevalidate: 2592000, // 30 days stale-while-revalidate
    isPublic: true,
    vary: ["Accept-Encoding"],
  },
  user: {
    maxAge: 0,
    sMaxAge: 0,
    staleWhileRevalidate: 0,
    isPublic: false,
    vary: ["Accept-Encoding", "Authorization", "Cookie"],
  },
  none: {
    maxAge: 0,
    sMaxAge: 0,
    staleWhileRevalidate: 0,
    isPublic: false,
    vary: ["Accept-Encoding"],
  },
};

// ─── Cache Headers ───────────────────────────────────────────────────────────

interface CacheHeaders {
  "Cache-Control": string;
  "CDN-Cache-Control"?: string;
  Vary: string;
}

/**
 * Generate Cache-Control headers based on the caching strategy.
 */
export function createCacheHeaders(strategy: CacheStrategy): CacheHeaders {
  const config = STRATEGIES[strategy];

  if (strategy === "none") {
    return {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Vary: config.vary.join(", "),
    };
  }

  const directives: string[] = [];

  if (config.isPublic) {
    directives.push("public");
  } else {
    directives.push("private");
  }

  directives.push(`max-age=${config.maxAge}`);

  if (config.sMaxAge > 0) {
    directives.push(`s-maxage=${config.sMaxAge}`);
  }

  if (config.staleWhileRevalidate > 0) {
    directives.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }

  directives.push("stale-if-error=86400");

  const headers: CacheHeaders = {
    "Cache-Control": directives.join(", "),
    Vary: config.vary.join(", "),
  };

  // CDN-specific cache control (Cloudflare, etc.)
  if (config.sMaxAge > 0) {
    headers["CDN-Cache-Control"] = `public, s-maxage=${config.sMaxAge}, stale-while-revalidate=${config.staleWhileRevalidate}`;
  }

  return headers;
}

// ─── ETag Support ────────────────────────────────────────────────────────────

/**
 * Generate an ETag from content data.
 * Uses a simple hash for speed; suitable for most API responses.
 */
export function generateETag(data: unknown): string {
  const json = typeof data === "string" ? data : JSON.stringify(data);
  let hash = 0;

  for (let i = 0; i < json.length; i++) {
    const char = json.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }

  // Prefix with length to reduce collisions
  return `"${json.length.toString(36)}-${(hash >>> 0).toString(36)}"`;
}

interface ETagCheckResult {
  matched: boolean;
  status: 200 | 304;
  headers: Record<string, string>;
}

/**
 * Check If-None-Match header against the current ETag.
 * Returns 304 Not Modified if matched, 200 otherwise.
 */
export function checkIfNoneMatch(
  request: Request,
  etag: string
): ETagCheckResult {
  const ifNoneMatch = request.headers.get("If-None-Match");

  const headers: Record<string, string> = {
    ETag: etag,
  };

  if (ifNoneMatch && ifNoneMatch === etag) {
    return {
      matched: true,
      status: 304,
      headers,
    };
  }

  return {
    matched: false,
    status: 200,
    headers,
  };
}

// ─── CORS Headers ────────────────────────────────────────────────────────────

interface CORSOptions {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  maxAge?: number;
  allowCredentials?: boolean;
}

const DEFAULT_CORS: Required<CORSOptions> = {
  allowedOrigins: ["https://tryaiwriter.com", "https://www.tryaiwriter.com"],
  allowedMethods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
  allowCredentials: true,
};

/**
 * Add CORS headers to a response.
 * In development, allows all origins. In production, restricts to known origins.
 */
export function addCORSHeaders(
  response: Response,
  request?: Request,
  options?: CORSOptions
): Response {
  const config = { ...DEFAULT_CORS, ...options };
  const origin = request?.headers.get("Origin") ?? "";

  const isDev = process.env.NODE_ENV === "development";
  const isAllowedOrigin =
    isDev ||
    config.allowedOrigins.includes(origin) ||
    origin.endsWith(".tryaiwriter.com");

  if (isAllowedOrigin && origin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  } else if (isDev) {
    response.headers.set("Access-Control-Allow-Origin", "*");
  }

  if (config.allowCredentials) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    config.allowedMethods.join(", ")
  );

  response.headers.set(
    "Access-Control-Allow-Headers",
    config.allowedHeaders.join(", ")
  );

  response.headers.set(
    "Access-Control-Max-Age",
    config.maxAge.toString()
  );

  return response;
}

/**
 * Handle CORS preflight (OPTIONS) requests.
 */
export function handleCORSOptions(
  request: Request,
  options?: CORSOptions
): Response {
  const response = new Response(null, { status: 204 });
  return addCORSHeaders(response, request, options);
}

// ─── Combined Helper ─────────────────────────────────────────────────────────

interface APIResponseOptions {
  strategy?: CacheStrategy;
  etag?: boolean;
  cors?: CORSOptions | boolean;
}

/**
 * Create a JSON Response with cache headers, ETag, and CORS support.
 */
export function createCachedResponse(
  data: unknown,
  request: Request,
  options: APIResponseOptions = {}
): Response {
  const { strategy = "none", etag: useETag = false, cors = false } = options;

  const headers = new Headers();

  // Cache headers
  const cacheHeaders = createCacheHeaders(strategy);
  for (const [key, value] of Object.entries(cacheHeaders)) {
    headers.set(key, value);
  }

  headers.set("Content-Type", "application/json");

  // ETag support
  if (useETag) {
    const etag = generateETag(data);
    const etagResult = checkIfNoneMatch(request, etag);

    for (const [key, value] of Object.entries(etagResult.headers)) {
      headers.set(key, value);
    }

    if (etagResult.matched) {
      const response = new Response(null, {
        status: 304,
        headers,
      });
      if (cors) {
        return addCORSHeaders(
          response,
          request,
          typeof cors === "object" ? cors : undefined
        );
      }
      return response;
    }
  }

  const body = typeof data === "string" ? data : JSON.stringify(data);

  const response = new Response(body, {
    status: 200,
    headers,
  });

  if (cors) {
    return addCORSHeaders(
      response,
      request,
      typeof cors === "object" ? cors : undefined
    );
  }

  return response;
}
