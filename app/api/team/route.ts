import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createTeam, getUserTeams } from "@/lib/team/service";
import { CreateTeamRequest } from "@/lib/team/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await getUserTeams(session.user.id);
    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = CreateTeamRequest.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const team = await createTeam(session.user.id, validation.data);
    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error("Failed to create team:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
