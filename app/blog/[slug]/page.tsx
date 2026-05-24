import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const filePath = path.join(process.cwd(), 'data', 'blog-posts', `${resolvedParams.slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContents);

  return {
    title: data.title,
    description: data.description,
  };
}

export async function generateStaticParams() {
  const postsDirectory = path.join(process.cwd(), 'data', 'blog-posts');
  const filenames = fs.readdirSync(postsDirectory);
  const params = filenames.map((filename) => {
    const slug = filename.replace(/\.md$/, '');
    return { slug };
  });
  return params;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const filePath = path.join(process.cwd(), 'data', 'blog-posts', `${resolvedParams.slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  const tags = (data.tags || []) as string[];

  return (
    <main className="flex flex-col items-center w-full py-20 px-4">
      <div className="max-w-4xl w-full">
        <Link href="/blog" className="text-emerald-600 font-semibold mb-4 inline-flex items-center">
          ← Back to blog
        </Link>
        <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-slate-900 dark:text-white mb-4">
          {data.title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          {data.date}
        </p>
        <div className="flex flex-wrap gap-2 mb-12">
          {tags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <article className="prose prose-lg dark:prose-invert prose-headings:text-slate-900 dark:prose-headings:text-white prose-emerald">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
