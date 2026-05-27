import { BrandVoiceProfile } from './brand-voice';
import type { MemoryItem } from './memory-bank';
import { getPersonaGreeting, getPersonaQuestions } from './digital-twin-persona';

export interface InterviewQuestion {
  transition: string;
  question: string;
}

export interface InterviewResult {
  needsInterview: boolean;
  greeting: string;
  questions: InterviewQuestion[];
  enhancedPrompt?: string;
  triggerReason?: string;
  questionCount?: number;
}

const KEY_ELEMENTS = [
  '主题', '内容', '读者', '受众', '风格', '语气', '目的', '目标', '字数',
  'topic', 'content', 'audience', 'readers', 'style', 'tone', 'purpose', 'goal', 'word',
  '长度', '格式', '长度', '受众', '宣传', '推广', '介绍', '文章', '博客', '邮件'
];

const TRANSITION_PHRASES = [
  "Got it, let me ask you a few questions to understand better...",
  "Great question! To make this even better, I'd love to know...",
  "Interesting! Let me dig a little deeper...",
  "Perfect. One more thing I'm curious about...",
  "I see. Could you tell me about...",
  "Thanks for sharing! Just to clarify...",
  "That's helpful. Let's explore this more...",
  "Understood. One last thing...",
];

const FOLLOW_UP_TRANSITIONS = [
  "了解了，那关于",
  "明白了，继续聊聊",
  "有意思，再说说",
  "好的，关于",
];

function hasKeyElements(prompt: string): boolean {
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

function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/[^a-zA-Z\u4e00-\u9fa5]+/).filter(w => w.length >= 2);
  const stopWords = ['the', 'a', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'but', 'if', 'or', 'because', 'until', 'while', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'and', 'but', 'or', 'as', 'if', 'when', 'than', 'because', 'while', 'although', 'though', 'unless', 'until', 'whether', 'since', 'that', 'what', 'which', 'who', 'whom', 'this', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
  return words.filter(w => !stopWords.includes(w)).slice(0, 5);
}

function generateFollowUpTransition(previousAnswer: string): string {
  const keywords = extractKeywords(previousAnswer);
  if (keywords.length > 0) {
    const transitionIndex = Math.floor(Math.random() * FOLLOW_UP_TRANSITIONS.length);
    const transition = FOLLOW_UP_TRANSITIONS[transitionIndex];
    if (transition) {
      return `${transition}「${keywords[0]}」，`;
    }
  }
  const index = Math.floor(Math.random() * TRANSITION_PHRASES.length);
  const result = TRANSITION_PHRASES[index];
  return result !== undefined ? result : "Got it, let me ask you a few questions to understand better...";
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
  
  const hasMemories = memories && memories.length > 0;
  const hasRelevantMemories = hasMemories && memories.some(m => 
    trimmedPrompt.toLowerCase().includes(m.content.toLowerCase()) ||
    m.keywords.some(keyword => trimmedPrompt.toLowerCase().includes(keyword.toLowerCase()))
  );

  let baseQuestionCount = hasRelevantMemories ? 2 : hasMemories ? 3 : 4;

  if (trimmedPrompt.length < 30) {
    const rawQuestions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
    const questions = formatQuestions(rawQuestions, baseQuestionCount);
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
      const rawQuestions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
      const questions = formatQuestions(rawQuestions, Math.max(2, baseQuestionCount - 1));
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
      const rawQuestions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
      const questions = formatQuestions(rawQuestions, Math.max(1, baseQuestionCount - 2));
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
  
  const rawQuestions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
  const questions = formatQuestions(rawQuestions, Math.max(2, baseQuestionCount - 1));
  return {
    needsInterview: true,
    greeting,
    questions,
    triggerReason: 'default',
    questionCount: questions.length
  };
}

function formatQuestions(rawQuestions: string[], count: number): InterviewQuestion[] {
  const questions = rawQuestions.slice(0, Math.min(count, rawQuestions.length));
  
  return questions.map((question, index) => {
    let transition: string;
    const randomIndex = Math.floor(Math.random() * TRANSITION_PHRASES.length);
    
    if (index === 0) {
      transition = TRANSITION_PHRASES[randomIndex] ?? "Let's start with a few questions to understand your needs better...";
    } else {
      transition = TRANSITION_PHRASES[randomIndex] ?? "Great, another question for you...";
    }
    
    return {
      transition,
      question
    };
  });
}
