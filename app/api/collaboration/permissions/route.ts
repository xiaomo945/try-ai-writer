import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/collaboration/permissions?documentId=xxx - 获取文档权限列表
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

    // 检查当前用户是否有权限查看
    const userId = session.user.id;
    const currentParticipant = collabSession.participants.find(
      (p: { userId: string }) => p.userId === userId
    );

    if (!currentParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      documentId: collabSession.documentId,
      ownerId: collabSession.ownerId,
      participants: collabSession.participants.map((p: { id: string; userId: string; user: { id: string; name: string | null; email: string | null; image: string | null }; role: string; joinedAt: Date }) => ({
        id: p.id,
        userId: p.user.id,
        name: p.user.name,
        email: p.user.email,
        image: p.user.image,
        role: p.role,
        joinedAt: p.joinedAt,
      })),
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/collaboration/permissions - 添加协作者并分配角色
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { documentId, email, role = "EDITOR" } = body;

    if (!documentId || !email) {
      return NextResponse.json(
        { error: "Document ID and email required" },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // 验证角色类型
    const validRoles = ["OWNER", "EDITOR", "VIEWER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OWNER, EDITOR, or VIEWER" },
        { status: 400 }
      );
    }

    // 查找协作会话
    const collabSession = await prisma.collaborationSession.findUnique({
      where: { documentId },
      include: { participants: true },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 检查当前用户是否是所有者或编辑者
    const currentParticipant = collabSession.participants.find(
      (p: { userId: string }) => p.userId === userId
    );

    if (!currentParticipant || currentParticipant.role === "VIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 查找要添加的用户
    const userToAdd = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToAdd) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 检查用户是否已是参与者
    const existingParticipant = collabSession.participants.find(
      (p: { userId: string }) => p.userId === userToAdd.id
    );

    if (existingParticipant) {
      // 更新角色
      const updated = await prisma.collaborationParticipant.update({
        where: { id: existingParticipant.id },
        data: { role },
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
    }

    // 添加新参与者
    const participant = await prisma.collaborationParticipant.create({
      data: {
        sessionId: collabSession.id,
        userId: userToAdd.id,
        role,
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

    return NextResponse.json(participant);
  } catch (error) {
    console.error("Add permission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/collaboration/permissions - 更新参与者角色
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { documentId, participantId, role } = body;

    if (!documentId || !participantId || !role) {
      return NextResponse.json(
        { error: "Document ID, participant ID, and role required" },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // 验证角色类型
    const validRoles = ["OWNER", "EDITOR", "VIEWER"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OWNER, EDITOR, or VIEWER" },
        { status: 400 }
      );
    }

    // 查找协作会话
    const collabSession = await prisma.collaborationSession.findUnique({
      where: { documentId },
      include: { participants: true },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 只有所有者可以更改角色
    if (collabSession.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 不能更改所有者的角色
    const participant = collabSession.participants.find(
      (p: { id: string }) => p.id === participantId
    );

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    if (participant.userId === collabSession.ownerId) {
      return NextResponse.json(
        { error: "Cannot change owner's role" },
        { status: 400 }
      );
    }

    // 更新角色
    const updated = await prisma.collaborationParticipant.update({
      where: { id: participantId },
      data: { role },
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
    console.error("Update permission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/collaboration/permissions - 移除协作者
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");
    const participantId = searchParams.get("participantId");

    if (!documentId || !participantId) {
      return NextResponse.json(
        { error: "Document ID and participant ID required" },
        { status: 400 }
      );
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    // 查找协作会话
    const collabSession = await prisma.collaborationSession.findUnique({
      where: { documentId },
      include: { participants: true },
    });

    if (!collabSession) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // 只有所有者可以移除参与者
    if (collabSession.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 不能移除所有者
    const participant = collabSession.participants.find(
      (p: { id: string }) => p.id === participantId
    );

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    if (participant.userId === collabSession.ownerId) {
      return NextResponse.json(
        { error: "Cannot remove owner" },
        { status: 400 }
      );
    }

    // 移除参与者
    await prisma.collaborationParticipant.delete({
      where: { id: participantId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove permission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
