import type { Metadata } from "next";
import { ToolPageLayout, type ToolFaq } from "@/components/ToolPageLayout";
import { WordCounterTool } from "@/components/tools/WordCounterTool";

export const metadata: Metadata = {
  title: "Free Word Counter & Character Counter – Online, Private, Instant",
  description:
    "A free word counter and character counter that also shows sentences, paragraphs, and reading time. Works for English and Chinese, runs in your browser, no signup.",
  keywords: [
    "free word counter",
    "character counter online",
    "word count tool",
    "count words and characters",
    "online word counter",
  ],
  alternates: { canonical: "/tools/word-counter" },
  openGraph: {
    title: "Free Word Counter & Character Counter",
    description:
      "Count words, characters, sentences, and reading time instantly. Free and private.",
    url: "https://tryaiwriter.com/tools/word-counter",
    type: "website",
  },
};

const faqs: ToolFaq[] = [
  {
    question: "Is this word counter free and private?",
    answer:
      "Yes. It is completely free, requires no signup, and counts everything in your browser. Your text is never uploaded.",
  },
  {
    question: "Does it count Chinese characters as words?",
    answer:
      "Yes. Each Chinese character is counted as one word, and Latin words are counted normally, so mixed Chinese-English text is handled correctly.",
  },
  {
    question: "How is reading time calculated?",
    answer:
      "For Latin text it assumes about 200 words per minute; for Chinese it assumes about 300 characters per minute. The estimate is a quick guide, not exact.",
  },
  {
    question: "Is there a character limit?",
    answer:
      "No practical limit. Because counting happens locally, you can paste very long documents without hitting a server quota.",
  },
];

export default function WordCounterPage() {
  return (
    <ToolPageLayout
      title="Free Word Counter & Character Counter"
      intro="Count words, characters, sentences, paragraphs, and reading time as you type. Handles English and Chinese, runs instantly in your browser, and never uploads your text."
      faqs={faqs}
    >
      <WordCounterTool />
    </ToolPageLayout>
  );
}
