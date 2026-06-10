import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getReferralRecord, getReferralLink } from "@/lib/referral";

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = req.nextUrl.searchParams.get("userId");

    // Users can only query their own stats unless explicitly passed
    if (userId && userId !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const effectiveUserId = userId || session.user.email || "";

    const record = getReferralRecord(effectiveUserId);
    if (!record) {
      return NextResponse.json({
        referralCode: null,
        referralCount: 0,
        successfulSubscriptions: 0,
        referralLink: null,
      });
    }

    const baseUrl = process.env.NEXTAUTH_URL || "https://tryaiwriter.com";

    return NextResponse.json({
      referralCode: record.code,
      referralLink: getReferralLink(record.code, baseUrl),
      referralCount: record.referralCount,
      successfulSubscriptions: record.successfulSubscriptions,
    });
  } catch (err) {
    console.error("[Referral Stats] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}