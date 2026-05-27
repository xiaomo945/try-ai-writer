import type { Metadata } from "next";
import PricingContent from "./PricingContent";

export const metadata: Metadata = {
  title: "Pricing | Use AI Writer — Affordable AI Writing Plans",
  description: "Simple, transparent pricing for the best affordable AI writing tool. Start free with 10 DeepSeek generations/day. Upgrade to Pro ($9/mo) for Claude-powered writing, or Max ($25/mo) for unlimited use. No credit card required.",
  keywords: ["AI writing tool pricing", "Claude AI pricing", "affordable AI writer", "AI writing plans"],
  openGraph: {
    title: "Pricing | Use AI Writer — Affordable AI Writing Plans",
    description: "Simple, transparent pricing for Claude-powered AI writing. Start free, Pro $9/month, Max $25/month. No hidden fees.",
    url: "https://tryaiwriter.com/pricing",
    siteName: "Use AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Use AI Writer",
    description: "Simple, transparent pricing for Claude-powered AI writing. Start free, Pro $9/month, Max $25/month.",
    images: ["/og-image.png"],
  },
};

// Product structured data for pricing page
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Use AI Writer",
  "description": "Claude-powered AI writing tool that learns your brand voice. Affordable plans starting at $0.",
  "brand": {
    "@type": "Brand",
    "name": "Use AI Writer"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "25",
    "priceCurrency": "USD",
    "offerCount": "3",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free",
        "price": "0",
        "priceCurrency": "USD",
        "description": "For casual writers: 10 generations/day, DeepSeek model"
      },
      {
        "@type": "Offer",
        "name": "Pro",
        "price": "9",
        "priceCurrency": "USD",
        "description": "For serious creators: 100 generations/day, Claude + DeepSeek"
      },
      {
        "@type": "Offer",
        "name": "Max",
        "price": "25",
        "priceCurrency": "USD",
        "description": "For power users: Unlimited generations, Claude + DeepSeek"
      }
    ]
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
