export function extractKeyPoints(content: string): string[] {
  const keyPoints: string[] = [];
  const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  
  const indicators = [
    "我认为", "我觉得", "我相信", "我主张", "我建议", "首先", "其次", "最后", "结论是", "总之",
    "最重要的是", "关键是", "因此", "所以", "由此可见",
    "I think", "I believe", "I argue", "I suggest", "I propose",
    "First", "Second", "Finally", "In conclusion", "In summary",
    "The key is", "The most important thing is", "Therefore", "Thus",
  ];

  for (const sentence of sentences) {
    const hasIndicator = indicators.some(indicator => 
      sentence.toLowerCase().includes(indicator.toLowerCase())
    );
    if (hasIndicator && sentence.length > 20) {
      keyPoints.push(sentence);
      if (keyPoints.length >= 5) break; // max 5 key points
    }
  }

  return keyPoints;
}

export function extractCommonPhrases(samples: { content: string }[]): string[] {
  const wordCount: Record<string, number> = {};
  const stopWords = new Set([
    "the", "and", "is", "in", "to", "a", "of", "for", "on", "with", 
    "that", "this", "by", "from", "at", "it", "as", "but", "we", 
    "you", "they", "i", "me", "my", "your", "his", "her", "its",
    "的", "是", "在", "和", "了", "也", "都", "就", "不", "很",
  ]);

  for (const sample of samples) {
    const words = sample.content
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2);

    for (const word of words) {
      if (!stopWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    }
  }

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);
}
