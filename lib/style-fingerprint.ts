export interface StyleFingerprint {
  sentenceLengthDistribution: {
    short: number;
    medium: number;
    long: number;
  };
  paragraphStructurePreference: {
    short: number;
    medium: number;
    long: number;
  };
  headingStyleDistribution: {
    question: number;
    statement: number;
    command: number;
    number: number;
  };
  commonTransitionWords: string[];
  passiveVoiceRate: number;
  avgSentenceLength: number;
  avgParagraphSentenceCount: number;
  sampleCount: number;
  analyzedAt: string;
}

export const DEFAULT_FINGERPRINT: StyleFingerprint = {
  sentenceLengthDistribution: { short: 33, medium: 34, long: 33 },
  paragraphStructurePreference: { short: 33, medium: 34, long: 33 },
  headingStyleDistribution: { question: 25, statement: 25, command: 25, number: 25 },
  commonTransitionWords: [],
  passiveVoiceRate: 0,
  avgSentenceLength: 15,
  avgParagraphSentenceCount: 4,
  sampleCount: 0,
  analyzedAt: "",
};

const TRANSITION_WORDS = [
  "首先", "其次", "此外", "另外", "然后", "因此", "所以", "总之", "综上", "不过",
  "然而", "但是", "同时", "与此同时", "换句话说", "也就是说", "例如", "比如",
  "first", "second", "third", "additionally", "furthermore", "moreover", "however",
  "therefore", "consequently", "meanwhile", "in other words", "for example", "for instance",
  "in conclusion", "to summarize", "on the other hand", "in contrast", "nevertheless",
  "also", "besides", "similarly", "likewise", "as a result", "thus", "hence",
];

const PASSIVE_PATTERNS = [
  /\bwas\s+\w+ed\b/gi,
  /\bwere\s+\w+ed\b/gi,
  /\bis\s+\w+ed\b/gi,
  /\bare\s+\w+ed\b/gi,
  /\bbeen\s+\w+ed\b/gi,
  /\bbeing\s+\w+ed\b/gi,
  /被\s*[\u4e00-\u9fff]+/g,
];

function splitSentences(text: string): string[] {
  return text
    .split(/[.!?。！？\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function countWords(text: string): number {
  const cjk = text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g);
  const cjkCount = cjk ? cjk.length : 0;
  const withoutCjk = text.replace(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g, " ");
  const words = withoutCjk.split(/\s+/).filter((w) => w.length > 0);
  return cjkCount + words.length;
}

function analyzeSentenceLengthDistribution(sentences: string[]): { short: number; medium: number; long: number } {
  if (sentences.length === 0) return { short: 33, medium: 34, long: 33 };

  let short = 0;
  let medium = 0;
  let long = 0;

  for (const sentence of sentences) {
    const wordCount = countWords(sentence);
    if (wordCount < 15) short++;
    else if (wordCount <= 30) medium++;
    else long++;
  }

  const total = short + medium + long;
  if (total === 0) return { short: 33, medium: 34, long: 33 };

  return {
    short: Math.round((short / total) * 100),
    medium: Math.round((medium / total) * 100),
    long: Math.round((long / total) * 100),
  };
}

function analyzeParagraphStructurePreference(paragraphs: string[]): { short: number; medium: number; long: number } {
  if (paragraphs.length === 0) return { short: 33, medium: 34, long: 33 };

  let short = 0;
  let medium = 0;
  let long = 0;

  for (const paragraph of paragraphs) {
    const sentences = splitSentences(paragraph);
    const count = sentences.length;
    if (count < 3) short++;
    else if (count <= 6) medium++;
    else long++;
  }

  const total = short + medium + long;
  if (total === 0) return { short: 33, medium: 34, long: 33 };

  return {
    short: Math.round((short / total) * 100),
    medium: Math.round((medium / total) * 100),
    long: Math.round((long / total) * 100),
  };
}

function analyzeHeadingStyleDistribution(text: string): { question: number; statement: number; command: number; number: number } {
  const headingLines = text
    .split(/\n/)
    .filter((line) => line.trim().startsWith("#") || line.trim().match(/^\d+\.\s/))
    .map((line) => line.replace(/^#+\s*/, "").replace(/^\d+\.\s*/, "").trim());

  if (headingLines.length === 0) {
    return { question: 25, statement: 25, command: 25, number: 25 };
  }

  let question = 0;
  let statement = 0;
  let command = 0;
  let number = 0;

  for (const heading of headingLines) {
    if (heading.endsWith("?") || heading.endsWith("？")) question++;
    else if (/^\d+/.test(heading) || /^\d+\s/.test(heading)) number++;
    else if (/^(how|why|what|where|when|get|try|start|use|learn|create|build|write|make|do)/i.test(heading)) command++;
    else statement++;
  }

  const total = question + statement + command + number;
  if (total === 0) return { question: 25, statement: 25, command: 25, number: 25 };

  return {
    question: Math.round((question / total) * 100),
    statement: Math.round((statement / total) * 100),
    command: Math.round((command / total) * 100),
    number: Math.round((number / total) * 100),
  };
}

function findCommonTransitionWords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const word of TRANSITION_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      found.push(word);
    }
  }

  return [...new Set(found)].slice(0, 10);
}

function calculatePassiveVoiceRate(text: string): number {
  let passiveCount = 0;
  const sentences = splitSentences(text);

  if (sentences.length === 0) return 0;

  for (const pattern of PASSIVE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) passiveCount += matches.length;
  }

  return Math.min(1, passiveCount / sentences.length);
}

