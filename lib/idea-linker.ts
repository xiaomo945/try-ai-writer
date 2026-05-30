import type { MemoryItem } from "./memory-bank";

export interface RelatedIdea {
  memory: MemoryItem;
  relevanceScore: number;
  matchedKeywords: string[];
}

function extractKeywords(text: string): string[] {
  if (!text) return [];
  const words = text
    .split(/[\s,.!?;，。！？；、：:]+/)
    .filter((word) => word.length > 2);
  return [...new Set(words.map((w) => w.toLowerCase()))];
}

function calculateTimeDecay(createdAt: string): number {
  const now = Date.now();
  const created = new Date(createdAt).getTime();
  const daysDiff = (now - created) / (1000 * 60 * 60 * 24);
  return Math.max(0.1, 1 / (1 + daysDiff * 0.05));
}

function calculateKeywordOverlap(
  promptKeywords: string[],
  memoryKeywords: string[]
): { score: number; matched: string[] } {
  const matched: string[] = [];
  for (const pk of promptKeywords) {
    for (const mk of memoryKeywords) {
      if (pk === mk || pk.includes(mk) || mk.includes(pk)) {
        matched.push(mk);
        break;
      }
    }
  }

  if (promptKeywords.length === 0) return { score: 0, matched: [] };
  return {
    score: matched.length / promptKeywords.length,
    matched,
  };
}

export function findRelatedIdeas(
  currentPrompt: string,
  memories: MemoryItem[],
  maxResults: number = 3
): RelatedIdea[] {
  if (!currentPrompt || currentPrompt.trim().length < 10 || !memories || memories.length === 0) {
    return [];
  }

  const promptKeywords = extractKeywords(currentPrompt);
  if (promptKeywords.length === 0) return [];

  const scored: RelatedIdea[] = [];

  for (const memory of memories) {
    const { score: keywordScore, matched } = calculateKeywordOverlap(
      promptKeywords,
      memory.keywords
    );

    if (keywordScore === 0) {
      const contentLower = memory.content.toLowerCase();
      const anyMatch = promptKeywords.some((pk) => contentLower.includes(pk));
      if (!anyMatch) continue;

      const contentMatched = promptKeywords.filter((pk) => contentLower.includes(pk));
      const contentScore = contentMatched.length / Math.max(promptKeywords.length, 1);
      if (contentScore < 0.1) continue;

      scored.push({
        memory,
        relevanceScore: contentScore * 0.8 * calculateTimeDecay(memory.createdAt),
        matchedKeywords: contentMatched,
      });
      continue;
    }

    const timeDecay = calculateTimeDecay(memory.createdAt);
    const finalScore = keywordScore * 0.7 + timeDecay * 0.3;

    scored.push({
      memory,
      relevanceScore: finalScore,
      matchedKeywords: matched,
    });
  }

  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}
