import { NextRequest, NextResponse } from "next/server";
import { searchHistory, HistoryRecord } from "@/lib/history-search";

export async function GET(request: NextRequest) {
  try {
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
