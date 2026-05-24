import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

export const metadata = {
  title: 'Use AI Writer Blog — AI Writing Tips & Guides',
  description: 'Discover the best AI writing tips, guides, and tools on the Use AI Writer blog. Learn how to write better, faster, and cheaper with AI.',
};

type BlogPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
};

const getBlogPosts = (): BlogPost[] => {
  const postsDirectory = path.join(process.cwd(), 'data', 'blog-posts');
  const filenames = fs.readdirSync(postsDirectory);

  return filenames.map((filename) => {
    const slug = filename.replace(/\.md$/, '');
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      tags: (data.tags || []) as string[],
      description: (data.description || '') as string,
    };
  });
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <main className="flex flex-col items-center w-full py-20 px-4">
      <div className="max-w-5xl w-full">
        <h1 className="text-5xl lg:text-6xl font-display font-extrabold text-slate-900 dark:text-white mb-4 text-center">
          Use AI Writer Blog
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          AI writing tips, guides, and insights to help you write better, faster, and cheaper.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="card flex flex-col hover:shadow-xl transition-all duration-300"
            >
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  {post.date}
                </p>
                <p className="text-slate-600 dark:text-slate-300 mb-4 line-clamp-3">
                  {post.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-emerald-600 font-semibold text-sm">
                Read more →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
