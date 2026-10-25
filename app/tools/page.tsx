import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Wand2, Search, Copy, Wand, Type } from "lucide-react";

export const metadata: Metadata = {
  title: "Free AI Writing Tools - Try AI Writer",
  description:
    "Free writing tools that run in your browser: SEO checker, originality checker, prompt optimizer, and word counter. No signup, no API, no upload.",
  keywords: [
    "free writing tools",
    "seo checker free",
    "word counter",
    "prompt optimizer",
    "originality checker",
  ],
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Free AI Writing Tools - Try AI Writer",
    description:
      "Free, private writing tools: SEO checker, originality checker, prompt optimizer, word counter.",
    url: "https://tryaiwriter.com/tools",
    type: "website",
  },
};

const freeTools = [
  {
    id: "seo-analyzer",
    name: "SEO Checker",
    description:
      "Score your blog post and get a plain-English fix list: length, headings, keyword density, readability, links.",
    icon: Search,
    href: "/tools/seo-analyzer",
    badge: "Free · private",
  },
  {
    id: "originality-checker",
    name: "Originality Checker",
    description:
      "Find repeated sentences and over-used phrases in your draft. Runs locally, nothing uploaded.",
    icon: Copy,
    href: "/tools/originality-checker",
    badge: "Free · private",
  },
  {
    id: "prompt-optimizer",
    name: "Prompt Optimizer",
    description:
      "Turn a rough idea into a complete prompt with audience, tone, length, format, and purpose filled in.",
    icon: Wand,
    href: "/tools/prompt-optimizer",
    badge: "Free · private",
  },
  {
    id: "word-counter",
    name: "Word & Character Counter",
    description:
      "Count words, characters, sentences, paragraphs, and reading time. Works for English and Chinese.",
    icon: Type,
    href: "/tools/word-counter",
    badge: "Free · private",
  },
];

const aiTools = [
  {
    id: "headline-generator",
    name: "Headline Generator",
    description:
      "Generate captivating headlines that grab attention and drive clicks. Powered by AI.",
    icon: Sparkles,
    href: "/tools/headline-generator",
    available: true,
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      {/* Header */}
      <section className="pt-24 pb-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 dark:text-white mb-4">
            Free Writing <span className="text-emerald-600 dark:text-emerald-400">Tools</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Focused tools that run entirely in your browser — no signup, no API
            key, and your text never leaves your device.
          </p>
        </div>
      </section>

      {/* Free local tools */}
      <section className="pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4">
            Free · private · no signup
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {freeTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-emerald-500/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-600/10 flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {tool.name}
                        </h3>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {tool.badge}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI-powered tools */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            AI-powered (uses an API key)
          </h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {aiTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-6 transition-all duration-300 hover:border-emerald-500/40 hover:bg-slate-100 dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-emerald-500/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-600/10 flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <ArrowRight className="flex-shrink-0 w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center py-16 px-6 rounded-3xl bg-gradient-to-br from-emerald-600/5 via-teal-500/5 to-emerald-600/5 border border-emerald-500/10">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 dark:text-white mb-3">
            Ready to write with AI?
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-6">
            Get access to all tools plus our full AI writing assistant with
            brand voice learning and style matching.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/write"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5" />
              Start Writing Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 px-7 py-3.5 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}