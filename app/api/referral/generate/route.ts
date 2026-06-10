import { NextRequest, NextResponse } from "next/server";
import { createReferralRecord, getReferralLink } from "@/lib/referral";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const record = createReferralRecord(userId);
    const baseUrl = process.env.NEXTAUTH_URL || "https://tryaiwriter.com";
    const link = getReferralLink(record.code, baseUrl);

    return NextResponse.json({
      referralCode: record.code,
      referralLink: link,
      referralCount: record.referralCount,
      successfulSubscriptions: record.successfulSubscriptions,
    });
  } catch (err) {
    console.error("[Referral Generate] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate referral" },
      { status: 500 }
    );
  }
}