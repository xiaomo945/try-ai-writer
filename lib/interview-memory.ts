export interface InterviewRecord {
  question: string;
  answer: string;
  topic: string;
  timestamp: string;
}

const INTERVIEW_MEMORY_KEY = "use-ai-writer-interview-memory";

function readInterviewRecords(): InterviewRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INTERVIEW_MEMORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InterviewRecord[];
  } catch {
    return [];
  }
}

function writeInterviewRecords(records: InterviewRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = records.slice(0, 200);
    localStorage.setItem(INTERVIEW_MEMORY_KEY, JSON.stringify(trimmed));
  } catch {
    // storage full
  }
}

export function rememberInterviewAnswers(
  questions: string[],
  answers: string[],
  topic: string
): void {
  if (!questions || !answers) return;
  const records = readInterviewRecords();

  for (let i = 0; i < questions.length; i++) {
    const answer = answers[i];
    if (!answer || !answer.trim()) continue;

    records.push({
      question: questions[i] || "",
      answer: answer.trim(),
      topic: topic.trim(),
      timestamp: new Date().toISOString(),
    });
  }

  writeInterviewRecords(records);
}

export function getPreviousInterviewTopics(): string[] {
  const records = readInterviewRecords();
  const topics = records.map((r) => r.topic).filter((t) => t.length > 0);
  return [...new Set(topics)];
}

export function getPreviousInterviewQuestions(): string[] {
  const records = readInterviewRecords();
  return records.map((r) => r.question);
}

export function hasInterviewedAbout(topic: string): boolean {
  const records = readInterviewRecords();
  const lowerTopic = topic.toLowerCase();
  return records.some(
    (r) =>
      r.topic.toLowerCase().includes(lowerTopic) ||
      lowerTopic.includes(r.topic.toLowerCase())
  );
}

export function calculateTopicSimilarity(topic1: string, topic2: string): number {
  const words1 = topic1.toLowerCase().split(/[\s,.!?;，。！？；]+/).filter((w) => w.length > 2);
  const words2 = topic2.toLowerCase().split(/[\s,.!?;，。！？；]+/).filter((w) => w.length > 2);

  if (words1.length === 0 || words2.length === 0) return 0;

  let matches = 0;
  for (const w1 of words1) {
    for (const w2 of words2) {
      if (w1 === w2 || w1.includes(w2) || w2.includes(w1)) {
        matches++;
        break;
      }
    }
  }

  return matches / Math.max(words1.length, words2.length);
}

export function findSimilarPreviousTopic(currentTopic: string): string | null {
  const previousTopics = getPreviousInterviewTopics();
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const prev of previousTopics) {
    const score = calculateTopicSimilarity(currentTopic, prev);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = prev;
    }
  }

  return bestScore >= 0.7 ? bestMatch : null;
}

export function clearInterviewMemory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(INTERVIEW_MEMORY_KEY);
}
