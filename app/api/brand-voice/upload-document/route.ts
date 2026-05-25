import { NextRequest, NextResponse } from "next/server";
import { analyzeDocumentStyle, convertToBrandVoiceProfile } from "@/lib/document-style-analyzer";
import { BrandVoiceProfile } from "@/lib/brand-voice";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userType = formData.get("userType") as string ?? "free";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Free user restrictions
    if (userType === "free") {
      if (file.size > 50 * 1024) { // 50KB
        return NextResponse.json({ error: "Free users can upload up to 50KB" }, { status: 400 });
      }
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".txt") && !fileName.endsWith(".md")) {
        return NextResponse.json({ error: "Free users can only upload .txt or .md" }, { status: 400 });
      }
    }

    // Extract text
    let text = "";
    if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".md")) {
      text = await file.text();
    } else {
      return NextResponse.json({ error: "File type not supported" }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    const style = analyzeDocumentStyle(text);
    const partialProfile = convertToBrandVoiceProfile(style);
    const fullProfile: BrandVoiceProfile = {
      industry: partialProfile.industry ?? "general",
      tone: partialProfile.tone ?? "friendly",
      audience: partialProfile.audience ?? "general",
      commonPhrases: partialProfile.commonPhrases ?? [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true, profile: fullProfile, style });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to process document" }, { status: 500 });
  }
}
