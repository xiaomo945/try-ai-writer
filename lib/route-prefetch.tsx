import { useRouter } from "next/navigation";
import { useEffect, useCallback, type ReactNode } from "react";

/**
 * Intelligent route prefetching based on navigation patterns
 * Prefetches likely next routes to improve perceived navigation speed
 */

// Navigation pattern definitions: current route -> likely next routes
export const NAVIGATION_PATTERNS = {
  "/": ["/blog", "/pricing", "/features"],
  "/blog": ["/blog/[slug]", "/pricing"],
  "/blog/[slug]": ["/blog", "/pricing", "/dashboard"],
  "/pricing": ["/dashboard", "/blog"],
  "/features": ["/pricing", "/dashboard"],
  "/dashboard": ["/dashboard/history", "/dashboard/settings", "/write"],
  "/dashboard/history": ["/dashboard", "/write"],
  "/dashboard/settings": ["/dashboard"],
  "/write": ["/dashboard", "/dashboard/history"],
} as const;

// Priority weights for prefetching (lower = higher priority)
export const ROUTE_PRIORITIES: Record<string, number> = {
  "/": 1,
  "/blog": 2,
  "/pricing": 3,
  "/features": 4,
  "/dashboard": 2,
  "/write": 3,
};

/**
 * Prefetch a single route using Next.js router
 */
export function prefetchRoute(route: string): void {
  if (typeof window === "undefined") return;

  // Use Next.js prefetch mechanism
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = route;
  document.head.appendChild(link);
}

/**
 * Prefetch likely next routes based on current path
 */
export function prefetchLikelyRoutes(currentPath: string): void {
  const likelyRoutes = NAVIGATION_PATTERNS[currentPath as keyof typeof NAVIGATION_PATTERNS];

  if (likelyRoutes) {
    likelyRoutes.forEach((route, index) => {
      setTimeout(() => prefetchRoute(route), index * 100);
    });
  }
}

/**
 * Hook for intelligent route prefetching
 * Automatically prefetches routes based on current path and user behavior
 */
export function useRoutePrefetch(currentPath: string) {
  useEffect(() => {
    // Prefetch on mount with a delay to avoid blocking initial render
    const timeout = setTimeout(() => {
      prefetchLikelyRoutes(currentPath);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [currentPath]);

  return { prefetchRoute, prefetchLikelyRoutes };
}

/**
 * Component that wraps links with prefetch-on-hover behavior
 */
export function PrefetchLink({
  href,
  children,
  priority = false,
}: {
  href: string;
  children: ReactNode;
  priority?: boolean;
}) {
  const handleMouseEnter = useCallback(() => {
    prefetchRoute(href);
  }, [href]);

  const handleFocus = useCallback(() => {
    prefetchRoute(href);
  }, [href]);

  return (
    <a
      href={href}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      data-prefetch-priority={priority ? "high" : "normal"}
    >
      {children}
    </a>
  );
}
