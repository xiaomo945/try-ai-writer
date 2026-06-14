import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  checkLoginStreak,
  claimDailyReward,
  getLoginStreak,
} from "@/lib/retention/daily-reward-service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await checkLoginStreak(session.user.id);
    const streak = await getLoginStreak(session.user.id);

    return NextResponse.json({ ...result, streak });
  } catch (error) {
    console.error("Check login streak error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await claimDailyReward(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Claim daily reward error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
