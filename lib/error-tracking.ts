import { init } from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "";

if (SENTRY_DSN) {
  init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Ignore common non-actionable errors
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "Network request failed",
      /^Loading chunk .+ failed$/,
    ],
  });
}

// Fallback logging utility for when Sentry is not configured
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (SENTRY_DSN) {
    const { captureException } = require("@sentry/nextjs");
    captureException(error, { extra: context });
  }
  console.error("[Error]", error.message, context || "");
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  if (SENTRY_DSN) {
    const { captureMessage: sentryCapture } = require("@sentry/nextjs");
    sentryCapture(message, level);
  }
  console.log(`[${level.toUpperCase()}]`, message);
}