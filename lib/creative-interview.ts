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
}

const KEY_ELEMENTS = [
  '主题', '内容', '读者', '受众', '风格', '语气', '目的', '目标', '字数',
  'topic', 'content', 'audience', 'readers', 'style', 'tone', 'purpose', 'goal', 'word',
  '长度', '格式', '长度', '受众', '宣传', '推广', '介绍', '文章', '博客', '邮件'
];

function hasKeyElements(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return KEY_ELEMENTS.some(el => lower.includes(el.toLowerCase()));
}

function hasDetailedDescription(prompt: string): boolean {
  // Contains colon with content after
  if (prompt.includes('：') || prompt.includes(':')) {
    const parts = prompt.split(/[：:]/);
    if (parts.length > 1 && parts[1] && parts[1].trim().length > 20) {
      return true;
    }
  }
  
  // Contains multiple sentences or bullet points
  const sentences = prompt.split(/[.。!！?？\n]/);
  if (sentences.filter(s => s.trim().length > 10).length >= 2) {
    return true;
  }
  
  return false;
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
  
  // Very short prompt (< 30 chars) → always trigger interview
  if (trimmedPrompt.length < 30) {
    const questions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
    return {
      needsInterview: true,
      greeting,
      questions: questions.slice(0, 5),
      triggerReason: 'very_short',
      questionCount: 5
    };
  }
  
  // Medium prompt (30-80 chars) → check if missing key elements
  if (trimmedPrompt.length >= 30 && trimmedPrompt.length <= 80) {
    if (!hasKeyElements(trimmedPrompt)) {
      const questions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
      return {
        needsInterview: true,
        greeting,
        questions: questions.slice(0, 3),
        triggerReason: 'missing_elements',
        questionCount: 3
      };
    }
  }
  
  // Detailed prompt (> 80 chars) with key elements → skip interview
  if (trimmedPrompt.length > 80 && hasKeyElements(trimmedPrompt)) {
    return {
      needsInterview: false,
      greeting,
      questions: [],
      triggerReason: 'detailed_prompt'
    };
  }
  
  // Medium prompt (30-80 chars) with key elements but no detailed description → light interview
  if (trimmedPrompt.length >= 30 && trimmedPrompt.length <= 80 && hasKeyElements(trimmedPrompt)) {
    if (!hasDetailedDescription(trimmedPrompt)) {
      const questions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
      return {
        needsInterview: true,
        greeting,
        questions: questions.slice(0, 2),
        triggerReason: 'light_interview',
        questionCount: 2
      };
    }
  }
  
  // Has detailed description → skip interview
  if (hasDetailedDescription(trimmedPrompt)) {
    return {
      needsInterview: false,
      greeting,
      questions: [],
      triggerReason: 'detailed_description'
    };
  }
  
  // Default: light interview
  const questions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews, memories);
  return {
    needsInterview: true,
    greeting,
    questions: questions.slice(0, 2),
    triggerReason: 'default',
    questionCount: 2
  };
}
