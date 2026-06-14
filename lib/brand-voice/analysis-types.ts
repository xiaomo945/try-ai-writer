import { z } from "zod";

// Style analysis dimensions
export const StyleDimensions = {
  TONE: "tone",
  VOCABULARY: "vocabulary",
  SENTENCE_STRUCTURE: "sentenceStructure",
  READABILITY: "readability",
  ENGAGEMENT: "engagement",
} as const;

export type StyleDimension = (typeof StyleDimensions)[keyof typeof StyleDimensions];

// Tone analysis result
export const ToneAnalysisSchema = z.object({
  primaryTone: z.string(),
  secondaryTones: z.array(z.string()),
  toneScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  keywords: z.array(z.string()),
});

export type ToneAnalysis = z.infer<typeof ToneAnalysisSchema>;

// Vocabulary analysis result
export const VocabularyAnalysisSchema = z.object({
  uniqueWords: z.number(),
  totalWords: z.number(),
  lexicalDiversity: z.number().min(0).max(1),
  avgWordLength: z.number(),
  complexWords: z.number(),
  simpleWords: z.number(),
  jargonTerms: z.array(z.string()),
  powerWords: z.array(z.string()),
});

export type VocabularyAnalysis = z.infer<typeof VocabularyAnalysisSchema>;

// Sentence structure analysis
export const SentenceStructureSchema = z.object({
  avgSentenceLength: z.number(),
  sentenceLengthVariance: z.number(),
  simpleSentences: z.number(),
  compoundSentences: z.number(),
  complexSentences: z.number(),
  activeVoiceRatio: z.number().min(0).max(1),
  paragraphCount: z.number(),
  avgParagraphLength: z.number(),
});

export type SentenceStructure = z.infer<typeof SentenceStructureSchema>;

// Readability analysis
export const ReadabilityAnalysisSchema = z.object({
  fleschKincaidGrade: z.number(),
  fleschReadingEase: z.number(),
  gunningFogIndex: z.number(),
  smogIndex: z.number(),
  colemanLiauIndex: z.number(),
  estimatedReadingTime: z.number(),
});

export type ReadabilityAnalysis = z.infer<typeof ReadabilityAnalysisSchema>;

// Engagement analysis
export const EngagementAnalysisSchema = z.object({
  hookStrength: z.number().min(0).max(100),
  callToActionCount: z.number(),
  questionCount: z.number(),
  emotionalWords: z.number(),
  storytellingElements: z.number(),
  engagementScore: z.number().min(0).max(100),
});

export type EngagementAnalysis = z.infer<typeof EngagementAnalysisSchema>;

// Complete style analysis
export const StyleAnalysisSchema = z.object({
  id: z.string().uuid(),
  contentId: z.string().uuid(),
  userId: z.string().uuid(),
  tone: ToneAnalysisSchema,
  vocabulary: VocabularyAnalysisSchema,
  sentenceStructure: SentenceStructureSchema,
  readability: ReadabilityAnalysisSchema,
  engagement: EngagementAnalysisSchema,
  overallScore: z.number().min(0).max(100),
  analyzedAt: z.date(),
});

export type StyleAnalysis = z.infer<typeof StyleAnalysisSchema>;

// Industry benchmarks
export const IndustryBenchmarkSchema = z.object({
  industry: z.string(),
  avgToneScore: z.number(),
  avgReadability: z.number(),
  avgEngagement: z.number(),
  avgVocabularyDiversity: z.number(),
  topKeywords: z.array(z.string()),
});

export type IndustryBenchmark = z.infer<typeof IndustryBenchmarkSchema>;

// Style evolution tracking
export const StyleEvolutionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  analysisId: z.string().uuid(),
  timestamp: z.date(),
  overallScore: z.number(),
  toneScore: z.number(),
  readabilityScore: z.number(),
  engagementScore: z.number(),
});

export type StyleEvolution = z.infer<typeof StyleEvolutionSchema>;

// Style suggestion
export const StyleSuggestionSchema = z.object({
  id: z.string().uuid(),
  analysisId: z.string().uuid(),
  dimension: z.enum([
    StyleDimensions.TONE,
    StyleDimensions.VOCABULARY,
    StyleDimensions.SENTENCE_STRUCTURE,
    StyleDimensions.READABILITY,
    StyleDimensions.ENGAGEMENT,
  ]),
  priority: z.enum(["high", "medium", "low"]),
  title: z.string(),
  description: z.string(),
  suggestion: z.string(),
  impact: z.string(),
});

export type StyleSuggestion = z.infer<typeof StyleSuggestionSchema>;
