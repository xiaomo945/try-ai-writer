import type { Metadata } from "next";
import ChangelogContent from "./ChangelogContent";

type Props = { params: Promise<{ version: string }> };

const META: Record<string, { title: string; description: string; codename: string }> = {
  "3-2": { title: "v3.2.0 Phoenix 更新日志 - Try AI Writer", description: "Try AI Writer v3.2.0 Phoenix 核心更新:AI 翻译工具、标题生成器 2.0、客户案例、竞品对比、学院路径。", codename: "Phoenix" },
  "3-1": { title: "v3.1.0 Aurora 更新日志 - Try AI Writer", description: "Try AI Writer v3.1.0 Aurora 核心更新:Google 自动收录、Brand Voice 2.0、实时协作、行业模板。", codename: "Aurora" },
  "3-0": { title: "v3.0.0 Genesis 更新日志 - Try AI Writer", description: "Try AI Writer v3.0.0 Genesis 重大升级:全新 Dashboard、Paddle 支付、Affiliate、团队工作空间。", codename: "Genesis" },
  "2-5": { title: "v2.5.0 Mirage 更新日志 - Try AI Writer", description: "Try AI Writer v2.5.0 Mirage 升级:Claude 3.5 Sonnet 集成、SEO 助手、30+ 新工具。", codename: "Mirage" },
  "2-0": { title: "v2.0.0 Horizon 更新日志 - Try AI Writer", description: "Try AI Writer v2.0.0 Horizon 全新架构:Next.js 16 + React 19、50+ 写作场景模板。", codename: "Horizon" },
  "1-5": { title: "v1.5.0 Compass 更新日志 - Try AI Writer", description: "Try AI Writer v1.5.0 Compass:Brand Voice 数字孪生、写作风格学习、文件导入。", codename: "Compass" },
  "1-0": { title: "v1.0.0 Aurora 更新日志 - Try AI Writer", description: "Try AI Writer v1.0.0 正式版:30+ 基础写作工具,中英双语,用户系统,免费版。", codename: "Aurora" },
  "0-1": { title: "v0.1.0 Genesis Beta 内测日志 - Try AI Writer", description: "Try AI Writer v0.1.0 Genesis Beta 内测首发,10 个核心工具,1000 名种子用户。", codename: "Genesis" },
};

export async function generateStaticParams() {
  return Object.keys(META).map((version) => ({ version }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { version } = await params;
  const meta = META[version];
  if (!meta) return { title: "版本未找到" };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/changelog/${version}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "article",
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
  };
}

export default function ChangelogPage({ params }: Props) {
  return <ChangelogContent params={params} />;
}
