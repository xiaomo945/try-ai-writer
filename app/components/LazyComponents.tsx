"use client";

import dynamic from "next/dynamic";
import React from "react";

// ─── Loading Fallbacks ───────────────────────────────────────────────────────

function MarkdownPreviewLoading() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600/30 border-t-emerald-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading preview...
        </p>
      </div>
    </div>
  );
}

function RichTextEditorLoading() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl">
      <div className="mb-4 h-10 w-full animate-skeleton-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/80" />
      <div className="space-y-3">
        <div className="h-4 w-full animate-skeleton-pulse rounded bg-slate-200/60 dark:bg-slate-800/80" />
        <div className="h-4 w-5/6 animate-skeleton-pulse rounded bg-slate-200/60 dark:bg-slate-800/80" />
        <div className="h-4 w-4/6 animate-skeleton-pulse rounded bg-slate-200/60 dark:bg-slate-800/80" />
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="h-8 w-48 animate-skeleton-pulse rounded-lg bg-slate-200/60 dark:bg-slate-800/80" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 animate-skeleton-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/80"
          />
        ))}
      </div>
    </div>
  );
}

function AnalyticsLoading() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-6 w-36 animate-skeleton-pulse rounded bg-slate-200/60 dark:bg-slate-800/80" />
      <div className="h-64 w-full animate-skeleton-pulse rounded-2xl bg-slate-200/60 dark:bg-slate-800/80" />
    </div>
  );
}

function GenericLoading() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-500/30 border-t-teal-500" />
    </div>
  );
}

// ─── Dynamic Imports ─────────────────────────────────────────────────────────

/**
 * Lazy-loaded Markdown preview component.
 * Use for rendering markdown content with syntax highlighting.
 *
 * Usage:
 * ```tsx
 * const MarkdownPreview = createLazyComponent(
 *   () => import('./MarkdownPreview')
 * );
 * ```
 */
export const LazyMarkdownPreview = null; // Placeholder - implement when needed

/**
 * Lazy-loaded rich text editor component.
 * Use for the main content editing area.
 *
 * Usage:
 * ```tsx
 * const RichTextEditor = createLazyComponent(
 *   () => import('./RichTextEditor')
 * );
 * ```
 */
export const LazyRichTextEditor = null; // Placeholder - implement when needed

/**
 * Lazy-loaded dashboard component.
 * Heavy component with charts and data visualization.
 *
 * Usage:
 * ```tsx
 * const Dashboard = createLazyComponent(
 *   () => import('./Dashboard')
 * );
 * ```
 */
export const LazyDashboard = null; // Placeholder - implement when needed

/**
 * Lazy-loaded analytics component.
 * Heavy component with charts and metrics.
 *
 * Usage:
 * ```tsx
 * const Analytics = createLazyComponent(
 *   () => import('./Analytics')
 * );
 * ```
 */
export const LazyAnalytics = null; // Placeholder - implement when needed

/**
 * Generic lazy loader factory for any component.
 */
export function createLazyComponent<T extends React.ComponentType<unknown>>(
  importFn: () => Promise<{ default: T }>,
  options?: { ssr?: boolean }
) {
  return dynamic(importFn, {
    loading: () => <GenericLoading />,
    ssr: options?.ssr ?? false,
  });
}
