import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ records: [] });
    }

    // 获取历史记录
    const records = await prisma.historyRecord.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50, // 限制返回数量
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Failed to load history:", error);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
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
    const { title, mode, result } = body;

    if (!title || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 获取或创建用户
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

    // 创建历史记录
    const record = await prisma.historyRecord.create({
      data: {
        userId: user.id,
        title,
        mode: mode || "default",
        result,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Failed to add history:", error);
    return NextResponse.json({ error: "Failed to add history" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (id) {
      // 删除单条记录
      await prisma.historyRecord.deleteMany({
        where: { id, userId: user.id },
      });
    } else {
      // 清空所有记录
      await prisma.historyRecord.deleteMany({
        where: { userId: user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete history:", error);
    return NextResponse.json({ error: "Failed to delete history" }, { status: 500 });
  }
}
