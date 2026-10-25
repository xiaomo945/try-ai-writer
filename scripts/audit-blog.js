#!/usr/bin/env node
/**
 * Blog audit for the 384 generated posts.
 *
 * Google's "scaled content abuse" policy penalizes mass-produced, templated
 * pages. This script measures the actual risk and grades every post so the
 * site can be cleaned up deliberately instead of guessed at.
 *
 * It computes, per post:
 *   - word count (thin content signal)
 *   - heading outline signature (template family detection)
 *   - opening 12-word hash (templated intro detection)
 *   - pairwise intro-shingle Jaccard similarity within a family
 *   - publish date
 *
 * Then grades each post: keep | rewrite | merge | noindex, and writes:
 *   - data/blog-audit.json   (machine-readable, used to set robots noindex)
 *   - BLOG_AUDIT_REPORT.md   (human summary)
 *
 * Usage: node scripts/audit-blog.js
 */

const fs = require("fs");
const path = require("path");

const BLOG_DIR = path.join(process.cwd(), "data", "blog-posts");
const OUT_JSON = path.join(process.cwd(), "data", "blog-audit.json");
const OUT_MD = path.join(process.cwd(), "BLOG_AUDIT_REPORT.md");

const STOPWORDS = new Set([
  "the","and","for","that","with","this","from","have","has","are","was","were",
  "you","your","our","their","they","them","but","not","can","will","would",
  "should","could","about","into","than","then","when","what","which","who",
  "how","why","all","any","more","most","other","some","such","only","own",
  "same","too","very","just","also","been","being","here","there","because",
  "over","under","again","further","once","these","those","its",
]);

