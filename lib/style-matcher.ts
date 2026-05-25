export interface BrandVoiceProfile {
  tone: {
    formality: number;
    sentiment: "positive" | "neutral" | "negative";
    pace: "fast" | "moderate" | "slow";
  };
  commonPhrases: string[];
  avgSentenceLength: number;
  avgParagraphLength: number;
  industryTerms: string[];
}

export interface BrandVoiceSample {
  id: string;
  content: string;
  createdAt: string;
}

export interface StyleBreakdown {
  tone: number;
  vocabulary: number;
  structure: number;
}

export interface StyleMatchResult {
  score: number;
  breakdown: StyleBreakdown;
  suggestions: string[];
}

const TONE_WEIGHT = 0.4;
const VOCABULARY_WEIGHT = 0.35;
const STRUCTURE_WEIGHT = 0.25;

function calculateFormalityScore(text: string): number {
  const formalIndicators = ["therefore", "furthermore", "moreover", "consequently", "accordingly", "hereby", "thereof", "wherein"];
  const informalIndicators = ["gonna", "wanna", "kinda", "sorta", "awesome", "cool", "stuff", "things", "pretty much", "kind of"];
  
  const lowerText = text.toLowerCase();
  let formalCount = 0;
  let informalCount = 0;
  
  for (const indicator of formalIndicators) {
    if (lowerText.includes(indicator)) formalCount++;
  }
  for (const indicator of informalIndicators) {
    if (lowerText.includes(indicator)) informalCount++;
  }
  
  const total = formalCount + informalCount;
  if (total === 0) return 50;
  
  return Math.min(100, Math.max(0, 50 + (formalCount - informalCount) * 10));
}

function calculateSentimentScore(text: string): number {
  const positiveWords = ["great", "excellent", "amazing", "wonderful", "fantastic", "love", "best", "perfect", "helpful", "innovative"];
  const negativeWords = ["bad", "terrible", "awful", "hate", "worst", "poor", "disappointing", "fail", "wrong", "issue"];
  
  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of positiveWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    positiveCount += (lowerText.match(regex) || []).length;
  }
  for (const word of negativeWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    negativeCount += (lowerText.match(regex) || []).length;
  }
  
  const total = positiveCount + negativeCount;
  if (total === 0) return 50;
  
  return Math.min(100, Math.max(0, 50 + (positiveCount - negativeCount) * 10));
}

function calculatePaceScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) return 50;
  
  const avgWordsPerSentence = words.length / sentences.length;
  
  if (avgWordsPerSentence < 10) return 80;
  if (avgWordsPerSentence < 15) return 60;
  if (avgWordsPerSentence < 20) return 40;
  return 20;
}

function calculateToneScore(text: string, profile: BrandVoiceProfile): number {
  const textFormality = calculateFormalityScore(text);
  const textSentiment = calculateSentimentScore(text);
  const textPace = calculatePaceScore(text);
  
  const targetFormality = profile.tone.formality;
  const formalityDiff = Math.abs(textFormality - targetFormality);
  const formalityScore = Math.max(0, 100 - formalityDiff * 2);
  
  let sentimentTarget = 50;
  if (profile.tone.sentiment === "positive") sentimentTarget = 70;
  else if (profile.tone.sentiment === "negative") sentimentTarget = 30;
  const sentimentDiff = Math.abs(textSentiment - sentimentTarget);
  const sentimentScore = Math.max(0, 100 - sentimentDiff * 2);
  
  let paceTarget = 50;
  if (profile.tone.pace === "fast") paceTarget = 70;
  else if (profile.tone.pace === "slow") paceTarget = 30;
  const paceDiff = Math.abs(textPace - paceTarget);
  const paceScore = Math.max(0, 100 - paceDiff * 2);
  
  return Math.round((formalityScore + sentimentScore + paceScore) / 3);
}

function calculateVocabularyScore(text: string, profile: BrandVoiceProfile): number {
  const lowerText = text.toLowerCase();
  let matchCount = 0;
  
  for (const phrase of profile.commonPhrases) {
    if (lowerText.includes(phrase.toLowerCase())) {
      matchCount++;
    }
  }
  
  if (profile.commonPhrases.length === 0) return 50;
  
  const matchRatio = matchCount / Math.min(profile.commonPhrases.length, 10);
  return Math.min(100, Math.round(matchRatio * 100));
}

