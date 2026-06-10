import { NextRequest, NextResponse } from "next/server";
import { getReferralRecord, getReferralLink } from "@/lib/referral";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const record = getReferralRecord(userId);
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