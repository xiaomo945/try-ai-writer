"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  targetSelector?: string;
  completed: boolean;
}

interface InteractiveTutorialProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function InteractiveTutorial({ onComplete, onSkip }: InteractiveTutorialProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [steps, setSteps] = useState<TutorialStep[]>([]);

  useEffect(() => {
    // Initialize tutorial steps
    setSteps([
      {
        id: "welcome",
        title: "欢迎使用 Try AI Writer",
        description: "让我们花几分钟时间了解如何使用这个强大的AI写作工具。",
        completed: false,
      },
      {
        id: "create_content",
        title: "创建您的第一篇内容",
        description: "点击'开始写作'按钮，输入您的主题或需求，AI将为您生成专业内容。",
        action: "navigate",
        targetSelector: "#write-button",
        completed: false,
      },
      {
        id: "use_templates",
        title: "探索模板库",
        description: "我们提供50+专业模板，涵盖营销、商务、社交媒体等场景。",
        action: "navigate",
        targetSelector: "#templates-button",
        completed: false,
      },
      {
        id: "brand_voice",
        title: "设置品牌声音",
        description: "创建专属的品牌声音，让AI生成的内容更符合您的风格。",
        action: "navigate",
        targetSelector: "#brand-voice-button",
        completed: false,
      },
      {
        id: "save_content",
        title: "保存和管理内容",
        description: "将生成的内容保存到内容库，方便后续查看和管理。",
        action: "click",
        targetSelector: "#save-button",
        completed: false,
      },
      {
        id: "complete",
        title: "教程完成！",
        description: "恭喜！您已经了解了基本功能。现在可以开始创作了。",
        completed: false,
      },
    ]);
  }, []);

  const handleNext = () => {
    const newSteps = [...steps];
    if (newSteps[currentStep]) {
      newSteps[currentStep].completed = true;
    }
    setSteps(newSteps);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial completed
      if (session?.user?.id) {
        fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "complete_step", stepName: "tutorial_completed" }),
        });
      }
      setIsVisible(false);
      onComplete?.();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip?.();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  if (!step) {
    return null;
  }
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {currentStep + 1}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500">
                  步骤 {currentStep + 1} / {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">{step.description}</p>

          {/* Visual indicator */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              {currentStep === 0 && (
                <div className="text-6xl mb-3">🚀</div>
              )}
              {currentStep === 1 && (
                <div className="text-6xl mb-3">✍️</div>
              )}
              {currentStep === 2 && (
                <div className="text-6xl mb-3">📚</div>
              )}
              {currentStep === 3 && (
                <div className="text-6xl mb-3">🎨</div>
              )}
              {currentStep === 4 && (
                <div className="text-6xl mb-3">💾</div>
              )}
              {currentStep === 5 && (
                <div className="text-6xl mb-3">🎉</div>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                上一步
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
            >
              {currentStep === steps.length - 1 ? "完成" : "下一步"}
            </button>
          </div>

          {/* Skip link */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
            >
              跳过教程
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function useTutorial() {
  const { data: session } = useSession();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      // Check if user has completed tutorial
      fetch("/api/onboarding")
        .then((res) => res.json())
        .then((data) => {
          const tutorialCompleted = data.steps?.some(
            (s: { stepName: string; completed: boolean }) =>
              s.stepName === "tutorial_completed" && s.completed
          );
          if (!tutorialCompleted) {
            setShowTutorial(true);
          }
        })
        .catch((error) => {
          console.error("Failed to check tutorial status:", error);
        });
    }
  }, [session]);

  const startTutorial = () => setShowTutorial(true);
  const completeTutorial = () => setShowTutorial(false);
  const skipTutorial = () => setShowTutorial(false);

  return {
    showTutorial,
    startTutorial,
    completeTutorial,
    skipTutorial,
  };
}
