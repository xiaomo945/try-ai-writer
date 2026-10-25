import type { Metadata } from "next";
import { ToolPageLayout, type ToolFaq } from "@/components/ToolPageLayout";
import { PromptOptimizerTool } from "@/components/tools/PromptOptimizerTool";

export const metadata: Metadata = {
  title: "Free AI Prompt Optimizer – Turn Rough Ideas into Strong Prompts",
  description:
    "A free prompt optimizer that scores your AI writing prompt and fills in the missing pieces — audience, tone, length, format, and purpose. Works for blog posts, emails, social posts, and fiction. No signup.",
  keywords: [
    "free ai prompt optimizer",
    "improve my ai prompt",
    "prompt generator for writing",
    "better chatgpt prompts",
    "prompt builder free",
  ],
  alternates: { canonical: "/tools/prompt-optimizer" },
  openGraph: {
    title: "Free AI Prompt Optimizer",
    description:
      "Turn a rough idea into a strong, detailed prompt. Free and private.",
    url: "https://tryaiwriter.com/tools/prompt-optimizer",
    type: "website",
  },
};

const faqs: ToolFaq[] = [
  {
    question: "How does the prompt optimizer work?",
    answer:
      "It checks your prompt against the dimensions that make AI output useful — topic, audience, tone, length, format, and purpose (plus genre, viewpoint, and conflict for fiction). It reports what is missing and builds a stronger prompt from safe defaults.",
  },
  {
    question: "Does it invent facts about my brand?",
    answer:
      "No. The optimizer only adds structural defaults (length, format) or details you explicitly provide. It will not fabricate an audience or tone you never specified — instead it flags the gap so you can fill it.",
  },
  {
    question: "Is my prompt sent anywhere?",
    answer:
      "No. Everything runs in your browser. Your prompt is analyzed locally and never uploaded.",
  },
  {
    question: "Can I use the optimized prompt in ChatGPT or Claude?",
    answer:
      "Yes. Copy the optimized prompt and paste it into any AI assistant. The result is plain text with clear sections, so it works across models.",
  },
];

export default function PromptOptimizerPage() {
  return (
    <ToolPageLayout
      title="Free AI Prompt Optimizer"
      intro="Paste a rough idea and get a complete, well-structured prompt back — with audience, tone, length, format, and purpose filled in. Built for blog posts, emails, social posts, and fiction."
      faqs={faqs}
    >
      <PromptOptimizerTool />
    </ToolPageLayout>
  );
}
