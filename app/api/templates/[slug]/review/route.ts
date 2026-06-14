import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// POST /api/templates/[slug]/review - 创建/更新评价
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
    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const template = await prisma.template.findUnique({
      where: { slug },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // 检查是否已评价
    const existing = await prisma.templateReview.findUnique({
      where: {
        userId_templateId: {
          userId: session.user.id,
          templateId: template.id,
        },
      },
    });

    let review;
    if (existing) {
      // 更新评价
      review = await prisma.templateReview.update({
        where: { id: existing.id },
        data: { rating, comment },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    } else {
      // 创建评价
      review = await prisma.templateReview.create({
        data: {
          userId: session.user.id,
          templateId: template.id,
          rating,
          comment,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }

    // 更新模板的平均评分
    const reviews = await prisma.templateReview.findMany({
      where: { templateId: template.id },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.template.update({
      where: { id: template.id },
      data: {
        rating: avgRating,
        ratingCount: reviews.length,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/templates/[slug]/review - 获取评价列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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

    const reviews = await prisma.templateReview.findMany({
      where: { templateId: template.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
