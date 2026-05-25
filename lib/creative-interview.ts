import { BrandVoiceProfile } from './brand-voice';
import { getPersonaGreeting, getPersonaQuestions } from './digital-twin-persona';

export interface InterviewResult {
  needsInterview: boolean;
  greeting: string;
  questions: string[];
  enhancedPrompt?: string;
}

export function interviewUser(
  prompt: string,
  mode: string,
  brandProfile?: BrandVoiceProfile,
  historicalViews?: string[]
): InterviewResult {
  const trimmedPrompt = prompt.trim();
  const isDetailedEnough = trimmedPrompt.length >= 50;

  const greeting = getPersonaGreeting(brandProfile);

  if (isDetailedEnough) {
    return {
      needsInterview: false,
      greeting,
      questions: [],
    };
  }

  const questions = getPersonaQuestions(brandProfile, trimmedPrompt, historicalViews);

  return {
    needsInterview: true,
    greeting,
    questions: questions.slice(0, 5),
  };
}
