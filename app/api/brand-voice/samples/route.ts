"use server";

import { NextRequest, NextResponse } from "next/server";
import {
  loadProfileFromStorage,
  saveProfileToStorage,
  loadSamplesFromStorage,
  saveSamplesToStorage,
  createDefaultProfile,
  getToday,
  BrandVoiceSample,
} from "@/lib/brand-voice-shared";
import { analyzeTone } from "@/lib/tone-analyzer";
import { extractKeyPoints, extractCommonPhrases } from "@/lib/memory-extractor";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, mode }: { content: string; mode: string } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (content.length < 100) {
      return NextResponse.json({ error: "Content must be at least 100 characters" }, { status: 400 });
    }

    const allowedModes = ["blog", "email", "social", "custom"];
    const validMode = allowedModes.includes(mode) ? mode : "custom";

    // Extract key points
    const keyPoints = extractKeyPoints(content);

    // Create new sample
    const sample: BrandVoiceSample = {
      id: Date.now().toString(),
      content,
      mode: validMode as any,
      timestamp: getToday(),
      keyPoints,
    };

    // Update samples
    const samples = loadSamplesFromStorage();
    const updatedSamples = [sample, ...samples].slice(0, 50);
    saveSamplesToStorage(updatedSamples);

    // Update profile with analyzed tone and common phrases
    let profile = loadProfileFromStorage();
    if (!profile) {
      profile = createDefaultProfile();
    }
    const analyzedTone = analyzeTone(content);
    const commonPhrases = extractCommonPhrases(updatedSamples);
    const updatedProfile = {
      ...profile,
      tone: analyzedTone.tone,
      commonPhrases,
      updatedAt: getToday(),
    };
    saveProfileToStorage(updatedProfile);

    return NextResponse.json({ success: true, sample, profile: updatedProfile });
  } catch (error: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const samples = loadSamplesFromStorage();
    const summary = samples.map(s => ({
      id: s.id,
      mode: s.mode,
      timestamp: s.timestamp,
      snippet: s.content.slice(0, 100) + (s.content.length > 100 ? "..." : ""),
      keyPoints: s.keyPoints,
    }));
    return NextResponse.json({ success: true, samples: summary });
  } catch (error: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
