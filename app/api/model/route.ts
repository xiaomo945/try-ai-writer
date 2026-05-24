import { NextResponse } from "next/server";

export async function GET() {
  const aiProvider = process.env.AI_PROVIDER || "mock";
  const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
  const claudeApiKey = process.env.CLAUDE_API_KEY;
  
  let isMockMode = aiProvider === "mock";
  if (aiProvider === "deepseek" && (!deepseekApiKey || deepseekApiKey.startsWith("your-"))) {
    isMockMode = true;
  }
  if (aiProvider === "claude" && (!claudeApiKey || claudeApiKey.startsWith("your-"))) {
    isMockMode = true;
  }
  
  let model = "mock";
  if (!isMockMode) {
    model = aiProvider;
  }
  
  return NextResponse.json({ model });
}
