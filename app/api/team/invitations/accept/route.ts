import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getInvitationByToken, acceptInvitation } from "@/lib/team/service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing required parameter: token" },
        { status: 400 }
      );
    }

    const invitation = await getInvitationByToken(token);
    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    return NextResponse.json({ invitation });
  } catch (error) {
    console.error("Failed to fetch invitation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing required parameter: token" },
        { status: 400 }
      );
    }

    const member = await acceptInvitation(token, session.user.id);
    if (!member) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    return NextResponse.json({ member, success: true });
  } catch (error) {
    console.error("Failed to accept invitation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
