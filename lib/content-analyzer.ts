/**
 * Local content analysis: SEO health check + originality / repetition signals.
 *
 * IMPORTANT — what this is and is NOT:
 * - Everything here runs **locally on the text**, no network calls.
 * - The "originality" checks detect **internal repetition and keyword
 *   stuffing**. They do NOT compare against the web, so this is NOT a
 *   plagiarism / copyright scanner. A true plagiarism check requires an
 *   external service (e.g. Copyscape) and is not wired up.
 *
 * Supports mixed English / Chinese content.
 */

const CJK_RE = /[\u4e00-\u9fff]/;

const STOPWORDS = new Set([
  "the", "and", "for", "that", "with", "this", "from", "have", "has", "are",
  "was", "were", "you", "your", "our", "their", "they", "them", "but", "not",
  "can", "will", "would", "should", "could", "about", "into", "than", "then",
  "when", "what", "which", "who", "how", "why", "all", "any", "more", "most",
  "other", "some", "such", "only", "own", "same", "too", "very", "just",
  "also", "been", "being", "here", "there", "because", "over", "under",
  "again", "further", "once", "these", "those", "your", "its", "it's",
  "的", "了", "和", "是", "在", "有", "就", "不", "也", "都", "与", "及",
  "这", "那", "我", "你", "他", "她", "它", "们", "为", "对", "而", "或",
]);

/** Strip common markdown so we can analyse the prose itself. */
export function stripMarkdown(text: string): string {
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

/** Word count that treats each CJK character as one word. */
export function countWords(text: string): number {
  const plain = stripMarkdown(text);
  if (!plain) return 0;
  const cjk = plain.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const latin = plain
    .replace(/[\u4e00-\u9fff]/g, " ")
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w)).length;
  return cjk + latin;
}

