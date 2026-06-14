import { NextRequest, NextResponse } from "next/server";
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
    });

    if (!user) {
      return NextResponse.json({ profile: null });
    }

    const profile = await prisma.brandVoiceProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({
      profile: {
        industry: profile.industry,
        tone: profile.tone,
        audience: profile.audience,
        commonPhrases: JSON.parse(profile.commonPhrases || "[]"),
        avgSentenceLength: profile.avgSentenceLength,
        avgParagraphLength: profile.avgParagraphLength,
        vocabularyStyle: JSON.parse(profile.vocabularyStyle || "[]"),
        learningSamples: profile.learningSamples,
        styleFingerprint: profile.styleFingerprint
          ? JSON.parse(profile.styleFingerprint)
          : null,
        createdAt: profile.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Failed to load brand voice:", error);
    return NextResponse.json({ error: "Failed to load brand voice" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();

    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        },
      });
    }

    const profile = await prisma.brandVoiceProfile.upsert({
      where: { userId: user.id },
      update: {
        ...(body.industry !== undefined && { industry: body.industry }),
        ...(body.tone !== undefined && { tone: body.tone }),
        ...(body.audience !== undefined && { audience: body.audience }),
        ...(body.commonPhrases !== undefined && {
          commonPhrases: JSON.stringify(body.commonPhrases),
        }),
        ...(body.avgSentenceLength !== undefined && {
          avgSentenceLength: body.avgSentenceLength,
        }),
        ...(body.avgParagraphLength !== undefined && {
          avgParagraphLength: body.avgParagraphLength,
        }),
        ...(body.vocabularyStyle !== undefined && {
          vocabularyStyle: JSON.stringify(body.vocabularyStyle),
        }),
        ...(body.learningSamples !== undefined && {
          learningSamples: body.learningSamples,
        }),
        ...(body.styleFingerprint !== undefined && {
          styleFingerprint: JSON.stringify(body.styleFingerprint),
        }),
      },
      create: {
        userId: user.id,
        industry: body.industry || "",
        tone: body.tone || "neutral",
        audience: body.audience || "",
        commonPhrases: JSON.stringify(body.commonPhrases || []),
        avgSentenceLength: body.avgSentenceLength ?? 15,
        avgParagraphLength: body.avgParagraphLength ?? 4,
        vocabularyStyle: JSON.stringify(body.vocabularyStyle || []),
        learningSamples: body.learningSamples ?? 0,
        styleFingerprint: body.styleFingerprint
          ? JSON.stringify(body.styleFingerprint)
          : null,
      },
    });

    return NextResponse.json({
      profile: {
        industry: profile.industry,
        tone: profile.tone,
        audience: profile.audience,
        commonPhrases: JSON.parse(profile.commonPhrases || "[]"),
        avgSentenceLength: profile.avgSentenceLength,
        avgParagraphLength: profile.avgParagraphLength,
        vocabularyStyle: JSON.parse(profile.vocabularyStyle || "[]"),
        learningSamples: profile.learningSamples,
        styleFingerprint: profile.styleFingerprint
          ? JSON.parse(profile.styleFingerprint)
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to save brand voice:", error);
    return NextResponse.json({ error: "Failed to save brand voice" }, { status: 500 });
  }
}
