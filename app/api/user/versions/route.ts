import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/user/versions - 获取文档版本历史
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const versions = await prisma.documentVersion.findMany({
      where: {
        userId: user.id,
        documentId,
      },
      orderBy: { version: "desc" },
      select: {
        id: true,
        documentId: true,
        title: true,
        version: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("Failed to fetch versions:", error);
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}

// POST /api/user/versions - 保存新版本
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
    const { documentId, content, title } = body;

    if (!documentId || !content) {
      return NextResponse.json({ error: "documentId and content are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 获取当前最新版本号
    const latestVersion = await prisma.documentVersion.findFirst({
      where: {
        userId: user.id,
        documentId,
      },
      orderBy: { version: "desc" },
    });

    const newVersionNumber = (latestVersion?.version || 0) + 1;

    // 创建新版本
    const version = await prisma.documentVersion.create({
      data: {
        userId: user.id,
        documentId,
        content,
        title: title || "Untitled",
        version: newVersionNumber,
      },
    });

    return NextResponse.json({
      version: {
        id: version.id,
        documentId: version.documentId,
        title: version.title,
        version: version.version,
        createdAt: version.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to save version:", error);
    return NextResponse.json({ error: "Failed to save version" }, { status: 500 });
  }
}
