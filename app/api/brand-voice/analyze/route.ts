import { NextRequest, NextResponse } from "next/server";
import { analyzeStyle } from "@/lib/brand-voice/analysis";
import { recordStyleEvolution } from "@/lib/brand-voice/evolution";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { text, contentId } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    if (!contentId || typeof contentId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'contentId' field" },
        { status: 400 }
      );
    }

    // Analyze style
    const analysis = analyzeStyle(text, contentId, session.user.id);

    // Record evolution
    recordStyleEvolution(analysis);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Style analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
