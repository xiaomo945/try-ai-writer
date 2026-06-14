import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/collaboration/room - 创建或加入协作房间
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { documentId, title } = body;

    if (!documentId) {
      return NextResponse.json({ error: "Document ID required" }, { status: 400 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // 查找或创建协作会话
    let collabSession = await prisma.collaborationSession.findUnique({
      where: { documentId },
      include: { participants: true },
    });

    if (!collabSession) {
      collabSession = await prisma.collaborationSession.create({
        data: {
          documentId,
          title: title || "Untitled Document",
          ownerId: userId,
          participants: {
            create: {
              userId,
              role: "OWNER",
            },
          },
        },
        include: { participants: true },
      });
    } else {
      // 检查用户是否已是参与者
      const existingParticipant = collabSession.participants.find(
        (p: { userId: string }) => p.userId === userId
      );

      if (!existingParticipant) {
        await prisma.collaborationParticipant.create({
          data: {
            sessionId: collabSession.id,
            userId,
            role: "EDITOR",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: collabSession.id,
      documentId: collabSession.documentId,
    });
  } catch (error) {
    console.error("Collaboration room error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/collaboration/room?documentId=xxx - 获取协作房间信息
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

    const collabSession = await prisma.collaborationSession.findUnique({
      where: { documentId },
      include: {
        participants: {
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
        },
      },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: collabSession.id,
      documentId: collabSession.documentId,
      title: collabSession.title,
      ownerId: collabSession.ownerId,
      participants: collabSession.participants.map((p: { user: { id: string; name: string | null; email: string | null; image: string | null }; role: string }) => ({
        id: p.user.id,
        name: p.user.name,
        email: p.user.email,
        image: p.user.image,
        role: p.role,
      })),
    });
  } catch (error) {
    console.error("Get collaboration room error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/collaboration/room - 删除协作房间
export async function DELETE(request: NextRequest) {
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

    const collabSession = await prisma.collaborationSession.findUnique({
      where: { documentId },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 只有所有者可以删除
    if (collabSession.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.collaborationSession.delete({
      where: { documentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete collaboration room error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
