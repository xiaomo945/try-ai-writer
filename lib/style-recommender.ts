import { BrandVoiceProfile } from "./brand-voice";

export function recommendStyle(profile: BrandVoiceProfile, sampleCount: number): string {
  const recommendations = [
    "Your style is very consistent! Consider adding more personal anecdotes to make your content feel more relatable.",
    "Your tone is great for professional. You could experiment with more varied sentence structures to keep your writing more dynamic.",
    "You have a strong voice. Try adding more rhetorical questions to engage your readers more actively.",
    "Your writing is very clear. Consider adding a bit more emotional language to create deeper connections with your audience.",
    "Your style is very consistent. Try varying your paragraph lengths to create a more natural, conversational rhythm.",
  ];

  // Add specific recommendations based on tone
  if (profile.tone === "formal") {
    recommendations.push("Your formal tone works well for your industry! Adding occasional light metaphors can help your content feel more approachable without sacrificing professionalism.");
  }
  if (profile.tone === "casual") {
    recommendations.push("Your casual tone is great! For important announcements, consider toggling to a slightly more professional tone for key messages.");
  }

  if (sampleCount < 5) {
    recommendations.push("You're just getting started! Upload more samples to help AI better understand your unique voice.");
  }

  return recommendations[Math.floor(Math.random() * recommendations.length)]!;
}
