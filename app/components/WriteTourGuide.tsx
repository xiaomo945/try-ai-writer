"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight, X } from "lucide-react";

interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "mode-selector",
    target: "[data-onboarding='mode-selector']",
    title: "选择写作类型",
    description: "AI会自动调整风格来匹配你的选择",
    position: "bottom",
  },
  {
    id: "creative-assistant",
    target: "[data-onboarding='creative-assistant']",
    title: "开启创意助手",
    description: "打开它，AI会学习你的写作习惯并记住你的想法",
    position: "bottom",
  },
  {
    id: "generate-button",
    target: "[data-onboarding='generate-button']",
    title: "开始生成",
    description: "输入想法，点击这里或按 Ctrl+Enter 开始",
    position: "top",
  },
];

function getElementPosition(element: Element | null): DOMRect | null {
  if (!element) return null;
  return element.getBoundingClientRect();
}

function isInViewport(rect: DOMRect): boolean {
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function WriteTourGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasCompletedTour = localStorage.getItem("write_tour_done");
    if (hasCompletedTour) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const currentTourStep = TOUR_STEPS[currentStep];
      if (!currentTourStep) return;

      const target = document.querySelector(currentTourStep.target);
      if (target) {
        const rect = getElementPosition(target);
        if (rect && isInViewport(rect)) {
          setTargetRect(rect);
        } else {
          setTargetRect(null);
        }
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isVisible, currentStep]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("write_tour_done", "true");
  };

  if (!isVisible || !targetRect) return null;

  const currentTourStep = TOUR_STEPS[currentStep];
  if (!currentTourStep) return null;

  const getTooltipPosition = () => {
    const rect = targetRect;
    const tooltipWidth = 280;
    const tooltipHeight = 120;
    const offset = 16;

    let top = 0;
    let left = 0;

    switch (currentTourStep.position) {
      case "bottom":
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "top":
        top = rect.top - tooltipHeight - offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - offset;
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + offset;
        break;
    }

    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
    top = Math.max(80, Math.min(top, window.innerHeight - tooltipHeight - 16));

    return { top, left };
  };

  const tooltipPosition = getTooltipPosition();
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      <div 
        className="absolute bg-black/60 backdrop-blur-sm transition-all duration-300"
        style={{
          clipPath: `polygon(
            ${targetRect.left - 8}px ${targetRect.top - 8}px,
            ${targetRect.right + 8}px ${targetRect.top - 8}px,
            ${targetRect.right + 8}px ${targetRect.bottom + 8}px,
            ${targetRect.left - 8}px ${targetRect.bottom + 8}px,
            ${targetRect.left - 8}px ${targetRect.top - 8}px
          )`,
        }}
      />

      <div 
        className="absolute w-10 h-10 border-4 border-emerald-500 rounded-lg animate-pulse pointer-events-none"
        style={{
          top: targetRect.top - 12,
          left: targetRect.left - 12,
          width: targetRect.width + 24,
          height: targetRect.height + 24,
          boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.3)",
        }}
      />

      <div
        className="absolute z-[101] pointer-events-auto"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: 280,
        }}
      >
        <div className="bg-white dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-emerald-500/30 rounded-2xl p-4 shadow-2xl shadow-emerald-500/10">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-400 text-sm font-bold">
                  {currentStep + 1}
                </span>
              </div>
              <h4 className="font-display font-bold text-slate-900 dark:text-white">
                {currentTourStep.title}
              </h4>
            </div>
            <button
              onClick={handleSkip}
              className="text-slate-400 dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 -mt-2"
              aria-label="Skip tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
            {currentTourStep.description}
          </p>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors min-h-[36px]"
            >
              {currentStep < TOUR_STEPS.length - 1 ? (
                <>
                  下一步
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                "完成"
              )}
            </button>
          </div>

          <div className="flex justify-center gap-1.5 mt-3">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-emerald-500 w-3"
                    : index < currentStep
                    ? "bg-emerald-500/50"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>

        <div 
          className={`absolute w-3 h-3 bg-white dark:bg-gray-900/95 border-gray-200 dark:border-emerald-500/30 rotate-45 ${
            currentTourStep.position === "bottom" ? "-top-1.5 left-1/2 -translate-x-1/2 border-b border-r" : ""
          } ${
            currentTourStep.position === "top" ? "-bottom-1.5 left-1/2 -translate-x-1/2 border-t border-l" : ""
          }`}
        />
      </div>
    </div>
  );
}
