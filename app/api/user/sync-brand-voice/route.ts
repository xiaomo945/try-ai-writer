import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data", "user-sync");

function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

function brandVoicePath(userId: string): string {
  ensureDir();
  return join(DATA_DIR, `${userId}-brand-voice.json`);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fp = brandVoicePath(session.user.email);
  if (!existsSync(fp)) {
    return NextResponse.json({ brandVoice: null });
  }

  try {
    const data = JSON.parse(readFileSync(fp, "utf-8"));
    return NextResponse.json({ brandVoice: data });
  } catch {
    return NextResponse.json({ brandVoice: null });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { brandVoice } = await req.json();
    if (!brandVoice) {
      return NextResponse.json({ error: "brandVoice required" }, { status: 400 });
    }

    writeFileSync(brandVoicePath(session.user.email), JSON.stringify(brandVoice, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Brand Voice Sync] Error:", err);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}