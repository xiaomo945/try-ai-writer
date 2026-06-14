/**
 * Client-side Cache Management
 * Service Worker registration, cache management, and data prefetching
 * for improved performance and offline support.
 */

// ─── Service Worker Registration ─────────────────────────────────────────────

interface ServiceWorkerRegistrationOptions {
  scope?: string;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
}

/**
 * Register the service worker for offline support and caching.
 */
export async function registerServiceWorker(
  options: ServiceWorkerRegistrationOptions = {}
): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  const { scope = "/", onUpdate, onSuccess } = options;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope,
    });

    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.onstatechange = () => {
        if (installingWorker.state === "installed") {
          if (navigator.serviceWorker.controller) {
            // New content available
            onUpdate?.(registration);
          } else {
            // Content cached for the first time
            onSuccess?.(registration);
          }
        }
      };
    };

    return registration;
  } catch (error) {
    console.error("[ServiceWorker] Registration failed:", error);
    return null;
  }
}

/**
 * Unregister all service workers (useful for debugging).
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      return await registration.unregister();
    }
    return false;
  } catch (error) {
    console.error("[ServiceWorker] Unregister failed:", error);
    return false;
  }
}

// ─── Cache Manager ───────────────────────────────────────────────────────────

export type CacheName =
  | "static-v1"
  | "images-v1"
  | "api-v1"
  | "pages-v1"
  | "offline-v1";

interface CacheOptions {
  maxAge?: number; // milliseconds
  maxItems?: number;
  strategy?: "cache-first" | "network-first" | "stale-while-revalidate";
}

const DEFAULT_CACHE_OPTIONS: Required<CacheOptions> = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  maxItems: 100,
  strategy: "cache-first",
};

/**
 * CacheManager provides a unified API for managing browser caches.
 */
export class CacheManager {
  private cacheName: CacheName;
  private options: Required<CacheOptions>;

  constructor(cacheName: CacheName, options: CacheOptions = {}) {
    this.cacheName = cacheName;
    this.options = { ...DEFAULT_CACHE_OPTIONS, ...options };
  }

  /**
   * Check if Cache API is available.
   */
  private isAvailable(): boolean {
    return typeof caches !== "undefined";
  }

  /**
   * Get the cache instance.
   */
  private async getCache(): Promise<Cache | null> {
    if (!this.isAvailable()) return null;
    try {
      return await caches.open(this.cacheName);
    } catch (error) {
      console.error(`[CacheManager] Failed to open cache ${this.cacheName}:`, error);
      return null;
    }
  }

  /**
   * Store a request in the cache.
   */
  async put(url: string, response: Response): Promise<boolean> {
    const cache = await this.getCache();
    if (!cache) return false;

    try {
      // Add timestamp to response
      const timestampedResponse = new Response(response.clone().body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers({
          ...Object.fromEntries(response.headers.entries()),
          "X-Cache-Timestamp": Date.now().toString(),
        }),
      });

      await cache.put(url, timestampedResponse);
      await this.pruneCache();
      return true;
    } catch (error) {
      console.error(`[CacheManager] Failed to cache ${url}:`, error);
      return false;
    }
  }

  /**
   * Retrieve a cached response.
   */
  async get(url: string): Promise<Response | null> {
    const cache = await this.getCache();
    if (!cache) return null;

    try {
      const response = await cache.match(url);
      if (!response) return null;

      // Check if cache is expired
      const timestamp = response.headers.get("X-Cache-Timestamp");
      if (timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        if (age > this.options.maxAge) {
          await cache.delete(url);
          return null;
        }
      }

      return response;
    } catch (error) {
      console.error(`[CacheManager] Failed to retrieve ${url}:`, error);
      return null;
    }
  }

  /**
   * Delete a cached response.
   */
  async delete(url: string): Promise<boolean> {
    const cache = await this.getCache();
    if (!cache) return false;

    try {
      return await cache.delete(url);
    } catch (error) {
      console.error(`[CacheManager] Failed to delete ${url}:`, error);
      return false;
    }
  }

  /**
   * Clear all items in this cache.
   */
  async clear(): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      await caches.delete(this.cacheName);
      return true;
    } catch (error) {
      console.error(`[CacheManager] Failed to clear cache ${this.cacheName}:`, error);
      return false;
    }
  }

  /**
   * Prune old cache entries if maxItems is exceeded.
   */
  private async pruneCache(): Promise<void> {
    const cache = await this.getCache();
    if (!cache) return;

    try {
      const keys = await cache.keys();
      if (keys.length <= this.options.maxItems) return;

      // Remove oldest entries
      const toRemove = keys.slice(0, keys.length - this.options.maxItems);
      await Promise.all(toRemove.map((key) => cache.delete(key)));
    } catch (error) {
      console.error("[CacheManager] Failed to prune cache:", error);
    }
  }

  /**
   * Fetch with the configured caching strategy.
   */
  async fetch(url: string, fetchOptions?: RequestInit): Promise<Response> {
    const request = new Request(url, fetchOptions);

    switch (this.options.strategy) {
      case "cache-first": {
        const cached = await this.get(url);
        if (cached) return cached;

        const response = await fetch(request);
        if (response.ok) {
          await this.put(url, response.clone());
        }
        return response;
      }

      case "network-first": {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await this.put(url, response.clone());
          }
          return response;
        } catch (error) {
          const cached = await this.get(url);
          if (cached) return cached;
          throw error;
        }
      }

      case "stale-while-revalidate": {
        const cached = await this.get(url);

        // Revalidate in background
        fetch(request)
          .then(async (response) => {
            if (response.ok) {
              await this.put(url, response.clone());
            }
          })
          .catch(() => {
            // Ignore network errors in background revalidation
          });

        if (cached) return cached;

        // Wait for network if no cache
        const response = await fetch(request);
        if (response.ok) {
          await this.put(url, response.clone());
        }
        return response;
      }

      default:
        return fetch(request);
    }
  }
}