function calculateStructureScore(text: string, profile: BrandVoiceProfile): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  if (sentences.length === 0 || words.length === 0) return 50;
  
  const avgSentenceLength = words.length / sentences.length;
  const avgParagraphLength = sentences.length > 0 ? words.length / paragraphs.length : 0;
  
  const sentenceLengthDiff = Math.abs(avgSentenceLength - profile.avgSentenceLength);
  const sentenceLengthScore = Math.max(0, 100 - sentenceLengthDiff * 5);
  
  const paragraphLengthDiff = Math.abs(avgParagraphLength - profile.avgParagraphLength);
  const paragraphLengthScore = Math.max(0, 100 - paragraphLengthDiff * 2);
  
  return Math.round((sentenceLengthScore + paragraphLengthScore) / 2);
}

function generateSuggestions(text: string, profile: BrandVoiceProfile, breakdown: StyleBreakdown): string[] {
  const suggestions: string[] = [];
  
  if (breakdown.tone < 70) {
    const textFormality = calculateFormalityScore(text);
    if (textFormality < profile.tone.formality - 20) {
      suggestions.push("Consider using more formal language and structure your sentences more carefully");
    } else if (textFormality > profile.tone.formality + 20) {
      suggestions.push("Try a more casual tone - shorter sentences and simpler words may help");
    }
    
    if (profile.tone.sentiment === "positive" && calculateSentimentScore(text) < 40) {
      suggestions.push("Add more positive and enthusiastic language to match your brand voice");
    }
    
    if (profile.tone.pace === "fast" && calculatePaceScore(text) < 40) {
      suggestions.push("Shorten your sentences for a faster-paced reading experience");
    } else if (profile.tone.pace === "slow" && calculatePaceScore(text) > 60) {
      suggestions.push("Consider longer, more detailed sentences for a slower, thoughtful pace");
    }
  }
  
  if (breakdown.vocabulary < 70) {
    const missingPhrases = profile.commonPhrases.slice(0, 5).filter(
      phrase => !text.toLowerCase().includes(phrase.toLowerCase())
    );
    if (missingPhrases.length > 0) {
      suggestions.push(`Try incorporating phrases like: "${missingPhrases.slice(0, 2).join('", "')}"`);
    }
  }
  
  if (breakdown.structure < 70) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (sentences.length > 0) {
      const avgLength = words.length / sentences.length;
      if (avgLength < profile.avgSentenceLength - 5) {
        suggestions.push("Your sentences are shorter than usual - consider adding more detail");
      } else if (avgLength > profile.avgSentenceLength + 5) {
        suggestions.push("Your sentences are longer than usual - consider breaking them up");
      }
    }
  }
  
  return suggestions;
}

export function scoreStyleMatch(generatedText: string, profile: BrandVoiceProfile): StyleMatchResult {
  if (!generatedText.trim() || !profile) {
    return {
      score: 0,
      breakdown: { tone: 0, vocabulary: 0, structure: 0 },
      suggestions: [],
    };
  }
  
  const toneScore = calculateToneScore(generatedText, profile);
  const vocabularyScore = calculateVocabularyScore(generatedText, profile);
  const structureScore = calculateStructureScore(generatedText, profile);
  
  const breakdown: StyleBreakdown = {
    tone: toneScore,
    vocabulary: vocabularyScore,
    structure: structureScore,
  };
  
  const totalScore = Math.round(
    toneScore * TONE_WEIGHT + 
    vocabularyScore * VOCABULARY_WEIGHT + 
    structureScore * STRUCTURE_WEIGHT
  );
  
  const suggestions = generateSuggestions(generatedText, profile, breakdown);
  
  return {
    score: totalScore,
    breakdown,
    suggestions,
  };
}

export function hasBrandProfile(): boolean {
  if (typeof window === "undefined") return false;
  const profile = localStorage.getItem("use-ai-writer-brand-profile");
  return profile !== null && profile !== "";
}

export function getBrandProfile(): BrandVoiceProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("use-ai-writer-brand-profile");
    if (!raw) return null;
    return JSON.parse(raw) as BrandVoiceProfile;
  } catch {
    return null;
  }
}
