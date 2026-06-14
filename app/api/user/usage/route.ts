import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0]!;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({
        used: 0,
        claudeUsed: 0,
        deepseekUsed: 0,
        planName: "Free",
        isProUser: false,
      });
    }

    const userId = user.id;
    const today = getTodayStr();
    const record = await prisma.usageRecord.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return NextResponse.json({
      used: record?.used ?? 0,
      claudeUsed: record?.claudeUsed ?? 0,
      deepseekUsed: record?.deepseekUsed ?? 0,
      planName: "Free",
      isProUser: false,
    });
  } catch (error) {
    console.error("Failed to load usage:", error);
    return NextResponse.json({ error: "Failed to load usage" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { model } = body;

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        },
      });
    }

    const today = getTodayStr();
    const record = await prisma.usageRecord.upsert({
      where: { userId_date: { userId: user.id, date: today } },
      update: {
        used: { increment: 1 },
        ...(model === "claude" ? { claudeUsed: { increment: 1 } } : {}),
        ...(model === "deepseek" ? { deepseekUsed: { increment: 1 } } : {}),
      },
      create: {
        userId: user.id,
        date: today,
        used: 1,
        claudeUsed: model === "claude" ? 1 : 0,
        deepseekUsed: model === "deepseek" ? 1 : 0,
      },
    });

    return NextResponse.json({
      used: record.used,
      claudeUsed: record.claudeUsed,
      deepseekUsed: record.deepseekUsed,
    });
  } catch (error) {
    console.error("Failed to increment usage:", error);
    return NextResponse.json({ error: "Failed to increment usage" }, { status: 500 });
  }
}
