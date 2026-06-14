import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/comments?documentId=xxx - 获取文档评论
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const comments = await prisma.comment.findMany({
      where: { documentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/comments - 创建评论
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentId, content, position = 0 } = body;

    if (!documentId || !content) {
      return NextResponse.json(
        { error: "Document ID and content required" },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const comment = await prisma.comment.create({
      data: {
        documentId,
        userId: session.user.id,
        content,
        position,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/comments - 更新评论（标记为已解决）
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { commentId, resolved } = body;

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // 只有评论作者可以修改
    if (comment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { resolved: resolved ?? !comment.resolved },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/comments - 删除评论
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ error: "Comment ID required" }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // 只有评论作者可以删除
    if (comment.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
