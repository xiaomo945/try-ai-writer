import type { Metadata } from "next";
import ComparisonContent from "./ComparisonContent";

type Props = { params: Promise<{ category: string }> };

const META: Record<string, { title: string; description: string; competitor: string }> = {
  jasper: { title: "Try AI Writer vs Jasper AI - 9 维度全面对比 | Try AI Writer", description: "Try AI Writer 与 Jasper AI 在价格、中文质量、模板、易用性、SEO 集成等 9 大维度的深度对比,帮你做出最佳选择。", competitor: "Jasper AI" },
  "copy-ai": { title: "Try AI Writer vs Copy.ai - AI 文案工具对比 | Try AI Writer", description: "Try AI Writer 与 Copy.ai 在营销文案、中文、价格、工作流、场景覆盖等维度的对比。", competitor: "Copy.ai" },
  writesonic: { title: "Try AI Writer vs Writesonic - AI SEO 写作对比 | Try AI Writer", description: "Try AI Writer 与 Writesonic 在 SEO 长文、中文、价格、模板、生成质量上的对比。", competitor: "Writesonic" },
  rytr: { title: "Try AI Writer vs Rytr - 平价 AI 写作工具对比 | Try AI Writer", description: "Try AI Writer 与 Rytr 在工具丰富度、中文质量、价格、上手难度等维度的对比。", competitor: "Rytr" },
  sudowrite: { title: "Try AI Writer vs Sudowrite - 通用写作 vs 创意写作 | Try AI Writer", description: "Try AI Writer 与 Sudowrite 在通用写作 vs 创意写作场景的对比分析。", competitor: "Sudowrite" },
  "notion-ai": { title: "Try AI Writer vs Notion AI - 专业写作 vs 文档助手 | Try AI Writer", description: "Try AI Writer 与 Notion AI 在工具丰富度、中文质量、模板、集成性等维度的对比。", competitor: "Notion AI" },
  chatgpt: { title: "Try AI Writer vs ChatGPT - 通用聊天 vs 专业写作 | Try AI Writer", description: "Try AI Writer 与 ChatGPT 在写作专业度、中文质量、模板、上手速度等维度的对比。", competitor: "ChatGPT" },
  claude: { title: "Try AI Writer vs Claude - 通用大模型 vs 专业写作应用 | Try AI Writer", description: "Try AI Writer 与 Claude 在写作专业度、长上下文、中文质量、模板等维度的对比。", competitor: "Claude" },
  grammarly: { title: "Try AI Writer vs Grammarly - 写作 vs 润色 | Try AI Writer", description: "Try AI Writer 与 Grammarly 在中英文润色、创作能力、价格等维度的对比。", competitor: "Grammarly" },
  quillbot: { title: "Try AI Writer vs QuillBot - 综合写作 vs 改写润色 | Try AI Writer", description: "Try AI Writer 与 QuillBot 在英文改写、中文改写、创作能力、摘要等维度的对比。", competitor: "QuillBot" },
};

export async function generateStaticParams() {
  return Object.keys(META).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const meta = META[category];
  if (!meta) return { title: "对比未找到" };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/blog/comparison/${category}` },
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

export default function ComparisonPage({ params }: Props) {
  return <ComparisonContent params={params} />;
}
