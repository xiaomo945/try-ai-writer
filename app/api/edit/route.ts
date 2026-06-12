import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limiter";

const EDIT_RATE_LIMIT = { windowMs: 60000, maxRequests: 15 };

async function callAIForEdit(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 4096,
      temperature: 0.3,
      system: "You are an expert editor. Edit the provided text according to the instruction. Return ONLY the edited text, no explanations.",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Claude API error (${response.status}): ${body}`);
  }

  const data = await response.json() as { content: Array<{ text: string }> };
  return data.content?.[0]?.text ?? "";
}

async function callDeepSeekForEdit(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
      messages: [
        { role: "system", content: "You are an expert editor. Edit the provided text according to the instruction. Return ONLY the edited text, no explanations." },
        { role: "user", content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.3,
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`DeepSeek API error (${response.status}): ${body}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const key = getRateLimitKey(req);
    const limitResult = rateLimit(key, EDIT_RATE_LIMIT);
    if (!limitResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: Math.ceil((limitResult.resetAt - Date.now()) / 1000) },
        { status: 429, headers: { "Retry-After": String(Math.ceil((limitResult.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await req.json();
    const { originalText, editInstruction, mode } = body as {
      originalText?: string;
      editInstruction?: string;
      mode?: string;
    };

    if (!originalText || !editInstruction) {
      return NextResponse.json({ error: "Missing required fields: originalText, editInstruction" }, { status: 400 });
    }

    const aiPrompt = `Original text:\n"""\n${originalText}\n"""\n\nEdit instruction: ${editInstruction}\n\nMode: ${mode || "general"}`;

    // Try Claude first, then DeepSeek
    const claudeKey = process.env.CLAUDE_API_KEY;
    const deepSeekKey = process.env.DEEPSEEK_API_KEY;

    let editedText: string;

    if (claudeKey && claudeKey.length > 10) {
      try {
        editedText = await callAIForEdit(aiPrompt, claudeKey);
        return NextResponse.json({ editedText });
      } catch (err) {
        console.warn("[Edit] Claude failed, trying DeepSeek:", (err as Error).message);
      }
    }

    if (deepSeekKey && deepSeekKey.length > 10) {
      try {
        editedText = await callDeepSeekForEdit(aiPrompt, deepSeekKey);
        return NextResponse.json({ editedText });
      } catch (err) {
        console.error("[Edit] DeepSeek also failed:", (err as Error).message);
        return NextResponse.json(
          { error: "AI editing service unavailable. Please try again later." },
          { status: 503 }
        );
      }
    }

    // Fallback: basic edit
    editedText = editInstruction.includes("Shorten")
      ? originalText.split(" ").slice(0, Math.ceil(originalText.split(" ").length / 2)).join(" ")
      : `${editInstruction} applied:\n\n${originalText}`;

    return NextResponse.json({ editedText, fallback: true });
  } catch (err) {
    console.error("[Edit] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to process edit request" },
      { status: 500 }
    );
  }
}