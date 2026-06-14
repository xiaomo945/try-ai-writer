import { TeamContent, CreateTeamContentRequest, UpdateTeamContentRequest } from "./content";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const teamContents = new Map<string, TeamContent[]>();

// Get all content for a team
export async function getTeamContents(teamId: string): Promise<TeamContent[]> {
  return teamContents.get(teamId) || [];
}

// Get content by ID
export async function getTeamContent(contentId: string): Promise<TeamContent | null> {
  for (const contents of teamContents.values()) {
    const content = contents.find((c) => c.id === contentId);
    if (content) return content;
  }
  return null;
}

// Create new content
export async function createTeamContent(
  teamId: string,
  userId: string,
  request: CreateTeamContentRequest
): Promise<TeamContent> {
  const contents = teamContents.get(teamId) || [];

  const content: TeamContent = {
    id: randomUUID(),
    teamId,
    userId,
    title: request.title,
    content: request.content,
    mode: request.mode,
    tags: request.tags || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  contents.push(content);
  teamContents.set(teamId, contents);

  return content;
}

// Update content
export async function updateTeamContent(
  contentId: string,
  updates: UpdateTeamContentRequest
): Promise<TeamContent | null> {
  for (const [teamId, contents] of teamContents.entries()) {
    const index = contents.findIndex((c) => c.id === contentId);
    if (index !== -1) {
      const original = contents[index]!;
      const updated: TeamContent = {
        ...original,
        ...updates,
        updatedAt: new Date(),
      };
      contents[index] = updated;
      teamContents.set(teamId, contents);
      return updated;
    }
  }
  return null;
}

// Delete content
export async function deleteTeamContent(contentId: string): Promise<boolean> {
  for (const [teamId, contents] of teamContents.entries()) {
    const index = contents.findIndex((c) => c.id === contentId);
    if (index !== -1) {
      contents.splice(index, 1);
      teamContents.set(teamId, contents);
      return true;
    }
  }
  return false;
}

// Get content by user
export async function getTeamContentsByUser(
  teamId: string,
  userId: string
): Promise<TeamContent[]> {
  const contents = teamContents.get(teamId) || [];
  return contents.filter((c) => c.userId === userId);
}

// Search content by tags
export async function getTeamContentsByTags(
  teamId: string,
  tags: string[]
): Promise<TeamContent[]> {
  const contents = teamContents.get(teamId) || [];
  return contents.filter((c) => c.tags && c.tags.some((tag) => tags.includes(tag)));
}
