import type { Metadata } from "next";
import PricingContent from "./PricingContent";

export const metadata: Metadata = {
  title: "Free AI Writer — No Subscription, Bring Your Own Key",
  description: "Try AI Writer is 100% free. Use it with your own DeepSeek or Claude API key for unlimited AI generations, or use our free offline writing tools. No credit card, no subscription — supported by ads.",
  keywords: ["free AI writer", "bring your own key AI", "BYOK AI writing", "no subscription AI tool", "free writing tools", "Try AI Writer free"],
  openGraph: {
    title: "Free AI Writer — No Subscription, Bring Your Own Key",
    description: "100% free. Run AI writing on your own API key, or use free offline tools. No credit card, no subscription.",
    url: "https://tryaiwriter.com/pricing",
    siteName: "Try AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Writer — No Subscription, Bring Your Own Key",
    description: "100% free. Run AI writing on your own API key, or use free offline tools. No credit card, no subscription.",
    images: ["/og-image.png"],
  },
  alternates: {
    languages: {
      "zh-CN": "/pricing/zh",
    },
  },
};

// Product structured data — single free offer (BYOK). No paid tiers exist.
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Try AI Writer",
  "description": "100% free AI writing tool. Bring your own DeepSeek/Claude API key for unlimited generations, or use free offline writing tools. Ad-supported, no subscription.",
  "brand": {
    "@type": "Brand",
    "name": "Try AI Writer"
  },
  "offers": {
    "@type": "Offer",
    "name": "Free — Bring Your Own Key",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "description": "Free forever. AI generations run on your own DeepSeek/Claude API key; offline writing tools need no key at all."
  }
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <PricingContent />
    </>
  );
}
