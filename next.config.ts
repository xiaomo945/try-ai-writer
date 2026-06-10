import { withSentryConfig } from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || "";

/** @type {import('next').NextConfig} */
const baseConfig = {
  images: {
    remotePatterns: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

// Only wrap with Sentry if DSN is configured
const nextConfig = SENTRY_DSN
  ? withSentryConfig(baseConfig, {
      org: process.env.SENTRY_ORG || "",
      project: process.env.SENTRY_PROJECT || "",
      silent: !process.env.CI,
      widenClientFileUpload: true,
    })
  : baseConfig;

export default nextConfig;