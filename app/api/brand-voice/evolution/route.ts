import { NextRequest, NextResponse } from "next/server";
import {
  getStyleEvolutionHistory,
  calculateStyleTrends,
  getStyleEvolutionSummary,
} from "@/lib/brand-voice/evolution";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const days = parseInt(searchParams.get("days") || "30");

    const history = getStyleEvolutionHistory(session.user.id, limit);
    const trends = calculateStyleTrends(session.user.id, days);
    const summary = getStyleEvolutionSummary(session.user.id);

    return NextResponse.json({
      history,
      trends,
      summary,
    });
  } catch (error) {
    console.error("Get evolution error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
