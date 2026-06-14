import { TutorialStep, TUTORIAL_STEPS } from "./tutorial-types";
import { randomUUID } from "crypto";

// In-memory storage (replace with database in production)
const tutorialSteps = new Map<string, TutorialStep>();

export async function initializeTutorial(userId: string): Promise<void> {
  // Check if already initialized
  const existing = Array.from(tutorialSteps.values()).find(
    (s) => s.userId === userId
  );
  if (existing) return;

  // Create tutorial steps
  for (const step of TUTORIAL_STEPS) {
    const id = randomUUID();
    const tutorialStep: TutorialStep = {
      id,
      userId,
      stepName: step.name,
      completed: false,
      completedAt: null,
      order: step.order,
    };
    tutorialSteps.set(id, tutorialStep);
  }
}

export async function getTutorialSteps(userId: string): Promise<TutorialStep[]> {
  return Array.from(tutorialSteps.values())
    .filter((s) => s.userId === userId)
    .sort((a, b) => a.order - b.order);
}

export async function completeTutorialStep(
  userId: string,
  stepName: string
): Promise<TutorialStep | null> {
  const step = Array.from(tutorialSteps.values()).find(
    (s) => s.userId === userId && s.stepName === stepName
  );

  if (!step) return null;

  step.completed = true;
  step.completedAt = new Date();
  tutorialSteps.set(step.id, step);

  return step;
}

export async function isTutorialCompleted(userId: string): Promise<boolean> {
  const steps = await getTutorialSteps(userId);
  return steps.every((s) => s.completed);
}

export async function getTutorialProgress(userId: string): Promise<{
  totalSteps: number;
  completedSteps: number;
  currentStep: string | null;
  percentage: number;
}> {
  const steps = await getTutorialSteps(userId);
  const completedSteps = steps.filter((s) => s.completed).length;
  const currentStep = steps.find((s) => !s.completed);

  return {
    totalSteps: steps.length,
    completedSteps,
    currentStep: currentStep?.stepName || null,
    percentage: (completedSteps / steps.length) * 100,
  };
}

export async function resetTutorial(userId: string): Promise<void> {
  const steps = Array.from(tutorialSteps.values()).filter(
    (s) => s.userId === userId
  );
  
  for (const step of steps) {
    step.completed = false;
    step.completedAt = null;
    tutorialSteps.set(step.id, step);
  }
}
