import {
  ToneAnalysis,
  VocabularyAnalysis,
  SentenceStructure,
  ReadabilityAnalysis,
  EngagementAnalysis,
  StyleAnalysis,
} from "./analysis-types";
import { randomUUID } from "crypto";

// Analyze tone of text
export function analyzeTone(text: string): ToneAnalysis {
  const lowerText = text.toLowerCase();

  // Tone keywords mapping
  const toneKeywords: Record<string, string[]> = {
    professional: ["分析", "研究", "数据", "报告", "专业", "严谨", "客观"],
    friendly: ["你好", "欢迎", "一起", "分享", "帮助", "友好", "亲切"],
    authoritative: ["必须", "应该", "专家", "权威", "领导", "主导", "控制"],
    casual: ["哈哈", "嘿", "哦", "嗯", "随便", "轻松", "休闲"],
    persuasive: ["推荐", "最佳", "优势", "价值", "收益", "效果", "提升"],
    informative: ["介绍", "说明", "解释", "展示", "提供", "包含", "涵盖"],
  };

  // Count tone keywords
  const toneScores: Record<string, number> = {};
  for (const [tone, keywords] of Object.entries(toneKeywords)) {
    toneScores[tone] = keywords.reduce(
      (sum, keyword) => sum + (lowerText.match(new RegExp(keyword, "g")) || []).length,
      0
    );
  }

  // Find primary and secondary tones
  const sortedTones = Object.entries(toneScores).sort(([, a], [, b]) => b - a);
  const primaryTone = sortedTones[0]?.[0] || "neutral";
  const secondaryTones = sortedTones.slice(1, 3).map(([tone]) => tone);

  // Calculate tone score (0-100)
  const totalKeywords = Object.values(toneScores).reduce((sum, score) => sum + score, 0);
  const toneScore = Math.min(100, totalKeywords * 5);

  // Confidence based on keyword density
  const wordCount = text.split(/\s+/).length;
  const confidence = Math.min(100, (totalKeywords / wordCount) * 1000);

  // Extract all matched keywords
  const keywords: string[] = [];
  for (const [, kws] of Object.entries(toneKeywords)) {
    for (const keyword of kws) {
      if (lowerText.includes(keyword)) {
        keywords.push(keyword);
      }
    }
  }

  return {
    primaryTone,
    secondaryTones,
    toneScore,
    confidence,
    keywords: [...new Set(keywords)],
  };
}

// Analyze vocabulary
export function analyzeVocabulary(text: string): VocabularyAnalysis {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));

  // Count syllables (approximation for Chinese/English)
  const countSyllables = (word: string): number => {
    // For Chinese characters, each is roughly one syllable
    if (/[\u4e00-\u9fa5]/.test(word)) {
      return word.length;
    }
    // For English, count vowel groups
    return (word.match(/[aeiouAEIOU]+/g) || []).length || 1;
  };

  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

  // Complex words (3+ syllables)
  const complexWords = words.filter((w) => countSyllables(w) >= 3).length;
  const simpleWords = words.filter((w) => countSyllables(w) < 3).length;

  // Jargon detection (simplified)
  const jargonPatterns = [
    /API/i, /SDK/i, /ROI/i, /KPI/i, /B2B/i, /B2C/i,
    /算法/i, /模型/i, /参数/i, /优化/i, /架构/i,
  ];
  const jargonTerms: string[] = [];
  for (const pattern of jargonPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      jargonTerms.push(...matches);
    }
  }

  // Power words
  const powerWordList = [
    "强大", "卓越", "领先", "创新", "突破", "革命性", "颠覆",
    "powerful", "excellent", "leading", "innovative", "breakthrough",
  ];
  const powerWords = powerWordList.filter((word) =>
    text.toLowerCase().includes(word.toLowerCase())
  );

  return {
    uniqueWords: uniqueWords.size,
    totalWords: words.length,
    lexicalDiversity: words.length > 0 ? uniqueWords.size / words.length : 0,
    avgWordLength,
    complexWords,
    simpleWords,
    jargonTerms: [...new Set(jargonTerms)],
    powerWords,
  };
}

// Analyze sentence structure
export function analyzeSentenceStructure(text: string): SentenceStructure {
  const sentences = text.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0);
  const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);

  const avgSentenceLength =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceLengths.length
      : 0;

  // Calculate variance
  const variance =
    sentenceLengths.length > 0
      ? sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) /
        sentenceLengths.length
      : 0;

  // Classify sentences
  const simpleSentences = sentences.filter((s) => s.split(/\s+/).length < 15).length;
  const compoundSentences = sentences.filter(
    (s) => s.includes("和") || s.includes("与") || s.includes("并且") || s.includes("and")
  ).length;
  const complexSentences = sentences.filter(
    (s) => s.includes("因为") || s.includes("所以") || s.includes("虽然") || s.includes("because")
  ).length;

  // Active voice detection (simplified)
  const passivePatterns = [/被\s+\S+\s+/, /是由/, /was\s+\S+\s+ed/, /is\s+\S+\s+ed/];
  const passiveCount = passivePatterns.reduce(
    (sum, pattern) => sum + (text.match(pattern) || []).length,
    0
  );
  const activeVoiceRatio =
    sentences.length > 0 ? 1 - passiveCount / sentences.length : 1;

  // Paragraph analysis
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const avgParagraphLength =
    paragraphs.length > 0
      ? paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length
      : 0;

  return {
    avgSentenceLength,
    sentenceLengthVariance: variance,
    simpleSentences,
    compoundSentences,
    complexSentences,
    activeVoiceRatio,
    paragraphCount: paragraphs.length,
    avgParagraphLength,
  };
}

