import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isTeamMember, hasPermission } from "@/lib/team/service";
import { getTeamContent, updateTeamContent, deleteTeamContent } from "@/lib/team/content-service";
import { UpdateTeamContentRequest } from "@/lib/team/content";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: teamId, contentId } = await params;

  const isMember = await isTeamMember(teamId, session.user.id);
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const content = await getTeamContent(contentId);
  if (!content || content.teamId !== teamId) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  return NextResponse.json({ content });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: teamId, contentId } = await params;

  const content = await getTeamContent(contentId);
  if (!content || content.teamId !== teamId) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const canEdit = await hasPermission(teamId, session.user.id, "canEditContent");
  const isOwner = content.userId === session.user.id;
  if (!canEdit && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const validation = UpdateTeamContentRequest.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid request body", details: validation.error.flatten() }, { status: 400 });
  }

  const updated = await updateTeamContent(contentId, validation.data);
  return NextResponse.json({ content: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; contentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: teamId, contentId } = await params;

  const content = await getTeamContent(contentId);
  if (!content || content.teamId !== teamId) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }

  const canDelete = await hasPermission(teamId, session.user.id, "canDeleteContent");
  const isOwner = content.userId === session.user.id;
  if (!canDelete && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteTeamContent(contentId);
  return NextResponse.json({ success: true });
}
