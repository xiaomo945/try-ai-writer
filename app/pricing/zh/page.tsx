import type { Metadata } from "next";
import PricingContentZh from "./PricingContent";

export const metadata: Metadata = {
  title: "免费 AI 写作工具 | Try AI Writer — 无需订阅，自带 API Key",
  description: "Try AI Writer 完全免费。使用你自己的 DeepSeek 或 Claude API Key 即可无限次 AI 生成，或使用免费离线写作工具。无需信用卡、无需订阅，由广告支持。",
  alternates: {
    languages: {
      "en": "/pricing",
    },
  },
  openGraph: {
    title: "免费 AI 写作工具 | Try AI Writer — 无需订阅，自带 API Key",
    description: "完全免费。用自己的 API Key 跑 AI 写作，或使用免费离线工具。无信用卡、无订阅。",
    url: "https://tryaiwriter.com/pricing/zh",
    siteName: "Try AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "免费 AI 写作工具 | Try AI Writer — 无需订阅，自带 API Key",
    description: "完全免费。用自己的 API Key 跑 AI 写作，或使用免费离线工具。无信用卡、无订阅。",
    images: ["/og-image.png"],
  },
};

export default function PricingPageZh() {
  return <PricingContentZh />;
}