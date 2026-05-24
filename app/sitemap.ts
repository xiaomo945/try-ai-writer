import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tryaiwriter.com';
  const now = new Date();
  
  const postsDirectory = path.join(process.cwd(), 'data', 'blog-posts');
  const filenames = fs.readdirSync(postsDirectory);
  const blogPosts = filenames.map((filename) => {
    const slug = filename.replace(/\.md$/, '');
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);

    return {
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(data.date),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    };
  });

  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${baseUrl}/write`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 },
    ...blogPosts,
  ];
}
