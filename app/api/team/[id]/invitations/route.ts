import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createInvitation,
  getTeamInvitations,
  deleteInvitation,
  canManageMembers,
} from "@/lib/team/service";
import { InviteMemberRequest, TeamRole } from "@/lib/team/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitations = await getTeamInvitations(id);
    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Failed to fetch team invitations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canManage = await canManageMembers(id, session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validation = InviteMemberRequest.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const invitation = await createInvitation(
      id,
      validation.data.email,
      validation.data.role,
      session.user.id
    );

    // TODO: Send invitation email
    console.log(`Invitation created for ${invitation.email} with token: ${invitation.token}`);

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error("Failed to create invitation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const canManage = await canManageMembers(id, session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get("invitationId");

    if (!invitationId) {
      return NextResponse.json(
        { error: "Missing required parameter: invitationId" },
        { status: 400 }
      );
    }

    await deleteInvitation(invitationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete invitation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
