import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
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

    // 获取搜索参数
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const mode = searchParams.get("mode");
    const limit = parseInt(searchParams.get("limit") || "50");

    if (!query || query.trim().length === 0) {
      // 如果没有搜索词，返回最近的记录
      const records = await prisma.historyRecord.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
      return NextResponse.json({ records });
    }

    // 构建搜索条件
    const whereClause: any = {
      userId: user.id,
    };

    // 如果有搜索词，添加文本搜索条件
    if (query && query.trim().length > 0) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { result: { contains: query, mode: "insensitive" } },
      ];
    }

    // 如果有模式过滤，添加模式条件
    if (mode && mode !== "all") {
      whereClause.mode = mode;
    }

    // 执行搜索
    const records = await prisma.historyRecord.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Failed to search history:", error);
    return NextResponse.json({ error: "Failed to search history" }, { status: 500 });
  }
}
