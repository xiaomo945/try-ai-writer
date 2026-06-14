import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "referrals");

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    const filePath = join(DATA_DIR, `${userId}.json`);
    if (!existsSync(filePath)) return NextResponse.json({ referralCode: null, referralCount: 0, successfulSubscriptions: 0 });

    const data = JSON.parse(readFileSync(filePath, "utf-8"));
    return NextResponse.json({
      referralCode: data.code,
      referralCount: data.referralCount || 0,
      successfulSubscriptions: data.successfulSubscriptions || 0,
      referralLink: `https://tryaiwriter.com?ref=${data.code}`,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
