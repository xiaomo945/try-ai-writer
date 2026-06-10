import fs from "fs";
import path from "path";

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date string
  tags: string[];
  filename: string;
}

function parseFrontmatter(content: string): {
  title: string;
  description: string;
  date: string;
  tags: string[];
} {
  const lines = content.split("\n");
  let inFrontmatter = false;
  let title = "";
  let description = "";
  let date = "";
  let tags: string[] = [];

  for (const line of lines) {
    if (line.trim() === "---") {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      } else {
        break;
      }
    }

    if (!inFrontmatter) continue;

    const titleMatch = line.match(/^title:\s*["']?(.+?)["']?\s*$/);
    if (titleMatch) {
      title = (titleMatch[1] || "").trim();
      continue;
    }

    const descMatch = line.match(/^description:\s*["']?(.+?)["']?\s*$/);
    if (descMatch) {
      description = (descMatch[1] || "").trim();
      continue;
    }

    const dateMatch = line.match(/^date:\s*["']?(.+?)["']?\s*$/);
    if (dateMatch) {
      date = (dateMatch[1] || "").trim();
      continue;
    }

    const tagsMatch = line.match(/^tags:\s*\[(.+?)\]\s*$/);
    if (tagsMatch) {
      tags = (tagsMatch[1] || "")
        .split(",")
        .map((t) => t.trim().replace(/["']/g, ""));
      continue;
    }
  }

  return { title, description, date, tags };
}

function parseDateFromFilename(filename: string, frontmatterDate: string): string {
  if (frontmatterDate) {
    const parsed = new Date(frontmatterDate);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();
  }

  // Try to extract date from filename patterns like YYYY-MM-DD-slug.md
  const dateMatch = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    return new Date(
      parseInt(dateMatch[1] || "2026"),
      parseInt(dateMatch[2] || "1") - 1,
      parseInt(dateMatch[3] || "1")
    ).toISOString();
  }

  // Fallback to file modification time
  try {
    const blogDir = path.join(process.cwd(), "data", "blog-posts");
    const stat = fs.statSync(path.join(blogDir, filename));
    return stat.mtime.toISOString();
  } catch {
    return new Date("2026-01-01").toISOString();
  }
}

// Cache to avoid re-reading 383 files on every request
let cachedPosts: BlogPostMeta[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 minute in dev, longer in production

export function getAllBlogPosts(): BlogPostMeta[] {
  const now = Date.now();
  if (cachedPosts && now - cacheTimestamp < CACHE_TTL) {
    return cachedPosts;
  }

  const blogDir = path.join(process.cwd(), "data", "blog-posts");
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
  const posts: BlogPostMeta[] = [];

  for (const file of files) {
    try {
      const filePath = path.join(blogDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const { title, description, date, tags } = parseFrontmatter(content);

      const slug = file.replace(/\.md$/, "");

      posts.push({
        slug,
        title: title || slug.replace(/-/g, " ").replace(/^\d+\s*/, ""),
        description: description || `Read ${slug.replace(/-/g, " ")} on Try AI Writer.`,
        date: parseDateFromFilename(file, date),
        tags: tags.length > 0 ? tags : [],
        filename: file,
      });
    } catch {
      // Skip files that can't be read
    }
  }

  // Sort by date descending
  posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  cachedPosts = posts;
  cacheTimestamp = now;

  return posts;
}

export function getBlogPost(slug: string): BlogPostMeta | null {
  const all = getAllBlogPosts();
  return all.find((p) => p.slug === slug) || null;
}

export function getPopularPosts(limit = 6): BlogPostMeta[] {
  const all = getAllBlogPosts();
  // Popular posts: those with the most tags (richer metadata) and recent dates
  return all
    .sort((a, b) => {
      const tagScore = b.tags.length - a.tags.length;
      if (tagScore !== 0) return tagScore;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, limit);
}

export function getAllTags(): { tag: string; count: number }[] {
  const all = getAllBlogPosts();
  const tagCount: Record<string, number> = {};

  for (const post of all) {
    for (const tag of post.tags) {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    }
  }

  return Object.entries(tagCount)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export function searchBlogPosts(
  query: string,
  tag?: string
): BlogPostMeta[] {
  const all = getAllBlogPosts();
  const q = query.toLowerCase().trim();

  return all.filter((post) => {
    if (tag && !post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      return false;
    }
    if (!q) return true;
    return (
      post.title.toLowerCase().includes(q) ||
      post.description.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}