import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createHash } from "crypto";

export interface ApiKeyAuth {
  userId: string;
  permissions: string[];
  keyId: string;
}

// API密钥认证中间件
export async function authenticateApiKey(request: NextRequest): Promise<ApiKeyAuth | null> {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const apiKey = authHeader.substring(7);
  
  if (!apiKey || !apiKey.startsWith("sk-")) {
    return null;
  }

  // 计算密钥哈希
  const keyHash = createHash("sha256").update(apiKey).digest("hex");

  if (!prisma) {
    throw new Error("Database not configured");
  }

  // 查找API密钥
  const keyRecord = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: {
      id: true,
      userId: true,
      permissions: true,
      expiresAt: true,
    },
  });

  if (!keyRecord) {
    return null;
  }

  // 检查是否过期
  if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
    return null;
  }

  // 更新最后使用时间
  await prisma.apiKey.update({
    where: { id: keyRecord.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    userId: keyRecord.userId,
    permissions: keyRecord.permissions.split(","),
    keyId: keyRecord.id,
  };
}

// 检查权限
export function hasPermission(auth: ApiKeyAuth, permission: string): boolean {
  return auth.permissions.includes(permission);
}

// API密钥认证包装器
export function withApiKeyAuth(
  handler: (req: NextRequest, auth: ApiKeyAuth) => Promise<NextResponse>,
  requiredPermission?: string
) {
  return async (request: NextRequest) => {
    try {
      const auth = await authenticateApiKey(request);
      
      if (!auth) {
        return NextResponse.json(
          { error: "Invalid or missing API key" },
          { status: 401 }
        );
      }

      if (requiredPermission && !hasPermission(auth, requiredPermission)) {
        return NextResponse.json(
          { error: "Insufficient permissions" },
          { status: 403 }
        );
      }

      return await handler(request, auth);
    } catch (error) {
      console.error("API key auth error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}
