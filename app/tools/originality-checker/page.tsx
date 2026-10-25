import type { Metadata } from "next";
import { ToolPageLayout, type ToolFaq } from "@/components/ToolPageLayout";
import { OriginalityCheckerTool } from "@/components/tools/OriginalityCheckerTool";

export const metadata: Metadata = {
  title: "Free Originality Checker – Find Repeated Sentences & Phrases",
  description:
    "A free originality checker that detects repeated sentences, over-used phrases, and self-similarity in your text. Runs locally in your browser, no upload, no signup.",
  keywords: [
    "free originality checker",
    "check text for duplicate sentences",
    "content repetition checker",
    "self plagiarism checker",
    "repeated phrase detector",
  ],
  alternates: { canonical: "/tools/originality-checker" },
  openGraph: {
    title: "Free Originality Checker",
    description:
      "Find repeated sentences and over-used phrases in your writing. Free, private, no signup.",
    url: "https://tryaiwriter.com/tools/originality-checker",
    type: "website",
  },
};

const faqs: ToolFaq[] = [
  {
    question: "Is this the same as a plagiarism checker?",
    answer:
      "No. This tool detects repetition and self-similarity inside the text you paste — duplicate sentences and over-used phrases. It does not compare your text against the web, so it is not a substitute for a full plagiarism service.",
  },
  {
    question: "Does my text leave my device?",
    answer:
      "No. The analysis runs entirely in your browser. Nothing is uploaded, which keeps your drafts private and the check instant.",
  },
  {
    question: "What is the self-similarity score?",
    answer:
      "It estimates how much of your text reuses the same 5-word phrases. A high score means you are repeating wording; rewriting those passages makes the prose feel more original.",
  },
  {
    question: "How do I fix a low originality score?",
    answer:
      "Start with the repeated sentences and over-used phrases the tool lists. Rephrase each once, vary your sentence openers, and avoid pasting the same boilerplate paragraph in multiple sections.",
  },
];

export default function OriginalityCheckerPage() {
  return (
    <ToolPageLayout
      title="Free Originality Checker"
      intro="Spot repeated sentences and over-used phrases before you publish. This private, browser-based checker measures self-similarity and helps you tighten repetitive writing."
      faqs={faqs}
    >
      <OriginalityCheckerTool />
    </ToolPageLayout>
  );
}
