"use client";

import { Suspense, useRef, useState, useEffect, type ReactNode } from "react";

/**
 * Third-party library optimization utilities
 * Implements lazy loading and code splitting for heavy dependencies
 */

// Loading indicator component
function LoadingIndicator({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mr-3"></div>
      <span className="text-sm text-slate-600 dark:text-slate-400">{text}</span>
    </div>
  );
}

/**
 * Wrapper component for lazy-loaded third-party libraries
 */
export function LazyLibraryWrapper({
  children,
  fallback = <LoadingIndicator text="Loading..." />,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}

/**
 * Intersection Observer hook for lazy loading components
 * Only loads component when it's about to enter viewport
 */
export function useLazyLoad(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

/**
 * Preload a module on user interaction to reduce perceived latency
 */
export async function preloadModule(importFn: () => Promise<unknown>): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await importFn();
  } catch {
    // Silently fail - preload is best-effort
  }
}
