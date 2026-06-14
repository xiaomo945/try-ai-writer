import { Team, TeamMember, TeamInvitation, TeamRoleType, CreateTeamRequest, InviteMemberRequest, TeamPermission, hasPermission as checkRolePermission } from "./types";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const teams = new Map<string, Team>();
const teamMembers = new Map<string, TeamMember[]>();
const teamInvitations = new Map<string, TeamInvitation>();
const invitationsByToken = new Map<string, string>();

// Team operations
export async function createTeam(ownerId: string, request: CreateTeamRequest): Promise<Team> {
  const team: Team = {
    id: randomUUID(),
    name: request.name,
    ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  teams.set(team.id, team);

  // Add owner as admin member
  const ownerMember: TeamMember = {
    id: randomUUID(),
    teamId: team.id,
    userId: ownerId,
    role: "admin",
    joinedAt: new Date(),
  };

  teamMembers.set(team.id, [ownerMember]);

  return team;
}

export async function getTeam(teamId: string): Promise<Team | null> {
  return teams.get(teamId) || null;
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<Team | null> {
  const team = teams.get(teamId);
  if (!team) return null;

  const updated = { ...team, ...updates, updatedAt: new Date() };
  teams.set(teamId, updated);
  return updated;
}

export async function deleteTeam(teamId: string): Promise<boolean> {
  teams.delete(teamId);
  teamMembers.delete(teamId);
  return true;
}

// Member operations
export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return teamMembers.get(teamId) || [];
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  role: TeamRoleType,
  invitedBy?: string
): Promise<TeamMember> {
  const members = teamMembers.get(teamId) || [];

  // Check if already a member
  const existing = members.find((m) => m.userId === userId);
  if (existing) {
    return existing;
  }

  const member: TeamMember = {
    id: randomUUID(),
    teamId,
    userId,
    role,
    joinedAt: new Date(),
    invitedBy,
  };

  members.push(member);
  teamMembers.set(teamId, members);
  return member;
}

export async function updateMemberRole(
  teamId: string,
  userId: string,
  role: TeamRoleType
): Promise<TeamMember | null> {
  const members = teamMembers.get(teamId) || [];
  const member = members.find((m) => m.userId === userId);

  if (!member) return null;

  member.role = role;
  teamMembers.set(teamId, members);
  return member;
}

export async function removeTeamMember(teamId: string, userId: string): Promise<boolean> {
  const members = teamMembers.get(teamId) || [];
  const filtered = members.filter((m) => m.userId !== userId);
  teamMembers.set(teamId, filtered);
  return true;
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  const userTeamIds: string[] = [];

  teamMembers.forEach((members, teamId) => {
    if (members.some((m) => m.userId === userId)) {
      userTeamIds.push(teamId);
    }
  });

  return userTeamIds.map((id) => teams.get(id)!).filter(Boolean);
}

export async function getUserRoleInTeam(teamId: string, userId: string): Promise<TeamRoleType | null> {
  const members = teamMembers.get(teamId) || [];
  const member = members.find((m) => m.userId === userId);
  return member?.role || null;
}

// Invitation operations
export async function createInvitation(
  teamId: string,
  email: string,
  role: TeamRoleType,
  invitedBy: string
): Promise<TeamInvitation> {
  const token = randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  const invitation: TeamInvitation = {
    id: randomUUID(),
    teamId,
    email,
    role,
    invitedBy,
    token,
    expiresAt,
    createdAt: new Date(),
  };

  teamInvitations.set(invitation.id, invitation);
  invitationsByToken.set(token, invitation.id);

  return invitation;
}

export async function getInvitationByToken(token: string): Promise<TeamInvitation | null> {
  const invitationId = invitationsByToken.get(token);
  if (!invitationId) return null;

  const invitation = teamInvitations.get(invitationId);
  if (!invitation) return null;

  // Check if expired
  if (invitation.expiresAt < new Date()) {
    return null;
  }

  // Check if already accepted
  if (invitation.acceptedAt) {
    return null;
  }

  return invitation;
}

export async function acceptInvitation(token: string, userId: string): Promise<TeamMember | null> {
  const invitation = await getInvitationByToken(token);
  if (!invitation) return null;

  // Add user to team
  const member = await addTeamMember(
    invitation.teamId,
    userId,
    invitation.role,
    invitation.invitedBy
  );

  // Mark invitation as accepted
  invitation.acceptedAt = new Date();
  teamInvitations.set(invitation.id, invitation);

  return member;
}

export async function getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  const invitations: TeamInvitation[] = [];
  teamInvitations.forEach((inv) => {
    if (inv.teamId === teamId) {
      invitations.push(inv);
    }
  });
  return invitations;
}

export async function deleteInvitation(invitationId: string): Promise<boolean> {
  const invitation = teamInvitations.get(invitationId);
  if (invitation) {
    invitationsByToken.delete(invitation.token);
    teamInvitations.delete(invitationId);
  }
  return true;
}

// Permission checks
export async function isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
  const role = await getUserRoleInTeam(teamId, userId);
  return role === "admin";
}

export async function canManageTeam(teamId: string, userId: string): Promise<boolean> {
  return isTeamAdmin(teamId, userId);
}

export async function canManageMembers(teamId: string, userId: string): Promise<boolean> {
  return isTeamAdmin(teamId, userId);
}

export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const role = await getUserRoleInTeam(teamId, userId);
  return role !== null;
}

export async function hasPermission(
  teamId: string,
  userId: string,
  permission: TeamPermission
): Promise<boolean> {
  const role = await getUserRoleInTeam(teamId, userId);
  if (!role) return false;
  return checkRolePermission(role, permission);
}
