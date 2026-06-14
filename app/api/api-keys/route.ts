import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createHash, randomBytes } from "crypto";

// GET /api/api-keys - 获取当前用户的所有API密钥
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        permissions: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error("Get API keys error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/api-keys - 创建新的API密钥
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
    const { name, permissions = "read,write", expiresAt } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // 生成API密钥
    const apiKey = `sk-${randomBytes(32).toString("hex")}`;
    const keyHash = createHash("sha256").update(apiKey).digest("hex");
    const keyPrefix = apiKey.substring(0, 11); // sk- + 8位

    // 计算过期时间
    let expiresAtDate = null;
    if (expiresAt) {
      expiresAtDate = new Date(expiresAt);
    }

    // 创建API密钥记录
    const newKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name,
        keyHash,
        keyPrefix,
        permissions,
        expiresAt: expiresAtDate,
      },
    });

    // 返回完整的API密钥（只在创建时显示一次）
    return NextResponse.json({
      id: newKey.id,
      name: newKey.name,
      apiKey, // 完整密钥，只在创建时返回
      keyPrefix: newKey.keyPrefix,
      permissions: newKey.permissions,
      expiresAt: newKey.expiresAt,
      createdAt: newKey.createdAt,
    });
  } catch (error) {
    console.error("Create API key error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/api-keys - 删除API密钥
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get("id");

    if (!keyId) {
      return NextResponse.json({ error: "Key ID is required" }, { status: 400 });
    }

    // 验证密钥属于当前用户
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        userId: session.user.id,
      },
    });

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete API key error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
