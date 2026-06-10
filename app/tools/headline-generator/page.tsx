import type { Metadata } from "next";
import HeadlineGeneratorContent from "./HeadlineGeneratorContent";

export const metadata: Metadata = {
  title: "AI 标题生成器 - 24 套爆款公式,5 秒生成高 CTR 标题 | Try AI Writer",
  description: "免费 AI 标题生成器,内置 24 套经过验证的爆款标题公式,覆盖教程型/清单型/提问型/数字型/命令型/好奇型/反向型/证言型 8 大类。给一个主题,5 秒生成 10+ 高点击率标题,平均 CTR 提升 45%。",
  alternates: { canonical: "/tools/headline-generator" },
  openGraph: {
    title: "AI 标题生成器 - 24 套爆款公式",
    description: "免费 AI 标题生成器,5 秒生成高 CTR 标题",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 标题生成器 - 24 套爆款公式",
    description: "免费 AI 标题生成器,5 秒生成高 CTR 标题",
  },
};

export default function HeadlineGeneratorPage() {
  return <HeadlineGeneratorContent />;
}
