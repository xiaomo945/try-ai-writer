import { BrandVoiceProfile } from './brand-voice';

export interface InterviewResult {
  needsInterview: boolean;
  questions: string[];
  enhancedPrompt?: string;
}

export function interviewUser(
  prompt: string,
  mode: string,
  brandProfile?: BrandVoiceProfile
): InterviewResult {
  // Check if prompt is detailed enough
  const trimmedPrompt = prompt.trim();
  const isDetailedEnough = trimmedPrompt.length >= 50;
  
  if (isDetailedEnough) {
    return {
      needsInterview: false,
      questions: [],
    };
  }

  const questions: string[] = [];

  // Generate mode-specific questions
  switch (mode) {
    case 'blog':
      questions.push("What's the main goal of this blog post? (e.g., educate, entertain, persuade)");
      questions.push("Who is your target audience? (e.g., newbies, experts, entrepreneurs)");
      questions.push("What key points or takeaways do you want to include?");
      questions.push("What tone should it have? (e.g., professional, casual, humorous)");
      questions.push("Approximately how many words should it be?");
      break;

    case 'email':
      questions.push("What's the main purpose of this email? (e.g., announcement, sales, follow-up)");
      questions.push("Who is the recipient? (e.g., subscribers, customers, leads)");
      questions.push("What action do you want them to take after reading?");
      questions.push("What tone should it have? (e.g., friendly, professional, urgent)");
      questions.push("Approximately how long should it be?");
      break;

    case 'social':
      questions.push("Which platform is this for? (e.g., LinkedIn, Twitter/X, Instagram)");
      questions.push("What's the main message you want to convey?");
      questions.push("What tone should it have? (e.g., professional, casual, witty)");
      questions.push("Do you want to include any specific hashtags or calls to action?");
      break;

    case 'custom':
    default:
      questions.push("What's the main goal of your writing?");
      questions.push("Who is your target audience?");
      questions.push("What key points do you want to include?");
      questions.push("What tone or style should it have?");
      questions.push("Any specific requirements or constraints?");
      break;
  }

  // Add questions based on brand profile
  if (brandProfile) {
    if (!brandProfile.industry) {
      questions.push("What industry or niche is this for?");
    }
    if (!brandProfile.tone) {
      questions.push("What tone do you typically use for your writing?");
    }
  }

  return {
    needsInterview: true,
    questions: questions.slice(0, 5), // Limit to 5 questions max
  };
}
