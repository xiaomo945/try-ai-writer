"use client";

import React, { useEffect, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WebVitalMetric {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  unit: string;
}

interface PerformanceMetrics {
  fcp: WebVitalMetric | null;
  lcp: WebVitalMetric | null;
  cls: WebVitalMetric | null;
  fid: WebVitalMetric | null;
  ttfb: WebVitalMetric | null;
}

interface PerformanceMonitorProps {
  visible?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

// ─── Metric Rating Helpers ───────────────────────────────────────────────────

function rateFCP(value: number): "good" | "needs-improvement" | "poor" {
  if (value <= 1800) return "good";
  if (value <= 3000) return "needs-improvement";
  return "poor";
}

function rateLCP(value: number): "good" | "needs-improvement" | "poor" {
  if (value <= 2500) return "good";
  if (value <= 4000) return "needs-improvement";
  return "poor";
}

function rateCLS(value: number): "good" | "needs-improvement" | "poor" {
  if (value <= 0.1) return "good";
  if (value <= 0.25) return "needs-improvement";
  return "poor";
}

function rateFID(value: number): "good" | "needs-improvement" | "poor" {
  if (value <= 100) return "good";
  if (value <= 300) return "needs-improvement";
  return "poor";
}

function rateTTFB(value: number): "good" | "needs-improvement" | "poor" {
  if (value <= 800) return "good";
  if (value <= 1800) return "needs-improvement";
  return "poor";
}

function getRatingColor(rating: "good" | "needs-improvement" | "poor"): string {
  switch (rating) {
    case "good":
      return "text-emerald-600 dark:text-emerald-400";
    case "needs-improvement":
      return "text-amber-500 dark:text-amber-400";
    case "poor":
      return "text-red-500 dark:text-red-400";
  }
}

function getRatingBg(rating: "good" | "needs-improvement" | "poor"): string {
  switch (rating) {
    case "good":
      return "bg-emerald-600/10 dark:bg-emerald-400/10";
    case "needs-improvement":
      return "bg-amber-500/10 dark:bg-amber-400/10";
    case "poor":
      return "bg-red-500/10 dark:bg-red-400/10";
  }
}

function formatValue(value: number, unit: string): string {
  if (unit === "ms") {
    return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(2)}s`;
  }
  return value.toFixed(3);
}

// ─── Web Vitals Tracking ─────────────────────────────────────────────────────

function trackWebVitals(
  onMetric: (metric: WebVitalMetric) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const cleanups: Array<() => void> = [];

  // Use PerformanceObserver for web vitals
  const observe = (
    entryType: string,
    handler: (entries: PerformanceEntryList) => void
  ) => {
    try {
      const observer = new PerformanceObserver((list) => {
        handler(list.getEntries());
      });
      observer.observe({ type: entryType, buffered: true } as PerformanceObserverInit);
      cleanups.push(() => observer.disconnect());
    } catch {
      // PerformanceObserver not supported for this type
    }
  };

  // FCP (First Contentful Paint)
  observe("paint", (entries) => {
    for (const entry of entries) {
      if (entry.name === "first-contentful-paint") {
        onMetric({
          name: "FCP",
          value: entry.startTime,
          rating: rateFCP(entry.startTime),
          unit: "ms",
        });
      }
    }
  });

  // LCP (Largest Contentful Paint)
  observe("largest-contentful-paint", (entries) => {
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      onMetric({
        name: "LCP",
        value: lastEntry.startTime,
        rating: rateLCP(lastEntry.startTime),
        unit: "ms",
      });
    }
  });

  // CLS (Cumulative Layout Shift)
  let clsValue = 0;
  observe("layout-shift", (entries) => {
    for (const entry of entries) {
      if (!(entry as unknown as { hadRecentInput: boolean }).hadRecentInput) {
        clsValue += (entry as unknown as { value: number }).value;
      }
    }
    onMetric({
      name: "CLS",
      value: clsValue,
      rating: rateCLS(clsValue),
      unit: "",
    });
  });

  // FID (First Input Delay) — legacy, prefer INP
  observe("first-input", (entries) => {
    const firstEntry = entries[0];
    if (firstEntry) {
      const fid =
        (firstEntry as unknown as { processingStart: number }).processingStart -
        firstEntry.startTime;
      onMetric({
        name: "FID",
        value: fid,
        rating: rateFID(fid),
        unit: "ms",
      });
    }
  });

  // TTFB (Time to First Byte)
  try {
    const navEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;
    if (navEntry) {
      const ttfb = navEntry.responseStart - navEntry.requestStart;
      onMetric({
        name: "TTFB",
        value: ttfb,
        rating: rateTTFB(ttfb),
        unit: "ms",
      });
    }
  } catch {
    // Ignore
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

const POSITION_CLASSES: Record<string, string> = {
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
};

/**
 * Performance monitor overlay that displays Core Web Vitals
 * and other performance metrics in real-time.
 */
export function PerformanceMonitor({
  visible = process.env.NODE_ENV === "development",
  position = "bottom-right",
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null,
    ttfb: null,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const cleanup = trackWebVitals((metric) => {
      setMetrics((prev) => {
        const key = metric.name.toLowerCase() as keyof PerformanceMetrics;
        return { ...prev, [key]: metric };
      });
    });

    return cleanup;
  }, [visible]);

  const handleRefresh = useCallback(() => {
    setMetrics({ fcp: null, lcp: null, cls: null, fid: null, ttfb: null });
  }, []);

  if (!visible) return null;

  const metricEntries: Array<{ key: string; metric: WebVitalMetric | null }> = [
    { key: "fcp", metric: metrics.fcp },
    { key: "lcp", metric: metrics.lcp },
    { key: "cls", metric: metrics.cls },
    { key: "fid", metric: metrics.fid },
    { key: "ttfb", metric: metrics.ttfb },
  ];

  return (
    <div
      className={`fixed z-50 ${POSITION_CLASSES[position]} transition-all duration-300 ease-out`}
    >
      {isExpanded ? (
        <div className="w-72 rounded-2xl border border-white/10 bg-white/95 shadow-xl shadow-emerald-500/5 backdrop-blur-xl dark:bg-slate-900/95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Performance
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                title="Reset metrics"
                aria-label="Reset metrics"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                title="Minimize"
                aria-label="Minimize"
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-1 p-3">
            {metricEntries.map(({ key, metric }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg px-3 py-2"
              >
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {key.toUpperCase()}
                </span>
                {metric ? (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${getRatingColor(metric.rating)}`}
                    >
                      {formatValue(metric.value, metric.unit)}
                    </span>
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getRatingBg(metric.rating)} ${getRatingColor(metric.rating)}`}
                    >
                      {metric.rating === "good"
                        ? "Good"
                        : metric.rating === "needs-improvement"
                          ? "NI"
                          : "Poor"}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-600">
                    ...
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/95 shadow-lg shadow-emerald-500/5 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 dark:bg-slate-900/95"
          title="Show performance metrics"
          aria-label="Show performance metrics"
        >
          <div className="relative">
            <svg
              className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {/* Indicator dot for poor metrics */}
            {metricEntries.some(
              (m) => m.metric?.rating === "poor"
            ) && (
              <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </div>
        </button>
      )}
    </div>
  );
}
