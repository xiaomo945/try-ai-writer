import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/templates - 获取模板列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {
      isPublished: true,
    };

    if (category && category !== "all") {
      where.category = {
        slug: category,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
      ];
    }

    // 获取模板列表
    const templates = await prisma.template.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: [
        { isPremium: "desc" },
        { usageCount: "desc" },
        { createdAt: "desc" },
      ],
      skip,
      take: limit,
    });

    // 获取总数
    const total = await prisma.template.count({ where });

    // 获取分类列表
    const categories = await prisma.templateCategory.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      templates,
      categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get templates error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/templates - 创建模板（需要认证）
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      description,
      content,
      categoryId,
      tags = [],
      price = 0,
      isPremium = false,
      thumbnailUrl,
      isPublished = false,
    } = body;

    if (!title || !slug || !description || !content || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const existing = await prisma.template.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Template with this slug already exists" },
        { status: 400 }
      );
    }

    const template = await prisma.template.create({
      data: {
        title,
        slug,
        description,
        content,
        categoryId,
        authorId: session.user.id,
        tags: JSON.stringify(tags),
        price,
        isPremium,
        thumbnailUrl,
        isPublished,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Create template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
