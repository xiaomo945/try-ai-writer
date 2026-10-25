import type { Metadata } from "next";
import { ToolPageLayout, type ToolFaq } from "@/components/ToolPageLayout";
import { SeoAnalyzerTool } from "@/components/tools/SeoAnalyzerTool";

export const metadata: Metadata = {
  title: "Free SEO Checker for Blog Posts – Score & Fix Your Article",
  description:
    "A free, private SEO checker that scores your blog post or article and tells you exactly what to fix: word count, headings, keyword density, readability, and links. Runs in your browser, no signup.",
  keywords: [
    "free seo checker",
    "blog seo analyzer",
    "check seo score",
    "article seo tool",
    "seo score checker free",
  ],
  alternates: { canonical: "/tools/seo-analyzer" },
  openGraph: {
    title: "Free SEO Checker for Blog Posts",
    description:
      "Score your article and get actionable fixes. Free, private, no signup.",
    url: "https://tryaiwriter.com/tools/seo-analyzer",
    type: "website",
  },
};

const faqs: ToolFaq[] = [
  {
    question: "Is this SEO checker really free?",
    answer:
      "Yes. It runs entirely in your browser using a local analysis engine, so there is no account, no API key, and no usage limit. Paste as many drafts as you like.",
  },
  {
    question: "Does it send my text to a server?",
    answer:
      "No. Your text never leaves your device. The word count, keyword density, heading check, and readability scoring all happen locally in JavaScript, which also means results are instant.",
  },
  {
    question: "What does the SEO score measure?",
    answer:
      "It combines practical on-page signals: content length, title length, use of H2/H3 headings, lists, internal/external links, keyword density (to catch stuffing), and a readability estimate. It is a writing-quality checklist, not a ranking guarantee.",
  },
  {
    question: "Why is my keyword density flagged as too high?",
    answer:
      "Search engines penalize obvious keyword stuffing. If one term makes up more than about 4% of your words, the tool suggests rephrasing so the writing reads naturally.",
  },
];

export default function SeoAnalyzerPage() {
  return (
    <ToolPageLayout
      title="Free SEO Checker for Blog Posts"
      intro="Paste a draft and get an instant SEO score plus a plain-English list of what to fix — length, headings, keyword density, readability, and links. Everything runs locally in your browser."
      faqs={faqs}
    >
      <SeoAnalyzerTool />
    </ToolPageLayout>
  );
}
