import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isTeamMember, hasPermission } from "@/lib/team/service";
import { getTeamContents, createTeamContent } from "@/lib/team/content-service";
import { CreateTeamContentRequest } from "@/lib/team/content";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: teamId } = await params;

  const isMember = await isTeamMember(teamId, session.user.id);
  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contents = await getTeamContents(teamId);
  return NextResponse.json({ contents });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: teamId } = await params;

  const canCreate = await hasPermission(teamId, session.user.id, "canCreateContent");
  if (!canCreate) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const validation = CreateTeamContentRequest.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid request body", details: validation.error.flatten() }, { status: 400 });
  }

  const content = await createTeamContent(teamId, session.user.id, validation.data);
  return NextResponse.json({ content }, { status: 201 });
}
