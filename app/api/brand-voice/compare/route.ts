import { NextRequest, NextResponse } from "next/server";
import { compareWithBenchmark, getAvailableIndustries } from "@/lib/brand-voice/benchmark";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { analysis, industry } = body;

    if (!analysis) {
      return NextResponse.json(
        { error: "Missing 'analysis' field" },
        { status: 400 }
      );
    }

    if (!industry || typeof industry !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'industry' field" },
        { status: 400 }
      );
    }

    const comparison = compareWithBenchmark(analysis, industry);

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error("Style comparison error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const industries = getAvailableIndustries();
    return NextResponse.json({ industries });
  } catch (error) {
    console.error("Get industries error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
