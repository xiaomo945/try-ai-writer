import { TeamBrandVoice, CreateTeamBrandVoiceRequest, UpdateTeamBrandVoiceRequest } from "./brand-voice";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const teamBrandVoices = new Map<string, TeamBrandVoice[]>();

// Get all brand voices for a team
export async function getTeamBrandVoices(teamId: string): Promise<TeamBrandVoice[]> {
  return teamBrandVoices.get(teamId) || [];
}

// Get a specific brand voice
export async function getTeamBrandVoice(brandVoiceId: string): Promise<TeamBrandVoice | null> {
  for (const voices of teamBrandVoices.values()) {
    const voice = voices.find((v) => v.id === brandVoiceId);
    if (voice) return voice;
  }
  return null;
}

// Create a new brand voice for a team
export async function createTeamBrandVoice(
  teamId: string,
  userId: string,
  request: CreateTeamBrandVoiceRequest
): Promise<TeamBrandVoice> {
  const voices = teamBrandVoices.get(teamId) || [];

  const brandVoice: TeamBrandVoice = {
    id: randomUUID(),
    teamId,
    name: request.name,
    industry: request.industry,
    tone: request.tone,
    audience: request.audience,
    commonPhrases: request.commonPhrases || [],
    styleFingerprint: request.styleFingerprint,
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  voices.push(brandVoice);
  teamBrandVoices.set(teamId, voices);

  return brandVoice;
}

// Update a brand voice
export async function updateTeamBrandVoice(
  brandVoiceId: string,
  updates: UpdateTeamBrandVoiceRequest
): Promise<TeamBrandVoice | null> {
  for (const [teamId, voices] of teamBrandVoices.entries()) {
    const index = voices.findIndex((v) => v.id === brandVoiceId);
    if (index !== -1) {
      const original = voices[index]!;
      const updated: TeamBrandVoice = {
        ...original,
        ...updates,
        updatedAt: new Date(),
      };
      voices[index] = updated;
      teamBrandVoices.set(teamId, voices);
      return updated;
    }
  }
  return null;
}

// Delete a brand voice
export async function deleteTeamBrandVoice(brandVoiceId: string): Promise<boolean> {
  for (const [teamId, voices] of teamBrandVoices.entries()) {
    const index = voices.findIndex((v) => v.id === brandVoiceId);
    if (index !== -1) {
      voices.splice(index, 1);
      teamBrandVoices.set(teamId, voices);
      return true;
    }
  }
  return false;
}
