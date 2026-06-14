"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

/**
 * Lazy load wrapper for large components
 * Uses next/dynamic for code splitting and reduces initial bundle size
 */

// Lazy load heavy analytics components
export const LazyPaymentConversionAnalytics = dynamic(
  () => import("@/app/components/PaymentConversionAnalytics"),
  {
    loading: () => <AnalyticsSkeleton />,
    ssr: false,
  }
);

export const LazyUserActivityTracker = dynamic(
  () =>
    import("@/app/components/UserActivityTracker").then(
      (mod) => mod.UserActivityTracker
    ),
  {
    loading: () => <AnalyticsSkeleton />,
    ssr: false,
  }
);

export const LazyRetentionAnalysis = dynamic(
  () =>
    import("@/app/components/RetentionAnalysis").then(
      (mod) => mod.RetentionAnalysis
    ),
  {
    loading: () => <AnalyticsSkeleton />,
    ssr: false,
  }
);

export const LazyReturnReminder = dynamic(
  () =>
    import("@/app/components/ReturnReminder").then(
      (mod) => mod.ReturnReminder
    ),
  {
    loading: () => <AnalyticsSkeleton />,
    ssr: false,
  }
);

// Lazy load heavy UI components
export const LazyPersonalizedRecommendations = dynamic(
  () =>
    import("@/app/components/PersonalizedRecommendations").then(
      (mod) => mod.PersonalizedRecommendations
    ),
  {
    loading: () => <RecommendationsSkeleton />,
    ssr: false,
  }
);

export const LazyABTestDashboard = dynamic(
  () =>
    import("@/app/components/ABTestDashboard").then(
      (mod) => mod.ABTestDashboard
    ),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

export const LazyConversionFunnel = dynamic(
  () =>
    import("@/app/components/ConversionFunnel").then(
      (mod) => mod.ConversionFunnel
    ),
  {
    loading: () => <FunnelSkeleton />,
    ssr: false,
  }
);

// Lazy load editor components
export const LazyRichTextEditor = dynamic(
  () =>
    import("@/app/components/RichTextEditor").then(
      (mod) => mod.RichTextEditor
    ),
  {
    loading: () => <EditorSkeleton />,
    ssr: false,
  }
);

// Skeleton components for loading states
function AnalyticsSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
      </div>
    </div>
  );
}

function RecommendationsSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        ))}
      </div>
    </div>
  );
}

function FunnelSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
        ))}
      </div>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
      </div>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
      <div className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
    </div>
  );
}

// Helper function to wrap components with Suspense
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode = <AnalyticsSkeleton />
) {
  return function LazyComponent(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}
