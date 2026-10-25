/**
 * Reads the blog audit produced by `scripts/audit-blog.js`
 * (`data/blog-audit.json`) and exposes the per-post grade.
 *
 * The site uses this to set `robots: noindex` on thin / duplicate posts and to
 * keep them out of the sitemap, which reduces the scaled-content-abuse
 * footprint. If the audit file is missing, every post stays indexable — the
 * safe default.
 */

import fs from "fs";
import path from "path";

export type BlogGrade = "keep" | "rewrite" | "merge" | "noindex";

interface AuditPost {
  slug: string;
  grade: BlogGrade;
  wordCount: number;
  maxSim: number;
}

interface AuditFile {
  generatedAt?: string;
  total?: number;
  posts?: AuditPost[];
}

const AUDIT_PATH = path.join(process.cwd(), "data", "blog-audit.json");

let cache: Map<string, AuditPost> | null = null;
let cacheTs = 0;
const CACHE_TTL = 60 * 1000;

function load(): Map<string, AuditPost> {
  const now = Date.now();
  if (cache && now - cacheTs < CACHE_TTL) return cache;

  const map = new Map<string, AuditPost>();
  try {
    const raw = fs.readFileSync(AUDIT_PATH, "utf-8");
    const data = JSON.parse(raw) as AuditFile;
    for (const post of data.posts ?? []) {
      if (post && typeof post.slug === "string" && post.grade) {
        map.set(post.slug, post);
      }
    }
  } catch {
    // No audit file yet -> everything indexable.
  }

  cache = map;
  cacheTs = now;
  return map;
}

export function getAuditGrade(slug: string): BlogGrade | null {
  return load().get(slug)?.grade ?? null;
}

export function isNoIndexed(slug: string): boolean {
  return getAuditGrade(slug) === "noindex";
}

export function getNoIndexedSlugs(): Set<string> {
  const set = new Set<string>();
  for (const [slug, post] of load()) {
    if (post.grade === "noindex") set.add(slug);
  }
  return set;
}

export function getAuditSummary(): {
  total: number;
  noindex: number;
  hasAudit: boolean;
} {
  const map = load();
  let noindex = 0;
  for (const post of map.values()) if (post.grade === "noindex") noindex++;
  return { total: map.size, noindex, hasAudit: map.size > 0 };
}
