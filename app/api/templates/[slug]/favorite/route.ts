import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/templates/[slug]/favorite - 收藏/取消收藏模板
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const template = await prisma.template.findUnique({
      where: { slug },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 检查是否已收藏
    const existing = await prisma.templateFavorite.findUnique({
      where: {
        userId_templateId: {
          userId: session.user.id,
          templateId: template.id,
        },
      },
    });

    if (existing) {
      // 取消收藏
      await prisma.templateFavorite.delete({
        where: { id: existing.id },
      });

      return NextResponse.json({ favorited: false });
    } else {
      // 添加收藏
      await prisma.templateFavorite.create({
        data: {
          userId: session.user.id,
          templateId: template.id,
        },
      });

      return NextResponse.json({ favorited: true });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/templates/[slug]/favorite - 检查是否已收藏
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ favorited: false });
    }

    const { slug } = await params;

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const template = await prisma.template.findUnique({
      where: { slug },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const favorite = await prisma.templateFavorite.findUnique({
      where: {
        userId_templateId: {
          userId: session.user.id,
          templateId: template.id,
        },
      },
    });

    return NextResponse.json({ favorited: !!favorite });
  } catch (error) {
    console.error("Check favorite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
