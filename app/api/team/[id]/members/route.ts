import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getTeamMembers,
  addTeamMember,
  updateMemberRole,
  removeTeamMember,
  canManageMembers,
} from "@/lib/team/service";
import { TeamRole } from "@/lib/team/types";

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

    const members = await getTeamMembers(id);
    return NextResponse.json({ members });
  } catch (error) {
    console.error("Failed to fetch team members:", error);
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
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required fields: userId, role" },
        { status: 400 }
      );
    }

    if (!Object.values(TeamRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const member = await addTeamMember(id, userId, role, session.user.id);
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Failed to add team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
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
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "Missing required fields: userId, role" },
        { status: 400 }
      );
    }

    if (!Object.values(TeamRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const member = await updateMemberRole(id, userId, role);
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Failed to update team member:", error);
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
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      );
    }

    await removeTeamMember(id, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to remove team member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
