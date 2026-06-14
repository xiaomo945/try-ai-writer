import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Logo from "@/app/components/Logo";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Blog | Try AI Writer — AI Writing Tips & Tutorials",
  description: "AI writing tips, SEO guides, and marketing content strategies to help you write better, faster. From blog posts to social media, we've got you covered.",
  keywords: ["AI writing tips", "SEO writing guides", "content marketing strategies", "AI writing tutorials"],
  openGraph: {
    title: "Blog | Try AI Writer — AI Writing Tips & Tutorials",
    description: "AI writing tips, SEO guides, and marketing content strategies to help you write better, faster.",
    url: "https://tryaiwriter.com/blog",
    siteName: "Try AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Try AI Writer",
    description: "AI writing tips, SEO guides, and marketing content strategies.",
    images: ["/og-image.png"],
  },
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-obsidian-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-lg font-display font-extrabold text-white">Use AI<span className="text-blue-400">Writer</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/write" className="text-slate-300 hover:text-white transition-colors hidden sm:block">
              Write
            </Link>
            <ThemeToggle />
            <Link href="/login" className="btn-outline min-h-[40px] px-5 py-2 text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 section-container">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold mb-6">
            AI Writing Blog
          </h1>
          <p className="text-lg text-slate-400">
            Tips, tricks, and tutorials to help you write better content faster
          </p>
        </div>
      </section>

      {/* Blog Posts Placeholder */}
      <section className="section-container pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "AI Writing for Bloggers",
              description: "Learn how to use AI to write blog posts faster and better.",
              slug: "ai-writing-for-bloggers",
            },
            {
              title: "SEO Fundamentals",
              description: "Everything you need to know about writing SEO-friendly content.",
              slug: "04-seo-fundamentals",
            },
            {
              title: "AI Writing for Email Marketing",
              description: "Write better email campaigns with AI assistance.",
              slug: "ai-writing-for-email-marketing-2026",
            },
          ].map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass-card hover:scale-[1.02] transition-all duration-300"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                <p className="text-slate-400 mb-4">{post.description}</p>
                <div className="flex items-center gap-2 text-emerald-400">
                  Read Article
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-500">
            268+ articles available. Check back soon for full search and filtering!
          </p>
        </div>
      </section>
    </main>
  );
}
