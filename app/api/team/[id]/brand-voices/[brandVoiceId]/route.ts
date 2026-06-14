import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTeamBrandVoice, updateTeamBrandVoice, deleteTeamBrandVoice } from "@/lib/team/brand-voice-service";
import { isTeamMember, hasPermission } from "@/lib/team/service";
import { UpdateTeamBrandVoiceRequest } from "@/lib/team/brand-voice";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; brandVoiceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId, brandVoiceId } = await params;

    // Check if user is team member
    const isMember = await isTeamMember(teamId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const brandVoice = await getTeamBrandVoice(brandVoiceId);
    if (!brandVoice || brandVoice.teamId !== teamId) {
      return NextResponse.json({ error: "Brand voice not found" }, { status: 404 });
    }

    return NextResponse.json({ brandVoice });
  } catch (error) {
    console.error("Get team brand voice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; brandVoiceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId, brandVoiceId } = await params;

    // Check if user has permission
    const canManage = await hasPermission(teamId, session.user.id, "canManageBrandVoice");
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = UpdateTeamBrandVoiceRequest.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const brandVoice = await getTeamBrandVoice(brandVoiceId);
    if (!brandVoice || brandVoice.teamId !== teamId) {
      return NextResponse.json({ error: "Brand voice not found" }, { status: 404 });
    }

    const updated = await updateTeamBrandVoice(brandVoiceId, validation.data);
    return NextResponse.json({ brandVoice: updated });
  } catch (error) {
    console.error("Update team brand voice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; brandVoiceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId, brandVoiceId } = await params;

    // Check if user has permission
    const canManage = await hasPermission(teamId, session.user.id, "canManageBrandVoice");
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const brandVoice = await getTeamBrandVoice(brandVoiceId);
    if (!brandVoice || brandVoice.teamId !== teamId) {
      return NextResponse.json({ error: "Brand voice not found" }, { status: 404 });
    }

    await deleteTeamBrandVoice(brandVoiceId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete team brand voice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
