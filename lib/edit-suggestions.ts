import { BrandVoiceProfile } from './brand-voice';

export interface EditSuggestion {
  id: string;
  label: string;
  prompt: string;
  iconName: string;
}

export function getEditSuggestions(
  content: string,
  profile?: BrandVoiceProfile | null
): EditSuggestion[] {
  const baseSuggestions: EditSuggestion[] = [
    {
      id: 'shorter',
      label: 'Make Shorter',
      prompt: 'Shorten this text while preserving key information and keeping the tone unchanged:\n',
      iconName: 'Scissors',
    },
    {
      id: 'longer',
      label: 'Make Longer',
      prompt: 'Expand this text with more details, examples, or explanations while keeping the tone and style unchanged:\n',
      iconName: 'Plus',
    },
    {
      id: 'formal',
      label: 'More Formal',
      prompt: 'Rewrite this text in a more formal, professional tone:\n',
      iconName: 'Briefcase',
    },
    {
      id: 'casual',
      label: 'More Casual',
      prompt: 'Rewrite this text in a more casual, conversational tone:\n',
      iconName: 'MessageCircle',
    },
    {
      id: 'grammar',
      label: 'Fix Grammar',
      prompt: 'Check this text for grammar, spelling, and punctuation errors, and fix them while preserving the original meaning:\n',
      iconName: 'CheckCircle2',
    },
    {
      id: 'add-examples',
      label: 'Add Examples',
      prompt: 'Add 1-2 relevant real-world examples to this text to make it more concrete:\n',
      iconName: 'Lightbulb',
    },
  ];
  
  if (profile) {
    const additionalSuggestion: EditSuggestion = {
      id: 'align-voice',
      label: 'Match Brand Voice',
      prompt: `Rewrite this text to match the following brand voice: Industry: ${profile.industry}, Tone: ${profile.tone}, Audience: ${profile.audience}. Here's the text:\n`,
      iconName: 'Sparkles',
    };
    return [additionalSuggestion, ...baseSuggestions];
  }
  
  return baseSuggestions;
}
