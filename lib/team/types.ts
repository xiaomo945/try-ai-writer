import { z } from "zod";

// Team member roles
export const TeamRole = {
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer",
} as const;

export type TeamRoleType = (typeof TeamRole)[keyof typeof TeamRole];

// Team schema
export const TeamSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  ownerId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Team = z.infer<typeof TeamSchema>;

// Team member schema
export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum([TeamRole.ADMIN, TeamRole.EDITOR, TeamRole.VIEWER]),
  joinedAt: z.date(),
  invitedBy: z.string().uuid().optional(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

// Team invitation schema
export const TeamInvitationSchema = z.object({
  id: z.string().uuid(),
  teamId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum([TeamRole.ADMIN, TeamRole.EDITOR, TeamRole.VIEWER]),
  invitedBy: z.string().uuid(),
  token: z.string(),
  expiresAt: z.date(),
  acceptedAt: z.date().optional(),
  createdAt: z.date(),
});

export type TeamInvitation = z.infer<typeof TeamInvitationSchema>;

// Create team request
export const CreateTeamRequest = z.object({
  name: z.string().min(1).max(100),
});

export type CreateTeamRequest = z.infer<typeof CreateTeamRequest>;

// Update team request
export const UpdateTeamRequest = z.object({
  name: z.string().min(1).max(100).optional(),
});

export type UpdateTeamRequest = z.infer<typeof UpdateTeamRequest>;

// Invite member request
export const InviteMemberRequest = z.object({
  email: z.string().email(),
  role: z.enum([TeamRole.ADMIN, TeamRole.EDITOR, TeamRole.VIEWER]),
});

export type InviteMemberRequest = z.infer<typeof InviteMemberRequest>;

// Team with members
export interface TeamWithMembers extends Team {
  members: (TeamMember & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  })[];
}

// Team member permissions
export const TeamPermissions = {
  [TeamRole.ADMIN]: {
    canManageTeam: true,
    canManageMembers: true,
    canManageBrandVoice: true,
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canViewAnalytics: true,
  },
  [TeamRole.EDITOR]: {
    canManageTeam: false,
    canManageMembers: false,
    canManageBrandVoice: true,
    canCreateContent: true,
    canEditContent: true,
    canDeleteContent: true,
    canViewAnalytics: true,
  },
  [TeamRole.VIEWER]: {
    canManageTeam: false,
    canManageMembers: false,
    canManageBrandVoice: false,
    canCreateContent: false,
    canEditContent: false,
    canDeleteContent: false,
    canViewAnalytics: true,
  },
} as const;

export type TeamPermission = keyof typeof TeamPermissions[TeamRoleType];

export function hasPermission(
  role: TeamRoleType,
  permission: TeamPermission
): boolean {
  return TeamPermissions[role][permission] ?? false;
}
