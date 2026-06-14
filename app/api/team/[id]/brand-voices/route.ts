import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTeamBrandVoices, createTeamBrandVoice } from "@/lib/team/brand-voice-service";
import { isTeamMember, hasPermission } from "@/lib/team/service";
import { CreateTeamBrandVoiceRequest } from "@/lib/team/brand-voice";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;

    // Check if user is team member
    const isMember = await isTeamMember(teamId, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const brandVoices = await getTeamBrandVoices(teamId);
    return NextResponse.json({ brandVoices });
  } catch (error) {
    console.error("Get team brand voices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: teamId } = await params;

    // Check if user has permission
    const canManage = await hasPermission(teamId, session.user.id, "canManageBrandVoice");
    if (!canManage) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = CreateTeamBrandVoiceRequest.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const brandVoice = await createTeamBrandVoice(teamId, session.user.id, validation.data);
    return NextResponse.json({ brandVoice }, { status: 201 });
  } catch (error) {
    console.error("Create team brand voice error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
