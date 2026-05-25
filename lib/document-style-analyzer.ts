import { BrandVoiceProfile } from "./brand-voice";

export interface DocumentStyleProfile {
  industry: string;
  tone: "formal" | "casual" | "academic" | "friendly";
  audience: string;
  commonPhrases: string[];
  averageSentenceLength: number;
  paragraphStructure: "short" | "medium" | "long";
}

// Helper: Tokenize text and count word frequencies (stop words excluded)
function extractWordFrequencies(text: string): { [word: string]: number } {
  const stopWords = new Set([
    "the", "and", "for", "is", "are", "was", "were", "it", "its",
    "this", "that", "these", "those", "with", "without", "from", "to",
    "in", "on", "at", "by", "but", "or", "nor", "so", "yet", "a", "an",
    "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "shall", "should", "can", "could", "may", "might",
    "must", "ought", "i", "me", "my", "mine", "you", "your", "yours",
    "we", "us", "our", "ours", "he", "him", "his", "she", "her", "hers",
    "they", "them", "their", "theirs", "what", "which", "who", "whom",
    "whose", "when", "where", "why", "how", "if", "then", "else", "because",
  ]);

  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const counts: { [word: string]: number } = {};
  for (const word of words) {
    counts[word] = (counts[word] || 0) + 1;
  }
  return counts;
}

// Helper: Analyze tone based on vocabulary and punctuation
function analyzeTone(text: string): "formal" | "casual" | "academic" | "friendly" {
  const lower = text.toLowerCase();
  let formalCount = 0;
  let casualCount = 0;
  let academicCount = 0;

  const formalWords = ["therefore", "however", "furthermore", "additionally", "consequently", "nevertheless"];
  const casualWords = ["lol", "yeah", "gonna", "wanna", "dude", "guys", "totally", "super"];
  const academicWords = ["hypothesis", "methodology", "analysis", "findings", "research", "literature"];

  for (const w of formalWords) if (lower.includes(w)) formalCount++;
  for (const w of casualWords) if (lower.includes(w)) casualCount++;
  for (const w of academicWords) if (lower.includes(w)) academicCount++;

  if (academicCount >= formalCount && academicCount >= casualCount) return "academic";
  if (formalCount > casualCount) return "formal";
  if (casualCount > formalCount) return "casual";
  return "friendly";
}

export function analyzeDocumentStyle(text: string): DocumentStyleProfile {
  // 1. Average sentence length
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const totalWords = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0);
  const averageSentenceLength = sentences.length ? Math.round(totalWords / sentences.length) : 15;

  // 2. Paragraph structure
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  const avgParaLength = paragraphs.length 
    ? paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length 
    : 50;
  const paragraphStructure = avgParaLength < 50 ? "short" : avgParaLength < 150 ? "medium" : "long";

  // 3. Common phrases (top 20)
  const wordCounts = extractWordFrequencies(text);
  const commonPhrases = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  // 4. Default industry, audience (can be refined later)
  const industry = "general";
  const audience = "general";
  const tone = analyzeTone(text);

  return {
    industry,
    tone,
    audience,
    commonPhrases,
    averageSentenceLength,
    paragraphStructure,
  };
}

export function convertToBrandVoiceProfile(style: DocumentStyleProfile): Partial<BrandVoiceProfile> {
  return {
    industry: style.industry,
    tone: style.tone,
    audience: style.audience,
    commonPhrases: style.commonPhrases,
  };
}
