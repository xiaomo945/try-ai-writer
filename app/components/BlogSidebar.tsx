import Link from "next/link";
import { PenTool } from "lucide-react";
import { getPopularPosts, getAllTags } from "@/lib/blog-index";

export function BlogSidebar() {
  const popularPosts = getPopularPosts(6);
  const categories = getAllTags().slice(0, 10);

  return (
    <div className="space-y-12">
      {/* Start Writing CTA */}
      <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
        <div className="flex items-center gap-2 mb-4">
          <PenTool className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold text-emerald-800">Ready to write?</span>
        </div>
        <p className="text-sm text-emerald-700 mb-4">
          Try AI Writer free and create content in your unique brand voice.
        </p>
        <Link
          href="/write"
          className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          Start Writing Free
        </Link>
      </div>

      {/* Popular Articles */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-emerald-600 rounded-full"></span>
          Popular Articles
        </h3>
        <ul className="space-y-3">
          {popularPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm text-slate-600 hover:text-emerald-600 transition-colors line-clamp-2"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-1 h-5 bg-emerald-600 rounded-full"></span>
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-full transition-colors"
            >
              {tag}
              <span className="ml-1 text-slate-400">({count})</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}