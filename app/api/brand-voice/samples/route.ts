import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    samples: [],
    message: "Brand voice samples API"
  });
}
