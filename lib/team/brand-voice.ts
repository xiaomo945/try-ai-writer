import { z } from "zod";

// Team brand voice schema
export const TeamBrandVoiceSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  name: z.string().min(1).max(100),
  industry: z.string(),
  tone: z.string(),
  audience: z.string(),
  commonPhrases: z.array(z.string()),
  styleFingerprint: z.any().optional(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TeamBrandVoice = z.infer<typeof TeamBrandVoiceSchema>;

// Create team brand voice request
export const CreateTeamBrandVoiceRequest = z.object({
  name: z.string().min(1).max(100),
  industry: z.string(),
  tone: z.string(),
  audience: z.string(),
  commonPhrases: z.array(z.string()).optional(),
  styleFingerprint: z.any().optional(),
});

export type CreateTeamBrandVoiceRequest = z.infer<typeof CreateTeamBrandVoiceRequest>;

// Update team brand voice request
export const UpdateTeamBrandVoiceRequest = z.object({
  name: z.string().min(1).max(100).optional(),
  industry: z.string().optional(),
  tone: z.string().optional(),
  audience: z.string().optional(),
  commonPhrases: z.array(z.string()).optional(),
  styleFingerprint: z.any().optional(),
});

export type UpdateTeamBrandVoiceRequest = z.infer<typeof UpdateTeamBrandVoiceRequest>;
