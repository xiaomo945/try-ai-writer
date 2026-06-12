import { NextRequest, NextResponse } from "next/server";
import { createReferralRecord, getReferralLink } from "@/lib/referral";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
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