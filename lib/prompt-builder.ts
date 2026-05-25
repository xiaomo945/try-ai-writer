import { BrandVoiceProfile } from './brand-voice';

export function buildEnhancedPrompt(
  originalPrompt: string,
  answers: string[],
  questions: string[],
  mode: string,
  brandProfile?: BrandVoiceProfile
): string {
  const modeInstructions: Record<string, string> = {
    blog: "Write a well-structured, engaging blog post that's easy to read and provides value.",
    email: "Write a concise, effective email with a clear subject line and strong call to action.",
    social: "Write engaging social media content optimized for the specified platform.",
    custom: "Write well-structured content that meets the user's requirements.",
  };

  let prompt = `${modeInstructions[mode] || modeInstructions.custom}

## Original Request:
${originalPrompt}

## Additional Details:
`;

  // Add question and answer pairs
  questions.forEach((question, index) => {
    if (answers[index]?.trim()) {
      prompt += `${question}\n${answers[index]}\n\n`;
    }
  });

  // Add brand voice instructions if available
  if (brandProfile) {
    prompt += "## Brand Voice Guidelines:\n";
    if (brandProfile.industry) {
      prompt += `- Industry/Niche: ${brandProfile.industry}\n`;
    }
    if (brandProfile.tone) {
      prompt += `- Tone: ${brandProfile.tone}\n`;
    }
    if (brandProfile.audience) {
      prompt += `- Target Audience: ${brandProfile.audience}\n`;
    }
    if (brandProfile.commonPhrases && brandProfile.commonPhrases.length > 0) {
      prompt += `- Common Phrases: ${brandProfile.commonPhrases.join(", ")}\n`;
    }
  }

  prompt += "\nPlease write the content in a natural, human-like voice, avoiding generic AI-sounding phrases. Make it authentic and engaging.";

  return prompt;
}
