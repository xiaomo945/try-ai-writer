import type { Metadata } from "next";
import CustomerContent from "./CustomerContent";

type Props = { params: Promise<{ industry: string }> };

const META: Record<string, { title: string; description: string; name: string }> = {
  saas: { title: "SaaS 科技行业客户案例 - Try AI Writer", description: "看 280+ SaaS 公司如何用 Try AI Writer 把内容营销效率提升 5 倍。真实案例、量化成果、落地流程。", name: "SaaS 科技" },
  ecommerce: { title: "电商零售行业客户案例 - Try AI Writer", description: "看 420+ 电商商家如何用 Try AI Writer 把详情页转化率提升 27%。Amazon / Shopify / 淘宝全平台覆盖。", name: "电商零售" },
  education: { title: "教育培训行业客户案例 - Try AI Writer", description: "看 150+ 教育机构如何用 Try AI Writer 把课程内容生产提速 8 倍。课件、营销、案例全场景。", name: "教育培训" },
  finance: { title: "金融保险行业客户案例 - Try AI Writer", description: "看 80+ 金融机构如何用 Try AI Writer 把合规内容生产提速 6 倍。研报、公告、理财内容。", name: "金融保险" },
  healthcare: { title: "医疗健康行业客户案例 - Try AI Writer", description: "看 60+ 医疗机构如何用 Try AI Writer 把科普内容效率提升 4 倍。专业 + 通俗双版本。", name: "医疗健康" },
  legal: { title: "法律服务行业客户案例 - Try AI Writer", description: "看 40+ 律所如何用 Try AI Writer 把法律文书生产提速 5 倍。合同、意见书、客户函。", name: "法律服务" },
  marketing: { title: "营销代理行业客户案例 - Try AI Writer", description: "看 180+ 营销代理如何用 Try AI Writer 把客户服务效率提升 5 倍。多客户 Brand Voice 管理。", name: "营销代理" },
  "real-estate": { title: "房地产行业客户案例 - Try AI Writer", description: "看 120+ 房产中介如何用 Try AI Writer 把房源描述产出提速 10 倍。", name: "房地产" },
  travel: { title: "旅游酒店行业客户案例 - Try AI Writer", description: "看 70+ 旅游品牌如何用 Try AI Writer 把营销内容效率提升 6 倍。目的地、攻略、多语言。", name: "旅游酒店" },
  design: { title: "设计创意行业客户案例 - Try AI Writer", description: "看 90+ 设计公司如何用 Try AI Writer 把项目提案速度提升 5 倍。", name: "设计创意" },
  construction: { title: "建筑工程行业客户案例 - Try AI Writer", description: "看 50+ 建筑公司如何用 Try AI Writer 把投标文件写作提速 4 倍。", name: "建筑工程" },
  individual: { title: "个人创作者客户案例 - Try AI Writer", description: "看 12000+ 个人创作者如何用 Try AI Writer 把内容产出提速 5-10 倍,实现商业变现。", name: "个人创作者" },
};

export async function generateStaticParams() {
  return Object.keys(META).map((industry) => ({ industry }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { industry } = await params;
  const meta = META[industry];
  if (!meta) return { title: "行业未找到" };
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/customers/${industry}` },
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

export default function CustomerPage({ params }: Props) {
  return <CustomerContent params={params} />;
}