function splitSentences(plain: string): string[] {
  return plain
    .split(/[.!?。！？；;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Terms used for keyword-density and repetition analysis.
 * Latin words (len >= 4) plus CJK bigrams.
 */
function tokenize(plain: string): string[] {
  const terms: string[] = [];
  const latin = plain
    .replace(/[\u4e00-\u9fff]/g, " ")
    .toLowerCase()
    .match(/[a-z][a-z'-]{3,}/g);
  if (latin) {
    for (const w of latin) {
      if (!STOPWORDS.has(w)) terms.push(w);
    }
  }
  const cjkRuns = plain.match(/[\u4e00-\u9fff]{2,}/g);
  if (cjkRuns) {
    for (const run of cjkRuns) {
      for (let i = 0; i + 2 <= run.length; i++) {
        const bigram = run.slice(i, i + 2);
        if (!STOPWORDS.has(bigram)) terms.push(bigram);
      }
    }
  }
  return terms;
}

export type HeadingCounts = { h1: number; h2: number; h3: number };

export type KeywordHit = { term: string; count: number; density: number };

export type SeoReport = {
  score: number;
  wordCount: number;
  title: { text: string; length: number; ok: boolean } | null;
  headings: HeadingCounts;
  keywords: KeywordHit[];
  paragraphCount: number;
  avgWordsPerSentence: number;
  listCount: number;
  linkCount: number;
  readability: { score: number; label: string };
  suggestions: string[];
};

export type OriginalityReport = {
  score: number;
  duplicateSentences: { text: string; count: number }[];
  repeatedPhrases: { phrase: string; count: number }[];
  selfSimilarity: number;
  stuffing: KeywordHit[];
  findings: string[];
};

function countHeadings(raw: string): HeadingCounts {
  const lines = raw.split(/\r?\n/);
  let h1 = 0;
  let h2 = 0;
  let h3 = 0;
  for (const line of lines) {
    const m = /^\s{0,3}(#{1,6})\s+(.*)$/.exec(line);
    if (!m) continue;
    const level = m[1]?.length ?? 0;
    if (level === 1) h1 += 1;
    else if (level === 2) h2 += 1;
    else if (level === 3) h3 += 1;
  }
  return { h1, h2, h3 };
}

function findTitle(raw: string): string | null {
  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const m = /^\s{0,3}#{1,2}\s+(.+)$/.exec(line);
    if (m) return (m[1] ?? "").trim();
  }
  const firstNonEmpty = lines.find((l) => l.trim().length > 0);
  return firstNonEmpty ? firstNonEmpty.trim() : null;
}

function topKeywords(terms: string[], limit: number): KeywordHit[] {
  const counts = new Map<string, number>();
  for (const t of terms) counts.set(t, (counts.get(t) ?? 0) + 1);
  const total = terms.length || 1;
  return [...counts.entries()]
    .map(([term, count]) => ({ term, count, density: (count / total) * 100 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Readability approximation. Not Flesch — a simple heuristic combining
 * average sentence length and average word length, tuned for mixed EN/ZH.
 */
function readability(plain: string, sentences: string[], wordCount: number) {
  if (!wordCount || sentences.length === 0) {
    return { score: 0, label: "—" };
  }
  const avgSentence = wordCount / sentences.length;
  const latinWords = plain.replace(/[\u4e00-\u9fff]/g, " ").split(/\s+/).filter((w) => /[A-Za-z]/.test(w));
  const avgWordLen = latinWords.length
    ? latinWords.reduce((sum, w) => sum + w.length, 0) / latinWords.length
    : 4;
  const raw = 100 - avgSentence * 1.4 - Math.max(0, avgWordLen - 4) * 6;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const label =
    score >= 80 ? "很容易读" : score >= 60 ? "较好" : score >= 40 ? "偏难" : "晦涩";
  return { score, label };
}

export function analyzeSeo(content: string): SeoReport {
  const raw = content ?? "";
  const plain = stripMarkdown(raw);
  const wordCount = countWords(raw);
  const sentences = splitSentences(plain);
  const headings = countHeadings(raw);
  const terms = tokenize(plain);
  const keywords = topKeywords(terms, 5);
  const titleText = findTitle(raw);
  const title = titleText
    ? { text: titleText, length: titleText.length, ok: titleText.length >= 15 && titleText.length <= 70 }
    : null;
  const paragraphCount = plain ? plain.split(/\n{2,}|\n/).filter((p) => p.trim().length > 0).length : 0;
  const listCount = (raw.match(/^\s{0,3}(?:[-*+]|\d+\.)\s+/gm) ?? []).length;
  const linkCount = (raw.match(/(?:\[[^\]]*\]\([^)]*\))|(?:https?:\/\/\S+)/g) ?? []).length;
  const read = readability(plain, sentences, wordCount);

  const suggestions: string[] = [];
  if (wordCount < 300) suggestions.push(`内容偏短（${wordCount} 词），SEO 文章建议 600 词以上。`);
  if (!title) suggestions.push("缺少标题，建议加一个 H1/H2 标题。");
  else if (!title.ok) suggestions.push(`标题长度 ${title.length} 字符，建议控制在 15–70 字符之间。`);
  if (headings.h2 + headings.h3 < 2) suggestions.push("小标题偏少，建议至少 2 个 H2/H3 便于扫读。");
  if (listCount === 0) suggestions.push("没有列表，适当使用列表可提升可读性与精选摘要命中率。");
  if (linkCount === 0) suggestions.push("没有内链/外链，建议补充 1–3 个相关链接。");
  const mainKeyword = keywords[0];
  if (mainKeyword && mainKeyword.density > 4)
    suggestions.push(`「${mainKeyword.term}」密度 ${mainKeyword.density.toFixed(1)}%，偏高，可能被判关键词堆砌。`);
  if (read.score > 0 && read.score < 50) suggestions.push("句子偏长或词偏难，建议拆分长句以提升可读性。");

  // Score: weighted checklist
  let score = 0;
  score += Math.min(25, Math.round((Math.min(wordCount, 900) / 900) * 25));
  score += title ? (title.ok ? 15 : 8) : 0;
  score += Math.min(15, (headings.h2 + headings.h3) * 5);
  score += listCount > 0 ? 10 : 0;
  score += linkCount > 0 ? 10 : 0;
  score += mainKeyword && mainKeyword.density <= 4 && mainKeyword.density > 0 ? 15 : 5;
  score += Math.round((read.score / 100) * 10);
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    wordCount,
    title,
    headings,
    keywords,
    paragraphCount,
    avgWordsPerSentence: sentences.length ? Math.round(wordCount / sentences.length) : 0,
    listCount,
    linkCount,
    readability: read,
    suggestions,
  };
}

export function analyzeOriginality(content: string): OriginalityReport {
  const raw = content ?? "";
  const plain = stripMarkdown(raw);
  const findings: string[] = [];

  // 1. Duplicate sentences
  const norm = (s: string) => s.toLowerCase().replace(/[\s\p{P}]+/gu, "").trim();
  const sentences = splitSentences(plain);
  const sentCounts = new Map<string, { text: string; count: number }>();
  for (const s of sentences) {
    if (s.length < 8) continue;
    const key = norm(s);
    if (!key) continue;
    const prev = sentCounts.get(key);
    if (prev) prev.count += 1;
    else sentCounts.set(key, { text: s.slice(0, 120), count: 1 });
  }
  const duplicateSentences = [...sentCounts.values()].filter((s) => s.count > 1);

  // 2. Repeated n-grams (self-similarity)
  const terms = tokenize(plain);
  const n = 5;
  const grams = new Map<string, number>();
  let gramTotal = 0;
  for (let i = 0; i + n <= terms.length; i++) {
    const gram = terms.slice(i, i + n).join(" ");
    grams.set(gram, (grams.get(gram) ?? 0) + 1);
    gramTotal += 1;
  }
  const repeated = [...grams.entries()].filter(([, c]) => c > 1).sort((a, b) => b[1] - a[1]);
  const repeatedPhrases = repeated.slice(0, 5).map(([phrase, count]) => ({ phrase, count }));
  const selfSimilarity = gramTotal
    ? Math.round(((gramTotal - grams.size) / gramTotal) * 100)
    : 0;

  // 3. Keyword stuffing
  const stuffing = topKeywords(terms, 5).filter((k) => k.density > 4 && k.count >= 4);

  if (duplicateSentences.length === 0) findings.push("未发现重复句子。");
  else findings.push(`发现 ${duplicateSentences.length} 处重复句子，建议改写或删除。`);
  if (selfSimilarity >= 25) findings.push(`片段自相似度 ${selfSimilarity}%，偏高，措辞重复较多。`);
  else findings.push(`片段自相似度 ${selfSimilarity}%，处于正常范围。`);
  const topStuffing = stuffing[0];
  if (topStuffing) findings.push(`「${topStuffing.term}」出现密度过高，注意关键词堆砌。`);
  findings.push("注：以上为本地重复度检测，不联网比对，不能替代全网查重服务。");

  let score = 100;
  score -= Math.min(30, duplicateSentences.length * 10);
  score -= Math.min(30, Math.max(0, selfSimilarity - 15) * 2);
  score -= stuffing.length ? 15 : 0;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    duplicateSentences,
    repeatedPhrases,
    selfSimilarity,
    stuffing,
    findings,
  };
}
