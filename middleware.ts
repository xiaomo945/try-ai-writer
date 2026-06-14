import { NextRequest, NextResponse } from "next/server";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATIC_FILE_EXTENSIONS = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".svg", ".ico", ".webp", ".avif",
  ".css", ".js", ".mjs", ".map",
  ".woff", ".woff2", ".ttf", ".eot",
  ".pdf", ".json", ".xml",
  ".mp4", ".webm", ".ogg", ".mp3", ".wav",
]);

const IMMUTABLE_PATH_PREFIX = "/_next/static/";

// ─── Cache Headers by Path ───────────────────────────────────────────────────

interface CacheConfig {
  "Cache-Control": string;
  "CDN-Cache-Control"?: string;
}

function getCacheConfig(pathname: string): CacheConfig | null {
  // Immutable static assets from Next.js build
  if (pathname.startsWith(IMMUTABLE_PATH_PREFIX)) {
    return {
      "Cache-Control": "public, max-age=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000, immutable",
    };
  }

  // Other static files in /public
  const ext = getExtension(pathname);
  if (ext && STATIC_FILE_EXTENSIONS.has(ext)) {
    const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif", ".svg"].includes(ext);
    const maxAge = isImage ? 86400 * 30 : 86400 * 7;
    return {
      "Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
      "CDN-Cache-Control": `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 4}`,
    };
  }

  // API routes — no caching by default
  if (pathname.startsWith("/api/")) {
    return {
      "Cache-Control": "private, no-store, no-cache, must-revalidate, proxy-revalidate",
    };
  }

  // Analytics/data routes — short cache
  if (pathname.startsWith("/api/analytics") || pathname.startsWith("/data/")) {
    return {
      "Cache-Control": "private, max-age=300, stale-while-revalidate=3600",
      "CDN-Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    };
  }

  // Page routes — short cache with revalidation
  return {
    "Cache-Control": "public, max-age=0, must-revalidate",
    "CDN-Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  };
}

// ─── Security Headers ────────────────────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
  "X-Download-Options": "noopen",
  "X-XSS-Protection": "0",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getExtension(pathname: string): string | null {
  const lastDot = pathname.lastIndexOf(".");
  if (lastDot === -1) return null;
  const lastSlash = pathname.lastIndexOf("/");
  if (lastDot < lastSlash) return null;
  return pathname.slice(lastDot).toLowerCase();
}

function shouldSkip(pathname: string): boolean {
  // Skip middleware for _next internal paths that are already handled
  // We still want to add cache headers for static files under _next/static
  return false;
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (shouldSkip(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Add security headers
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Add cache headers based on path
  const cacheConfig = getCacheConfig(pathname);
  if (cacheConfig) {
    for (const [key, value] of Object.entries(cacheConfig)) {
      response.headers.set(key, value);
    }
  }

  // Vary header for proper caching
  response.headers.set("Vary", "Accept-Encoding");

  return response;
}

// ─── Config ──────────────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/data (data requests)
     * - favicon.ico
     * - manifest files
     */
    "/((?!_next/data|favicon\\.ico|manifest).*)",
  ],
};
