import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "referrals");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

    ensureDir();
    const filePath = join(DATA_DIR, `${userId}.json`);

    if (existsSync(filePath)) {
      const existing = JSON.parse(readFileSync(filePath, "utf-8"));
      return NextResponse.json({ referralCode: existing.code, referralLink: `https://tryaiwriter.com?ref=${existing.code}` });
    }

    const code = `REF-${userId.slice(0, 8)}-${randomBytes(3).toString("hex").toUpperCase()}`;
    writeFileSync(filePath, JSON.stringify({ code, userId, createdAt: new Date().toISOString(), referralCount: 0, successfulSubscriptions: 0 }));

    return NextResponse.json({ referralCode: code, referralLink: `https://tryaiwriter.com?ref=${code}` });
  } catch {
    return NextResponse.json({ error: "Failed to generate referral" }, { status: 500 });
  }
}