function parseFrontmatter(content) {
  const lines = content.split("\n");
  let inFm = false;
  let title = "";
  let date = "";
  let tags = [];
  for (const line of lines) {
    if (line.trim() === "---") {
      if (!inFm) { inFm = true; continue; } else break;
    }
    if (!inFm) continue;
    const t = line.match(/^title:\s*["']?(.+?)["']?\s*$/);
    if (t) { title = t[1].trim(); continue; }
    const d = line.match(/^date:\s*["']?(.+?)["']?\s*$/);
    if (d) { date = d[1].trim(); continue; }
    const g = line.match(/^tags:\s*\[(.+?)\]\s*$/);
    if (g) { tags = g[1].split(",").map((x) => x.trim().replace(/["']/g, "")); continue; }
  }
  return { title, date, tags };
}

function body(content) {
  const parts = content.split("---");
  return parts.length >= 3 ? parts.slice(2).join("---") : content;
}

function stripMarkdown(text) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/^\s{0,3}\d+\.\s+/gm, "")
    .replace(/[*_]{1,3}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text) {
  const plain = stripMarkdown(text);
  const cjk = (plain.match(/[\u4e00-\u9fff]/g) || []).length;
  const latin = plain
    .replace(/[\u4e00-\u9fff]/g, " ")
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
  return cjk + latin;
}

function headings(raw) {
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    const m = /^\s{0,3}(#{2,3})\s+(.+)$/.exec(line);
    if (m) out.push(m[2].trim());
  }
  return out;
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ").trim();
}

function tokens(plain) {
  return normalize(plain).split(/\s+/).filter((w) => w && !STOPWORDS.has(w));
}

function shingles(words, n = 5) {
  const set = new Set();
  for (let i = 0; i + n <= words.length; i++) {
    set.add(words.slice(i, i + n).join(" "));
  }
  return set;
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const x of small) if (large.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

function median(arr) {
  if (arr.length === 0) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

/* -------------------------------------------------------------------------- */

function main() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.error("No blog dir at", BLOG_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  console.log(`Auditing ${files.length} posts…`);

  const posts = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const fm = parseFrontmatter(raw);
    const b = body(raw);
    const plain = stripMarkdown(b);
    const wc = wordCount(b);
    const hs = headings(b);
    const words = tokens(plain);
    const introWords = words.slice(0, 60);
    const opening = words.slice(0, 12).join(" ");

    posts.push({
      slug: file.replace(/\.md$/, ""),
      file,
      title: fm.title || file.replace(/\.md$/, "").replace(/-/g, " "),
      date: fm.date || "",
      tags: fm.tags,
      wordCount: wc,
      headingCount: hs.length,
      headingSig: normalize(hs.join(" | ")),
      opening,
      introShingles: shingles(introWords),
      maxSim: 0,
      familySize: 1,
      introFamilySize: 1,
      grade: "keep",
      reasons: [],
    });
  }

  // Template families by exact outline signature.
  const byHeading = new Map();
  const byOpening = new Map();
  for (const p of posts) {
    if (p.headingSig) {
      if (!byHeading.has(p.headingSig)) byHeading.set(p.headingSig, []);
      byHeading.get(p.headingSig).push(p);
    }
    if (p.opening) {
      if (!byOpening.has(p.opening)) byOpening.set(p.opening, []);
      byOpening.get(p.opening).push(p);
    }
  }

  // Global all-pairs intro similarity. 384 posts -> ~73k pairs, cheap enough.
  const nearPairs = [];
  for (let i = 0; i < posts.length; i++) {
    for (let j = i + 1; j < posts.length; j++) {
      const sim = jaccard(posts[i].introShingles, posts[j].introShingles);
      if (sim > posts[i].maxSim) posts[i].maxSim = sim;
      if (sim > posts[j].maxSim) posts[j].maxSim = sim;
      if (sim >= 0.5) nearPairs.push({ a: posts[i].slug, b: posts[j].slug, sim });
    }
  }
  nearPairs.sort((x, y) => y.sim - x.sim);

  for (const p of posts) {
    const of = byOpening.get(p.opening);
    if (of) p.introFamilySize = of.length;
  }

  // Grade.
  for (const p of posts) {
    const r = p.reasons;
    if (p.wordCount < 400) {
      p.grade = "noindex";
      r.push(`thin (${p.wordCount} words < 400)`);
    } else if (p.introFamilySize >= 4 && p.wordCount < 900) {
      p.grade = "noindex";
      r.push(`mass-templated: identical opening used by ${p.introFamilySize} posts`);
    } else if (p.introFamilySize >= 3) {
      p.grade = "merge";
      r.push(`templated opening shared with ${p.introFamilySize - 1} others`);
    } else if (p.maxSim >= 0.55) {
      p.grade = "rewrite";
      r.push(`near-duplicate intro (maxSim ${p.maxSim.toFixed(2)})`);
    } else if (p.wordCount >= 700 && p.maxSim < 0.4) {
      p.grade = "keep";
      r.push("distinct and substantial");
    } else if (p.wordCount < 550) {
      p.grade = "noindex";
      r.push(`thin-ish (${p.wordCount} words)`);
    } else {
      p.grade = "rewrite";
      r.push(`moderate overlap (maxSim ${p.maxSim.toFixed(2)}) or length`);
    }
  }

  // Stats.
  const wcs = posts.map((p) => p.wordCount);
  const gradeCount = posts.reduce((acc, p) => {
    acc[p.grade] = (acc[p.grade] || 0) + 1;
    return acc;
  }, {});
  const dateBuckets = {};
  for (const p of posts) {
    const d = p.date ? p.date.slice(0, 7) : "unknown";
    dateBuckets[d] = (dateBuckets[d] || 0) + 1;
  }
  const families = [...byHeading.values()]
    .filter((f) => f.length >= 2)
    .sort((a, b) => b.length - a.length);
  const introFamilies = [...byOpening.values()]
    .filter((f) => f.length >= 2)
    .sort((a, b) => b.length - a.length);
  const maxMonthEntry = Object.entries(dateBuckets).sort((a, b) => b[1] - a[1])[0];

  // Write JSON.
  const audit = {
    generatedAt: new Date().toISOString(),
    total: posts.length,
    stats: {
      wordCount: {
        min: Math.min(...wcs),
        max: Math.max(...wcs),
        median: median(wcs),
        under350: wcs.filter((w) => w < 350).length,
        under700: wcs.filter((w) => w < 700).length,
      },
      gradeCount,
      dateBuckets,
      maxMonth: maxMonthEntry
        ? { month: maxMonthEntry[0], count: maxMonthEntry[1] }
        : null,
      templateFamilies: families.length,
      largestFamily: families[0] ? families[0].length : 0,
      introFamilies: introFamilies.length,
      largestIntroFamily: introFamilies[0] ? introFamilies[0].length : 0,
      nearDupePairs: nearPairs.length,
    },
    nearDuplicatePairs: nearPairs.slice(0, 15),
    posts: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      date: p.date,
      wordCount: p.wordCount,
      headingCount: p.headingCount,
      familySize: p.familySize,
      introFamilySize: p.introFamilySize,
      maxSim: Number(p.maxSim.toFixed(3)),
      grade: p.grade,
      reasons: p.reasons,
    })),
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(audit, null, 2));

  // Write markdown report.
  const md = [];
  md.push("# Blog Audit Report");
  md.push("");
  md.push(`Generated: ${audit.generatedAt}`);
  md.push(`Posts audited: **${audit.total}**`);
  md.push("");
  md.push("## Verdict");
  md.push("");
  md.push("| Grade | Count | Meaning |");
  md.push("| --- | --- | --- |");
  md.push(`| keep | ${gradeCount.keep || 0} | Distinct + substantial — leave alone |`);
  md.push(`| rewrite | ${gradeCount.rewrite || 0} | Keep URL, rewrite content to be unique |`);
  md.push(`| merge | ${gradeCount.merge || 0} | Consolidate into a stronger pillar post |`);
  md.push(`| noindex | ${gradeCount.noindex || 0} | Thin — set robots noindex, drop from sitemap |`);
  md.push("");
  md.push("## Word count");
  md.push("");
  md.push(`- min **${audit.stats.wordCount.min}**, max **${audit.stats.wordCount.max}**, median **${audit.stats.wordCount.median}**`);
  md.push(`- under 350 words: **${audit.stats.wordCount.under350}**`);
  md.push(`- under 700 words: **${audit.stats.wordCount.under700}**`);
  md.push("");
  md.push("## Mass-publication signal (the big one)");
  md.push("");
  if (audit.stats.maxMonth) {
    md.push(
      `**${audit.stats.maxMonth.count} of ${audit.total} posts (${Math.round(
        (audit.stats.maxMonth.count / audit.total) * 100
      )}%) were published in ${audit.stats.maxMonth.month}.** Google treats a sudden bulk dump of AI-generated pages as a scaled-content-abuse signal, independent of per-post quality.`
    );
  }
  md.push("");
  md.push("## Template / duplicate families");
  md.push("");
  md.push(`- identical outline families: **${families.length}** (largest ${audit.stats.largestFamily})`);
  md.push(`- identical-opening families: **${introFamilies.length}** (largest ${audit.stats.largestIntroFamily})`);
  md.push(`- near-duplicate intro pairs (Jaccard >= 0.5): **${nearPairs.length}**`);
  md.push("");
  if (nearPairs.length > 0) {
    md.push("Top near-duplicate pairs:");
    md.push("");
    md.push("| Similarity | Post A | Post B |");
    md.push("| --- | --- | --- |");
    for (const pr of nearPairs.slice(0, 10)) {
      md.push(`| ${pr.sim.toFixed(2)} | \`${pr.a}\` | \`${pr.b}\` |`);
    }
    md.push("");
  }
  md.push("## Publish-date spread");
  md.push("");
  md.push("| Month | Posts |");
  md.push("| --- | --- |");
  for (const [k, v] of Object.entries(dateBuckets).sort()) {
    md.push(`| ${k} | ${v} |`);
  }
  md.push("");
  md.push("## Noindex candidates (first 30)");
  md.push("");
  for (const p of posts.filter((x) => x.grade === "noindex").slice(0, 30)) {
    md.push(`- \`${p.slug}\` — ${p.wordCount} words`);
  }
  md.push("");
  md.push("## Merge candidates (first 20)");
  md.push("");
  for (const p of posts.filter((x) => x.grade === "merge").slice(0, 20)) {
    md.push(`- \`${p.slug}\` — family ${p.familySize}, ${p.wordCount} words`);
  }
  md.push("");

  fs.writeFileSync(OUT_MD, md.join("\n"));

  console.log("\n=== SUMMARY ===");
  console.log("Total:", audit.total);
  console.log("Word count: min", audit.stats.wordCount.min, "max", audit.stats.wordCount.max, "median", audit.stats.wordCount.median);
  console.log("Grades:", gradeCount);
  console.log("Template families (>=2):", families.length, "largest:", audit.stats.largestFamily);
  console.log("Date buckets:", dateBuckets);
  console.log("\nWrote", OUT_JSON);
  console.log("Wrote", OUT_MD);
}

main();
