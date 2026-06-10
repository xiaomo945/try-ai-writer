import type { Metadata } from "next";
import PricingContent from "./PricingContent";

export const metadata: Metadata = {
  title: "Pricing | Try AI Writer — Affordable Plans for Every Creator",
  description: "Choose the plan that fits your needs. Free plan with 10 generations per day. Pro plan at $9/month with Claude-powered writing. Start free — no credit card required.",
  keywords: ["AI writing tool pricing", "Claude AI pricing", "affordable AI writer", "AI writing plans", "Try AI Writer pricing"],
  openGraph: {
    title: "Pricing | Try AI Writer — Affordable Plans for Every Creator",
    description: "Choose the plan that fits your needs. Free plan with 10 generations per day. Pro plan at $9/month with Claude-powered writing. Start free — no credit card required.",
    url: "https://tryaiwriter.com/pricing",
    siteName: "Try AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Try AI Writer — Affordable Plans for Every Creator",
    description: "Choose the plan that fits your needs. Free plan with 10 generations per day. Pro plan at $9/month with Claude-powered writing. Start free — no credit card required.",
    images: ["/og-image.png"],
  },
};

// Product structured data for pricing page
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Try AI Writer",
  "description": "Claude-powered AI writing tool that learns your brand voice. Affordable plans starting at $0.",
  "brand": {
    "@type": "Brand",
    "name": "Try AI Writer"
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
