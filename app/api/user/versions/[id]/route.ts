import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/user/versions/[id] - 获取单个版本内容
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const version = await prisma.documentVersion.findUnique({
      where: { id },
    });

    if (!version || version.userId !== user.id) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: version.id,
      documentId: version.documentId,
      title: version.title,
      version: version.version,
      content: version.content,
      createdAt: version.createdAt,
    });
  } catch (error) {
    console.error("Failed to fetch version:", error);
    return NextResponse.json({ error: "Failed to fetch version" }, { status: 500 });
  }
}
