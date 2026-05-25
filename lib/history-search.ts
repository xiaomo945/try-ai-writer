export interface HistoryRecord {
  id: string;
  title: string;
  mode: string;
  result: string;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  createdAt: string;
}

function extractSnippet(text: string, query: string, contextLength: number = 100): string {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) {
    return text.slice(0, contextLength * 2) + (text.length > contextLength * 2 ? "..." : "");
  }
  
  const start = Math.max(0, index - contextLength);
  const end = Math.min(text.length, index + query.length + contextLength);
  
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  
  return snippet;
}

function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, "**$1**");
}

export function searchHistory(records: HistoryRecord[], query: string, limit: number = 10): SearchResult[] {
  if (!query.trim() || records.length === 0) {
    return records.slice(0, limit).map(record => ({
      id: record.id,
      title: record.title,
      snippet: extractSnippet(record.result, ""),
      createdAt: record.createdAt,
    }));
  }
  
  const lowerQuery = query.toLowerCase();
  const scoredRecords = records.map(record => {
    const titleMatch = record.title.toLowerCase().includes(lowerQuery);
    const contentMatch = record.result.toLowerCase().includes(lowerQuery);
    
    let score = 0;
    if (titleMatch) score += 10;
    if (contentMatch) score += 5;
    
    return { record, score };
  });
  
  scoredRecords.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.record.createdAt).getTime() - new Date(a.record.createdAt).getTime();
  });
  
  return scoredRecords.slice(0, limit).map(({ record }) => ({
    id: record.id,
    title: highlightMatch(record.title, query),
    snippet: highlightMatch(extractSnippet(record.result, query), query),
    createdAt: record.createdAt,
  }));
}
