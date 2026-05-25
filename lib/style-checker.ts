import type { BrandVoiceProfile, BrandVoiceSample } from "./style-matcher";

export interface ConsistencyWarning {
  type: "tone" | "sentence_length" | "industry_term";
  message: string;
  suggestion: string;
}

export interface ConsistencyResult {
  isConsistent: boolean;
  warnings: ConsistencyWarning[];
}

function calculateFormality(text: string): number {
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

function calculateAvgSentenceLength(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  return words.length / sentences.length;
}

function extractIndustryTerms(text: string, knownTerms: string[]): string[] {
  const lowerText = text.toLowerCase();
  const foundTerms: string[] = [];
  const newTerms: string[] = [];
  
  for (const term of knownTerms) {
    if (lowerText.includes(term.toLowerCase())) {
      foundTerms.push(term);
    }
  }
  
  const commonTerms = [
    "optimization", "scalability", "integration", "workflow", "metrics",
    "analytics", "roi", "kpi", "bottleneck", "stakeholder", "synergy",
    "leverage", "pivot", "disrupt", "paradigm", "ecosystem", "agile",
    "pipeline", "deployment", "infrastructure", "architecture"
  ];
  
  for (const term of commonTerms) {
    if (lowerText.includes(term) && !knownTerms.some(kt => kt.toLowerCase() === term)) {
      newTerms.push(term);
    }
  }
  
  return newTerms;
}

export function checkStyleConsistency(
  newText: string,
  profile: BrandVoiceProfile,
  recentSamples: BrandVoiceSample[]
): ConsistencyResult {
  const warnings: ConsistencyWarning[] = [];
  
  const newFormality = calculateFormality(newText);
  const formalityDeviation = Math.abs(newFormality - profile.tone.formality);
  
  if (formalityDeviation > 30) {
    const direction = newFormality > profile.tone.formality ? "more formal" : "more casual";
    warnings.push({
      type: "tone",
      message: `The tone is ${direction} than your usual style`,
      suggestion: "Adjust the formality level to match your brand voice",
    });
  }
  
  const newSentenceLength = calculateAvgSentenceLength(newText);
  if (newSentenceLength > 0 && profile.avgSentenceLength > 0) {
    const sentenceLengthDeviation = Math.abs(newSentenceLength - profile.avgSentenceLength);
    const percentDeviation = (sentenceLengthDeviation / profile.avgSentenceLength) * 100;
    
    if (percentDeviation > 50) {
      const direction = newSentenceLength > profile.avgSentenceLength ? "longer" : "shorter";
      warnings.push({
        type: "sentence_length",
        message: `Your sentences are ${direction} than usual (${Math.round(newSentenceLength)} vs ${Math.round(profile.avgSentenceLength)} words)`,
        suggestion: "Match your typical sentence length for consistency",
      });
    }
  }
  
  if (profile.industryTerms.length > 0) {
    const newTerms = extractIndustryTerms(newText, profile.industryTerms);
    if (newTerms.length > 0) {
      warnings.push({
        type: "industry_term",
        message: `New industry terms detected: "${newTerms.slice(0, 3).join('", "')}"`,
        suggestion: "Consider adding these terms to your brand voice profile",
      });
    }
  }
  
  return {
    isConsistent: warnings.length === 0,
    warnings,
  };
}
