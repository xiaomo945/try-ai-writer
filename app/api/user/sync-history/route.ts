import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserHistory, saveUserHistory } from "@/lib/user-sync";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = getUserHistory(session.user.email);
  return NextResponse.json({ history });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { entries } = await req.json();
    if (!Array.isArray(entries)) {
      return NextResponse.json({ error: "entries must be an array" }, { status: 400 });
    }

    saveUserHistory(session.user.email, entries);
    return NextResponse.json({ success: true, count: entries.length });
  } catch (err) {
    console.error("[History Sync] Error:", err);
    return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
  }
}