// ─── Data Prefetching ────────────────────────────────────────────────────────

interface PrefetchOptions {
  priority?: "high" | "low";
  cacheName?: CacheName;
}

/**
 * Prefetch data and store it in the cache for later use.
 */
export async function prefetchData<T>(
  url: string,
  options: PrefetchOptions = {}
): Promise<T | null> {
  if (typeof window === "undefined") return null;

  const { priority = "low", cacheName = "api-v1" } = options;

  try {
    const cache = new CacheManager(cacheName, {
      strategy: "cache-first",
    });

    // Check if already cached
    const cached = await cache.get(url);
    if (cached) {
      return await cached.json();
    }

    // Prefetch with appropriate priority
    const fetchOptions: RequestInit = {
      headers: {
        "X-Prefetch": "true",
      },
    };

    if (priority === "low" && "requestIdleCallback" in window) {
      return new Promise((resolve) => {
        window.requestIdleCallback(async () => {
          try {
            const response = await cache.fetch(url, fetchOptions);
            resolve(await response.json());
          } catch {
            resolve(null);
          }
        });
      });
    }

    const response = await cache.fetch(url, fetchOptions);
    return await response.json();
  } catch (error) {
    console.error(`[Prefetch] Failed to prefetch ${url}:`, error);
    return null;
  }
}

/**
 * Prefetch multiple URLs in parallel.
 */
export async function prefetchMultiple<T>(
  urls: string[],
  options: PrefetchOptions = {}
): Promise<Map<string, T | null>> {
  const results = new Map<string, T | null>();

  const promises = urls.map(async (url) => {
    const data = await prefetchData<T>(url, options);
    results.set(url, data);
  });

  await Promise.allSettled(promises);
  return results;
}

// ─── React Hooks ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

interface UseCachedDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * React hook to access cached data.
 */
export function useCachedData<T>(
  url: string,
  cacheName: CacheName = "api-v1"
): UseCachedDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const cache = new CacheManager(cacheName);
      const response = await cache.fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [url, cacheName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

interface UseCachedFetchResult<T> extends UseCachedDataResult<T> {
  mutate: (newData: T) => Promise<void>;
}

/**
 * React hook for cached fetch with mutation support.
 */
export function useCachedFetch<T>(
  url: string,
  cacheName: CacheName = "api-v1"
): UseCachedFetchResult<T> {
  const { data, loading, error, refetch } = useCachedData<T>(url, cacheName);

  const mutate = useCallback(
    async (newData: T) => {
      const cache = new CacheManager(cacheName);
      const response = new Response(JSON.stringify(newData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      await cache.put(url, response);
      // Trigger a refetch to update the data state
      await refetch();
    },
    [url, cacheName, refetch]
  );

  return { data, loading, error, refetch, mutate };
}
