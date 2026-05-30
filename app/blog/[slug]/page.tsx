import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Logo from "@/app/components/Logo";
import { ThemeToggle } from "@/app/components/ThemeToggle";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${params.slug.replaceAll("-", " ")} | Try AI Writer Blog`,
    description: "AI writing tips and tutorials to help you write better content faster.",
    openGraph: {
      title: `${params.slug.replaceAll("-", " ")} | Try AI Writer Blog`,
      description: "AI writing tips and tutorials.",
      url: `https://tryaiwriter.com/blog/${params.slug}`,
      siteName: "Try AI Writer",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${params.slug.replaceAll("-", " ")} | Try AI Writer`,
      description: "AI writing tips and tutorials.",
      images: ["/og-image.png"],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
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

      {/* JSON-LD Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": params.slug.replaceAll("-", " "),
            "description": "AI writing tips and tutorials to help you write better content faster.",
            "author": {
              "@type": "Organization",
              "name": "Try AI Writer"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Try AI Writer",
              "logo": {
                "@type": "ImageObject",
                "url": "https://tryaiwriter.com/logo.png"
              }
            },
            "datePublished": "2026-05-30",
            "dateModified": "2026-05-30",
            "image": "https://tryaiwriter.com/og-image.png",
            "about": {
              "@type": "Thing",
              "name": "AI Writing"
            },
            "mentions": [
              { "@type": "Thing", "name": "AI Writing Tools" },
              { "@type": "Thing", "name": "Content Creation" },
              { "@type": "Thing", "name": "Brand Voice" }
            ],
            "isAccessibleForFree": true
          })
        }}
      />

      {/* Article */}
      <article className="pt-32 pb-20 px-4 sm:px-6 section-container max-w-4xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold mb-4">
            {params.slug.replaceAll("-", " ")}
          </h1>
          <p className="text-slate-400 text-lg">
            Published on May 28, 2026
          </p>
        </div>

        {/* Article Content Placeholder */}
        <div className="prose prose-invert prose-lg">
          <p className="text-slate-300">
            Full article coming soon!
          </p>
          <p className="text-slate-400">
            In the meantime, you can:
          </p>
          <ul>
            <li>Try our AI writing tool for free</li>
            <li>Browse other articles on our blog</li>
            <li>Check out our pricing plans</li>
          </ul>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link
            href="/write"
            className="btn-primary inline-flex items-center gap-2"
          >
            Try AI Writing Now
          </Link>
        </div>
      </article>
    </main>
  );
}