// Analyze readability
export function analyzeReadability(text: string): ReadabilityAnalysis {
  const words = text.split(/\s+/).filter((w) => w.length > 0);
  const sentences = text.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0);

  const wordCount = words.length || 1;
  const sentenceCount = sentences.length || 1;

  // Count syllables (approximation)
  const countSyllables = (word: string): number => {
    if (/[\u4e00-\u9fa5]/.test(word)) {
      return word.length;
    }
    return (word.match(/[aeiouAEIOU]+/g) || []).length || 1;
  };

  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);

  // Flesch-Kincaid Grade Level
  const fleschKincaidGrade =
    0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;

  // Flesch Reading Ease
  const fleschReadingEase =
    206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);

  // Gunning Fog Index
  const complexWords = words.filter((w) => countSyllables(w) >= 3).length;
  const gunningFogIndex =
    0.4 * (wordCount / sentenceCount + 100 * (complexWords / wordCount));

  // SMOG Index
  const smogIndex = 1.043 * Math.sqrt((complexWords * 30) / sentenceCount) + 3.1291;

  // Coleman-Liau Index
  const lettersPerWord = text.replace(/\s+/g, "").length / wordCount;
  const sentencesPerWord = sentenceCount / wordCount;
  const colemanLiauIndex = 0.0588 * lettersPerWord - 0.296 * sentencesPerWord - 15.8;

  // Reading time (average 200 words per minute)
  const estimatedReadingTime = wordCount / 200;

  return {
    fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
    fleschReadingEase: Math.min(100, Math.max(0, fleschReadingEase)),
    gunningFogIndex: Math.max(0, gunningFogIndex),
    smogIndex: Math.max(0, smogIndex),
    colemanLiauIndex: Math.max(0, colemanLiauIndex),
    estimatedReadingTime: Math.max(0.1, estimatedReadingTime),
  };
}

// Analyze engagement
export function analyzeEngagement(text: string): EngagementAnalysis {
  const sentences = text.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0);

  // Hook strength (first sentence impact)
  const firstSentence = sentences[0] || "";
  const hookStrength = Math.min(100, firstSentence.length * 2 + 30);

  // Call to action count
  const ctaPatterns = [
    /\b(购买|获取|开始|尝试|下载|订阅|加入|注册|了解更多|buy|get|start|try|download|subscribe|join|sign up|learn more)\b/gi,
  ];
  const callToActionCount = ctaPatterns.reduce(
    (sum, pattern) => sum + (text.match(pattern) || []).length,
    0
  );

  // Question count
  const questionCount = (text.match(/[?？]/g) || []).length;

  // Emotional words
  const emotionalWords = [
    "惊人", "不可思议", "强大", "转变", "发现", "解锁", "革命性", "颠覆性", "改变生活",
    "amazing", "incredible", "powerful", "transform", "discover", "unlock", "revolutionary",
  ];
  const emotionalWordCount = emotionalWords.reduce(
    (sum, word) => sum + (text.toLowerCase().match(new RegExp(word, "g")) || []).length,
    0
  );

  // Storytelling elements
  const storytellingPatterns = [
    /\b(故事|旅程|经历|冒险|挑战|成功|失败|教训|story|journey|experience|adventure|challenge|success|failure|lesson)\b/gi,
  ];
  const storytellingElements = storytellingPatterns.reduce(
    (sum, pattern) => sum + (text.match(pattern) || []).length,
    0
  );

  // Overall engagement score
  const engagementScore = Math.min(
    100,
    hookStrength * 0.3 +
      callToActionCount * 10 +
      questionCount * 5 +
      emotionalWordCount * 8 +
      storytellingElements * 6
  );

  return {
    hookStrength,
    callToActionCount,
    questionCount,
    emotionalWords: emotionalWordCount,
    storytellingElements,
    engagementScore,
  };
}

// Calculate overall score
export function calculateOverallScore(
  tone: ToneAnalysis,
  vocabulary: VocabularyAnalysis,
  sentenceStructure: SentenceStructure,
  readability: ReadabilityAnalysis,
  engagement: EngagementAnalysis
): number {
  const toneScore = tone.toneScore * 0.25;
  const vocabScore = vocabulary.lexicalDiversity * 100 * 0.2;
  const readabilityScore = readability.fleschReadingEase * 0.2;
  const structureScore = (1 - Math.min(1, sentenceStructure.sentenceLengthVariance / 50)) * 100 * 0.15;
  const engagementScore = engagement.engagementScore * 0.2;

  return Math.round(toneScore + vocabScore + readabilityScore + structureScore + engagementScore);
}

// Complete style analysis
export function analyzeStyle(
  text: string,
  contentId: string,
  userId: string
): StyleAnalysis {
  const tone = analyzeTone(text);
  const vocabulary = analyzeVocabulary(text);
  const sentenceStructure = analyzeSentenceStructure(text);
  const readability = analyzeReadability(text);
  const engagement = analyzeEngagement(text);
  const overallScore = calculateOverallScore(tone, vocabulary, sentenceStructure, readability, engagement);

  return {
    id: randomUUID(),
    contentId,
    userId,
    tone,
    vocabulary,
    sentenceStructure,
    readability,
    engagement,
    overallScore,
    analyzedAt: new Date(),
  };
}
