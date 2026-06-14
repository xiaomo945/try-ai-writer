import { z } from "zod";

// Team content schema
export const TeamContentSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  mode: z.string(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TeamContent = z.infer<typeof TeamContentSchema>;

// Create team content request
export const CreateTeamContentRequest = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  mode: z.string(),
  tags: z.array(z.string()).optional(),
});

export type CreateTeamContentRequest = z.infer<typeof CreateTeamContentRequest>;

// Update team content request
export const UpdateTeamContentRequest = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateTeamContentRequest = z.infer<typeof UpdateTeamContentRequest>;
