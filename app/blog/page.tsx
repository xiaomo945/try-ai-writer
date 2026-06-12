import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import type { Metadata } from "next";
import { NavWrapper } from "@/app/components/NavWrapper";
import { BlogSidebar } from "@/app/components/BlogSidebar";
import { searchBlogPosts, getAllBlogPosts } from "@/lib/blog-index";

export const metadata: Metadata = {
  title: "Blog | Try AI Writer — AI Writing Tips & Tutorials",
  description:
    "AI writing tips, SEO guides, and marketing content strategies to help you write better, faster. 383+ articles.",
  openGraph: {
    title: "Blog | Try AI Writer — AI Writing Tips & Tutorials",
    description:
      "AI writing tips, SEO guides, and marketing content strategies to help you write better, faster.",
    url: "https://tryaiwriter.com/blog",
    siteName: "Try AI Writer",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Try AI Writer",
    description:
      "AI writing tips, SEO guides, and marketing content strategies.",
    images: ["/og-image.png"],
  },
};

export default function BlogPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const query = searchParams.q || "";
  const tag = searchParams.tag || "";
  const page = parseInt(searchParams.page || "1", 10);
  const ITEMS_PER_PAGE = 12;

  const filtered = searchBlogPosts(query, tag);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentPage = Math.max(1, Math.min(page, totalPages || 1));
  const paginatedPosts = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <NavWrapper />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold mb-6">
            AI Writing Blog
          </h1>
          <p className="text-lg text-slate-500 mb-8">
            Tips, tricks, and tutorials to help you write better content faster
            — {getAllBlogPosts().length}+ articles
          </p>

          {/* Search */}
          <form className="max-w-xl mx-auto relative" method="GET">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
            {tag && (
              <input type="hidden" name="tag" value={tag} />
            )}
            {query && (
              <Link
                href={{ pathname: "/blog", query: tag ? { tag } : undefined }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100"
              >
                <X className="w-4 h-4 text-slate-400" />
              </Link>
            )}
          </form>

          {/* Active tag filter */}
          {tag && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-sm text-slate-500">Filtered by:</span>
              <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium bg-emerald-50 text-emerald-700 rounded-full">
                {tag}
                <Link href={{ pathname: "/blog", query: query ? { q: query } : undefined }}>
                  <X className="w-3.5 h-3.5" />
                </Link>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-12">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Results count */}
              {query && (
                <p className="text-sm text-slate-500 mb-6">
                  Found {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &quot;{query}&quot;
                </p>
              )}

              {/* Posts grid */}
              {paginatedPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedPosts.map((post) => (
                    <Link
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="group bg-white rounded-2xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                            {post.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <time dateTime={post.date}>
                              {new Date(post.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </time>
                            {post.tags.length > 0 && (
                              <span className="flex items-center gap-1">
                                ·
                                {post.tags.slice(0, 2).map((t) => (
                                  <span
                                    key={t}
                                    className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="flex-shrink-0 w-5 h-5 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-lg text-slate-500 mb-4">
                    No articles found matching your search.
                  </p>
                  <Link
                    href="/blog"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear filters
                  </Link>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {currentPage > 1 && (
                    <Link
                      href={{
                        pathname: "/blog",
                        query: {
                          ...(query ? { q: query } : {}),
                          ...(tag ? { tag } : {}),
                          page: currentPage - 1,
                        },
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                    >
                      Previous
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <Link
                        key={p}
                        href={{
                          pathname: "/blog",
                          query: {
                            ...(query ? { q: query } : {}),
                            ...(tag ? { tag } : {}),
                            ...(p > 1 ? { page: p } : {}),
                          },
                        }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                          p === currentPage
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-300 text-slate-600 hover:border-emerald-400 hover:text-emerald-600"
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  )}
                  {currentPage < totalPages && (
                    <Link
                      href={{
                        pathname: "/blog",
                        query: {
                          ...(query ? { q: query } : {}),
                          ...(tag ? { tag } : {}),
                          page: currentPage + 1,
                        },
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                    >
                      Next
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <BlogSidebar />
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}