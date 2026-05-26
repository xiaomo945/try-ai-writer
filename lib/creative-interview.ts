import { BrandVoiceProfile } from './brand-voice';
import type { MemoryItem } from './memory-bank';
import { getPersonaGreeting, getPersonaQuestions } from './digital-twin-persona';

export interface InterviewResult {
  needsInterview: boolean;
  greeting: string;
  questions: string[];
  enhancedPrompt?: string;
  triggerReason?: string;
  questionCount?: number;
  contextualHints?: Record<number, string>;
}

interface TransitionPhrase {
  prefix: string;
  followUp?: string;
}

const TRANSITION_PHRASES: TransitionPhrase[] = [
  { prefix: "好问题！让我想想...", followUp: "关于这个方面" },
  { prefix: "明白了！让我再确认一下...", followUp: "关于这一点" },
  { prefix: "有意思！让我深入了解一下...", followUp: "接着这个话题" },
  { prefix: "让我帮你理清思路...", followUp: "关于这一点" },
  { prefix: "了解了，那关于...", followUp: "让我再问一下" },
];

const FOLLOW_UP_PHRASES = [
  "关于这一点，你还有什么想补充的吗？",
  "那这个细节能再展开说说吗？",
  "还有哪些方面需要考虑？",
];

function getRandomTransition(index: number): TransitionPhrase {
  const phraseIndex = index % TRANSITION_PHRASES.length;
  return TRANSITION_PHRASES[phraseIndex] as TransitionPhrase;
}

function hasKeyElements(prompt: string): boolean {
  const KEY_ELEMENTS = [
    '主题', '内容', '读者', '受众', '风格', '语气', '目的', '目标', '字数',
    'topic', 'content', 'audience', 'readers', 'style', 'tone', 'purpose', 'goal', 'word',
    '长度', '格式', '长度', '受众', '宣传', '推广', '介绍', '文章', '博客', '邮件'
  ];
  const lower = prompt.toLowerCase();
  return KEY_ELEMENTS.some(el => lower.includes(el.toLowerCase()));
}

function hasDetailedDescription(prompt: string): boolean {
  if (prompt.includes('：') || prompt.includes(':')) {
    const parts = prompt.split(/[：:]/);
    if (parts.length > 1 && parts[1] && parts[1].trim().length > 20) {
      return true;
    }
  }
  
  const sentences = prompt.split(/[.。!！?？\n]/);
  if (sentences.filter(s => s.trim().length > 10).length >= 2) {
    return true;
  }
  
  return false;
}

function countRelevantMemories(topic: string, memories: MemoryItem[]): number {
  if (!topic.trim() || !memories || memories.length === 0) return 0;
  
  const lowerTopic = topic.toLowerCase();
  return memories.filter(m => 
    m.keywords.some(k => k.toLowerCase().includes(lowerTopic)) ||
    m.content.toLowerCase().includes(lowerTopic)
  ).length;
}

function enrichQuestionsWithContext(
  questions: string[],
  previousAnswers: string[],
  memories: MemoryItem[]
): { questions: string[]; hints: Record<number, string> } {
  const enrichedQuestions: string[] = [];
  const contextualHints: Record<number, string> = {};
  
  questions.forEach((question, index) => {
    if (index === 0) {
      enrichedQuestions.push(question);
      return;
    }
    
    const transition = getRandomTransition(index);
    const prevAnswer = previousAnswers[index - 1];
    
    if (prevAnswer && prevAnswer.trim()) {
      const extractedKeyword = extractKeywordFromAnswer(prevAnswer);
      if (extractedKeyword) {
        contextualHints[index] = `基于你刚才提到的"${extractedKeyword}"`;
        enrichedQuestions.push(`${transition.followUp || transition.prefix}... ${question}`);
      } else {
        enrichedQuestions.push(`${transition.prefix} ${question}`);
      }
    } else {
      enrichedQuestions.push(question);
    }
  });
  
  return { questions: enrichedQuestions, hints: contextualHints };
}

function extractKeywordFromAnswer(answer: string): string | null {
  const cleaned = answer.trim();
  if (cleaned.length < 3) return null;
  
  const words = cleaned.split(/[\s,.!?;，。、；]+/).filter(w => w.length > 2);
  if (words.length > 0) {
    const lastWord = words[words.length - 1];
    return lastWord ? lastWord.slice(0, 15) : cleaned.slice(0, 15);
  }
  
  return cleaned.slice(0, 15);
}

export function interviewUser(
  prompt: string,
  mode: string,
  brandProfile?: BrandVoiceProfile,
  historicalViews?: string[],
  memories?: MemoryItem[]
): InterviewResult {
  const trimmedPrompt = prompt.trim();
  const greeting = getPersonaGreeting(brandProfile);
  const relevantMemoryCount = countRelevantMemories(trimmedPrompt, memories || []);
  
  const hasUserContext = relevantMemoryCount > 0 || (memories && memories.length >= 3);
  const hasBrandProfile = !!brandProfile;
  const userContextScore = (hasUserContext ? 1 : 0) + (hasBrandProfile ? 1 : 0);

  if (trimmedPrompt.length < 30) {
    const baseQuestions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
    const questionCount = hasUserContext ? 2 : 4;
    const questions = baseQuestions.slice(0, questionCount);
    
    return {
      needsInterview: true,
      greeting,
      questions,
      triggerReason: 'very_short',
      questionCount: questions.length
    };
  }

  if (trimmedPrompt.length >= 30 && trimmedPrompt.length <= 80) {
    if (!hasKeyElements(trimmedPrompt)) {
      const baseQuestions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
      const questionCount = hasUserContext ? 2 : 3;
      const questions = baseQuestions.slice(0, questionCount);
      
      return {
        needsInterview: true,
        greeting,
        questions,
        triggerReason: 'missing_elements',
        questionCount: questions.length
      };
    }
  }

  if (trimmedPrompt.length > 80 && hasKeyElements(trimmedPrompt)) {
    return {
      needsInterview: false,
      greeting,
      questions: [],
      triggerReason: 'detailed_prompt'
    };
  }

  if (trimmedPrompt.length >= 30 && trimmedPrompt.length <= 80 && hasKeyElements(trimmedPrompt)) {
    if (!hasDetailedDescription(trimmedPrompt)) {
      const baseQuestions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
      const questionCount = hasUserContext ? 2 : 2;
      const questions = baseQuestions.slice(0, questionCount);
      
      return {
        needsInterview: true,
        greeting,
        questions,
        triggerReason: 'light_interview',
        questionCount: questions.length
      };
    }
  }

  if (hasDetailedDescription(trimmedPrompt)) {
    return {
      needsInterview: false,
      greeting,
      questions: [],
      triggerReason: 'detailed_description'
    };
  }

  const baseQuestions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
  const questionCount = hasUserContext ? 2 : 2;
  return {
    needsInterview: true,
    greeting,
    questions: baseQuestions.slice(0, questionCount),
    triggerReason: 'default',
    questionCount: questionCount
  };
}

export function buildContextualFollowUp(
  questionIndex: number,
  previousAnswer: string,
  allPreviousAnswers: string[]
): string {
  const transition = getRandomTransition(questionIndex);
  const keyword = extractKeywordFromAnswer(previousAnswer);
  
  if (keyword && questionIndex > 0) {
    const randomFollowUp = FOLLOW_UP_PHRASES[Math.floor(Math.random() * FOLLOW_UP_PHRASES.length)];
    return `了解了，那关于"${keyword}"，${randomFollowUp}`;
  }
  
  return `${transition.prefix} ${transition.followUp || '让我再确认一下'}...`;
}
