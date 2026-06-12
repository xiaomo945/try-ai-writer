import { NextRequest, NextResponse } from "next/server";
import { searchHistory, HistoryRecord } from "@/lib/history-search";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limiter";

const SEARCH_RATE_LIMIT = { windowMs: 60000, maxRequests: 30 };

function checkRateLimit(req: NextRequest): NextResponse | null {
  const key = getRateLimitKey(req);
  const limitResult = rateLimit(key, SEARCH_RATE_LIMIT);
  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: Math.ceil((limitResult.resetAt - Date.now()) / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil((limitResult.resetAt - Date.now()) / 1000)) } }
    );
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = checkRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const historyParam = searchParams.get("history");
    
    let records: HistoryRecord[] = [];
    
    if (historyParam) {
      try {
        records = JSON.parse(historyParam) as HistoryRecord[];
      } catch {
        return NextResponse.json({ error: "Invalid history data" }, { status: 400 });
      }
    }
    
    const results = searchHistory(records, q, 10);
    
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResponse = checkRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
    const body = await request.json();
    const { history, query } = body as { history: HistoryRecord[]; query: string };
    
    if (!Array.isArray(history)) {
      return NextResponse.json({ error: "Invalid history data" }, { status: 400 });
    }
    
    const results = searchHistory(history, query || "", 10);
    
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
