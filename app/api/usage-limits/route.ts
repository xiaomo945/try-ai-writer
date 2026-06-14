import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  checkUsageLimit,
  incrementUsage,
  getUserUsageLimits,
} from "@/lib/conversion/usage-limit-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feature = searchParams.get("feature");

    if (feature) {
      const result = await checkUsageLimit(session.user.id, feature);
      return NextResponse.json(result);
    }

    const limits = await getUserUsageLimits(session.user.id);
    return NextResponse.json({ limits });
  } catch (error) {
    console.error("Get usage limits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { feature, amount } = body;

    if (!feature) {
      return NextResponse.json({ error: "Missing feature" }, { status: 400 });
    }

    const result = await incrementUsage(session.user.id, feature, amount || 1);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Usage limit exceeded",
          usageLimit: result.usageLimit,
          remaining: result.remaining,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Increment usage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
