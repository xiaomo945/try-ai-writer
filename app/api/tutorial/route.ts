import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  initializeTutorial,
  getTutorialSteps,
  completeTutorialStep,
  getTutorialProgress,
  resetTutorial,
} from "@/lib/onboarding/tutorial-service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const progress = searchParams.get("progress");

    if (progress === "true") {
      const tutorialProgress = await getTutorialProgress(session.user.id);
      return NextResponse.json(tutorialProgress);
    }

    // Initialize tutorial if not exists
    await initializeTutorial(session.user.id);
    const steps = await getTutorialSteps(session.user.id);

    return NextResponse.json({ steps });
  } catch (error) {
    console.error("Get tutorial error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, stepName } = body;

    if (action === "complete_step" && stepName) {
      const step = await completeTutorialStep(session.user.id, stepName);
      if (!step) {
        return NextResponse.json({ error: "Step not found" }, { status: 404 });
      }
      const progress = await getTutorialProgress(session.user.id);
      return NextResponse.json({ step, progress });
    }

    if (action === "reset") {
      await resetTutorial(session.user.id);
      const steps = await getTutorialSteps(session.user.id);
      return NextResponse.json({ steps });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update tutorial error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
