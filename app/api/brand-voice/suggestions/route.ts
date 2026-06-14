import { NextRequest, NextResponse } from "next/server";
import {
  generateStyleSuggestions,
  getTopSuggestions,
  getSuggestionsByDimension,
} from "@/lib/brand-voice/suggestions";
import { StyleDimensions } from "@/lib/brand-voice/analysis-types";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { analysis, limit, dimension } = body;

    if (!analysis) {
      return NextResponse.json(
        { error: "Missing 'analysis' field" },
        { status: 400 }
      );
    }

    let suggestions;

    if (dimension) {
      if (!Object.keys(StyleDimensions).includes(dimension)) {
        return NextResponse.json(
          { error: "Invalid 'dimension' field" },
          { status: 400 }
        );
      }
      suggestions = getSuggestionsByDimension(analysis, dimension);
    } else if (limit) {
      if (typeof limit !== "number" || limit < 1) {
        return NextResponse.json(
          { error: "Invalid 'limit' field" },
          { status: 400 }
        );
      }
      suggestions = getTopSuggestions(analysis, limit);
    } else {
      suggestions = generateStyleSuggestions(analysis);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Get suggestions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