export function analyzeStyleFingerprint(samples: string[]): StyleFingerprint {
  if (!samples || samples.length === 0) return DEFAULT_FINGERPRINT;

  const combinedText = samples.join("\n\n");
  const sentences = splitSentences(combinedText);
  const paragraphs = splitParagraphs(combinedText);

  const totalWords = countWords(combinedText);
  const avgSentenceLength = sentences.length > 0 ? Math.round(totalWords / sentences.length) : 15;
  const avgParagraphSentenceCount =
    paragraphs.length > 0
      ? Math.round(sentences.length / paragraphs.length)
      : 4;

  return {
    sentenceLengthDistribution: analyzeSentenceLengthDistribution(sentences),
    paragraphStructurePreference: analyzeParagraphStructurePreference(paragraphs),
    headingStyleDistribution: analyzeHeadingStyleDistribution(combinedText),
    commonTransitionWords: findCommonTransitionWords(combinedText),
    passiveVoiceRate: calculatePassiveVoiceRate(combinedText),
    avgSentenceLength,
    avgParagraphSentenceCount,
    sampleCount: samples.length,
    analyzedAt: new Date().toISOString(),
  };
}

export function getFingerprintSummary(fingerprint: StyleFingerprint): string {
  const parts: string[] = [];

  const { sentenceLengthDistribution: sld } = fingerprint;
  const dominantSentence =
    sld.short > sld.medium && sld.short > sld.long
      ? "短句"
      : sld.long > sld.medium
      ? "长句"
      : "中等长度句子";
  parts.push(`偏好${dominantSentence}（短${sld.short}% 中${sld.medium}% 长${sld.long}%）`);

  const { paragraphStructurePreference: psp } = fingerprint;
  const dominantParagraph =
    psp.short > psp.medium && psp.short > psp.long
      ? "短段落"
      : psp.long > psp.medium
      ? "长段落"
      : "中等段落";
  parts.push(`偏好${dominantParagraph}`);

  if (fingerprint.commonTransitionWords.length > 0) {
    parts.push(`常用过渡词：${fingerprint.commonTransitionWords.slice(0, 3).join("、")}`);
  }

  if (fingerprint.passiveVoiceRate > 0.3) {
    parts.push("较多使用被动语态");
  }

  return parts.join("；");
}
