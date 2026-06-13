import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Logo from "@/app/components/Logo";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog-index";
import fs from "fs";
import path from "path";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug || "";
  const post = getBlogPost(slug);
  
  if (!post) {
    return {
      title: "Page Not Found | Try AI Writer",
      description: "The requested page could not be found.",
    };
  }
  
  const title = post.title || slug.replaceAll("-", " ");
  const description =
    post.description ||
    "AI writing tips and tutorials to help you write better content faster.";

  return {
    title: `${title} | Try AI Writer Blog`,
    description,
    openGraph: {
      title: `${title} | Try AI Writer Blog`,
      description,
      url: `https://tryaiwriter.com/blog/${slug}`,
      siteName: "Try AI Writer",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Try AI Writer Blog`,
      description,
      images: ["/og-image.png"],
    },
  };
}

function renderMarkdown(content: string): string {
  // Remove frontmatter
  const parts = content.split("---");
  const body = parts.length >= 3 ? parts.slice(2).join("---") : content;

  return body
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mt-8 mb-3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-4">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-extrabold mt-12 mb-6">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-600 hover:text-emerald-500 underline">$1</a>'
    )
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-emerald-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-8 border-slate-200" />')
    // Blockquotes
    .replace(
      /^> (.+)$/gm,
      '<blockquote class="border-l-4 border-emerald-400 pl-4 my-4 text-slate-600 italic">$1</blockquote>'
    )
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-slate-700">$1</li>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[a-z])/gm, "")
    // Wrap in paragraph
    .replace(/^(.+)$/gm, (match) => {
      if (match.startsWith("<")) return match;
      if (match.trim() === "") return "";
      return `<p class="text-slate-700 leading-relaxed mb-4">${match}</p>`;
    });
}

export default function BlogPostPage({ params }: Props) {
  const slug = params.slug || "";
  const post = getBlogPost(slug);

  // Read and render the markdown content
  let htmlContent = "";
  if (post) {
    try {
      const filePath = path.join(
        process.cwd(),
        "data",
        "blog-posts",
        post.filename
      );
      const content = fs.readFileSync(filePath, "utf-8");
      htmlContent = renderMarkdown(content);
    } catch {
      htmlContent =
        '<p class="text-slate-500 italic">Article content is being prepared. Check back soon!</p>';
    }
  }

  const title = post?.title || slug.replaceAll("-", " ");
  const date = post?.date || new Date().toISOString();
  const tags = post?.tags || [];
  const description =
    post?.description ||
    "AI writing tips and tutorials to help you write better content faster.";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="text-lg font-display font-extrabold text-white">
              Try <span className="text-emerald-400">AI</span> Writer
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/write"
              className="text-slate-300 hover:text-white transition-colors hidden sm:block"
            >
              Write
            </Link>
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-2xl border border-slate-600 hover:border-emerald-500/60 px-5 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all"
            >
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
            headline: title,
            description,
            author: {
              "@type": "Organization",
              name: "Try AI Writer",
            },
            publisher: {
              "@type": "Organization",
              name: "Try AI Writer",
              logo: {
                "@type": "ImageObject",
                url: "https://tryaiwriter.com/logo.png",
              },
            },
            datePublished: date,
            dateModified: date,
            image: "https://tryaiwriter.com/og-image.png",
            about: tags.length > 0 ? tags[0] : "AI Writing",
            keywords: tags.join(", "),
            isAccessibleForFree: true,
          }),
        }}
      />

      {/* Article */}
      <article className="pt-32 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold mb-4 leading-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <time dateTime={date} className="text-slate-400">
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-600/10 text-emerald-400 border border-emerald-600/20 hover:bg-emerald-600/20 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Article Content */}
        <div
          className="prose prose-invert prose-emerald max-w-none
            prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-5
            prose-strong:text-white prose-strong:font-semibold
            prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
            prose-code:text-emerald-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-slate-800 prose-pre:border prose-pre:border-slate-700
            prose-li:text-slate-300
            prose-blockquote:border-emerald-500 prose-blockquote:text-slate-400
          "
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* CTA */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="bg-gradient-to-br from-emerald-600/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-500/10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Ready to write like this?
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Try AI Writer free and create content in your unique brand voice
              — no credit card required.
            </p>
            <Link
              href="/write"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300"
            >
              Start Writing Free
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}