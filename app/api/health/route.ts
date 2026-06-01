import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: 0,
    services: {
      database: "not_configured",
      paddle: process.env.PADDLE_API_KEY ? "ok" : "not_configured",
    },
  });
}
