import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Writing Tools - Try AI Writer",
  description:
    "Free AI-powered writing tools including headline generator, blog outline creator, email writer, and more. Boost your writing productivity.",
};

const tools = [
  {
    id: "headline-generator",
    name: "Headline Generator",
    description:
      "Generate captivating headlines that grab attention and drive clicks. Powered by AI.",
    icon: Sparkles,
    href: "/tools/headline-generator",
    available: true,
  },
  {
    id: "blog-outline",
    name: "Blog Outline Creator",
    description:
      "Create structured blog outlines with H2/H3 headings in seconds.",
    icon: Wand2,
    href: "/tools/blog-outline",
    available: false,
  },
  {
    id: "email-writer",
    name: "AI Email Writer",
    description:
      "Write professional emails, cold outreach, and newsletters effortlessly.",
    icon: Wand2,
    href: "/tools/email-writer",
    available: false,
  },
  {
    id: "social-captions",
    name: "Social Media Captions",
    description:
      "Generate platform-optimized captions for Instagram, Twitter, LinkedIn.",
    icon: Sparkles,
    href: "/tools/social-captions",
    available: false,
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-4">
            AI Writing <span className="text-emerald-400">Tools</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Free, focused tools to supercharge specific parts of your writing
            workflow. All powered by the same AI that drives our full editor.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.available ? tool.href : "#"}
                className={`group relative rounded-2xl border p-6 transition-all duration-300 ${
                  tool.available
                    ? "border-slate-800 bg-slate-900/50 hover:border-emerald-500/40 hover:bg-slate-900 hover:shadow-xl hover:shadow-emerald-500/5"
                    : "border-slate-800/50 bg-slate-900/30 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-emerald-600/10 flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {tool.name}
                      </h3>
                      {!tool.available && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  {tool.available && (
                    <ArrowRight className="flex-shrink-0 w-5 h-5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center py-16 px-6 rounded-3xl bg-gradient-to-br from-emerald-600/5 via-teal-500/5 to-emerald-600/5 border border-emerald-500/10">
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white mb-3">
            Ready to write with AI?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-6">
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
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 hover:border-emerald-500/60 px-7 py-3.5 text-base font-medium text-slate-200 hover:bg-slate-800/50 transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}