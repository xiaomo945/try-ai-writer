import { NextResponse } from "next/server";
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        _count: {
          select: {
            history: true,
            memories: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        user: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          historyCount: 0,
          memoryCount: 0,
          createdAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        historyCount: user._count.history,
        memoryCount: user._count.memories,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to load profile:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
