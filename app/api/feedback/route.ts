import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getFeedbacks,
  createFeedback,
  getFeedbackStats,
} from "@/lib/retention/feedback-service";
import { CreateFeedbackSchema } from "@/lib/retention/feedback-types";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stats = searchParams.get("stats");

    if (stats === "true") {
      const feedbackStats = await getFeedbackStats(session.user.id);
      return NextResponse.json(feedbackStats);
    }

    const feedbacks = await getFeedbacks(session.user.id);
    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Get feedbacks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validation = CreateFeedbackSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const feedback = await createFeedback(session.user.id, validation.data);
    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    console.error("Create feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
