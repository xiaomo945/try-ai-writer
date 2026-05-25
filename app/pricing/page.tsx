import type { Metadata } from "next";
import PricingContent from "./PricingContent";

export const metadata: Metadata = {
  title: "Pricing | Use AI Writer",
  description: "Simple, transparent pricing. Start free with 10 Claude + 10 DeepSeek generations per day. Upgrade to Pro for $9/month or Max for $25/month. No credit card required.",
  openGraph: {
    title: "Pricing | Use AI Writer",
    description: "Start free with 10 generations per day. Pro $9/month, Max $25/month.",
    url: "https://tryaiwriter.com/pricing",
    siteName: "Use AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Use AI Writer",
    description: "Start free with 10 generations per day. Pro $9/month, Max $25/month.",
    images: ["/og-image.png"],
  },
};

export default function PricingPage() {
  return <PricingContent />;
}
