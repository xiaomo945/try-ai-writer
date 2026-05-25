import type { Metadata } from "next";
import PricingContentZh from "./PricingContent";

export const metadata: Metadata = {
  title: "定价 | Use AI Writer",
  description: "简单透明的定价。免费版每天 10 次 Claude + 10 次 DeepSeek 生成。专业版 $9/月，旗舰版 $25/月。无需信用卡。",
  openGraph: {
    title: "定价 | Use AI Writer",
    description: "免费版每天 10 次生成。专业版 $9/月，旗舰版 $25/月。",
    url: "https://tryaiwriter.com/pricing/zh",
    siteName: "Use AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "定价 | Use AI Writer",
    description: "免费版每天 10 次生成。专业版 $9/月，旗舰版 $25/月。",
    images: ["/og-image.png"],
  },
};

export default function PricingPageZh() {
  return <PricingContentZh />;
}