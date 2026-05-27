"use client";

import { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface TooltipStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
}

const steps: TooltipStep[] = [
  {
    id: "mode-selector",
    title: "选择你的写作模式",
    description: "先选择你的写作类型，AI会自动调整风格来适配不同场景",
    targetSelector: "[data-onboarding='mode-selector']",
  },
  {
    id: "creative-assistant",
    title: "打开创意助手",
    description: "让AI帮你理清思路，通过对话式交互生成更符合你需求的内容",
    targetSelector: "[data-onboarding='creative-assistant']",
  },
  {
    id: "generate-button",
    title: "开始生成内容",
    description: "输入你的想法，点击生成按钮或使用快捷键 Ctrl/Cmd + Enter",
    targetSelector: "[data-onboarding='generate-button']",
  },
];

export function OnboardingTooltip() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if onboarding is already completed
    const hasCompleted = localStorage.getItem("onboarding-completed");
    if (!hasCompleted) {
      // Wait a bit before showing
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    return;
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const step = steps[currentStep];
      if (!step) return;
      const target = document.querySelector(step.targetSelector);
      if (target && tooltipRef.current) {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        // Position tooltip below the target element
        const top = rect.bottom + window.scrollY + 16;
        const left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
        
        // Adjust for screen edges
        const adjustedLeft = Math.max(16, Math.min(left, window.innerWidth - tooltipRect.width - 16));
        
        setTooltipPosition({ top, left: adjustedLeft });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = () => {
    setIsVisible(false);
    localStorage.setItem("onboarding-completed", "true");
  };

  if (!isVisible) return null;

  const step = steps[currentStep];
  if (!step) return null;

  const targetElement = document.querySelector(step.targetSelector);
  const getTargetPosition = () => {
    if (!targetElement) return { top: 0, left: 0, width: 0, height: 0 };
    const rect = targetElement.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY - 8,
      left: rect.left + window.scrollX - 8,
      width: rect.width + 16,
      height: rect.height + 16,
    };
  };
  const targetPosition = getTargetPosition();

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={completeOnboarding} />
      
      {/* Highlight target */}
      {targetElement && (
        <div 
          className="fixed z-50 pointer-events-none border-2 border-emerald-500 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
          style={{
            top: targetPosition.top,
            left: targetPosition.left,
            width: targetPosition.width,
            height: targetPosition.height,
          }}
        />
      )}
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-2xl w-80"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Arrow pointing to target */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-900 border-l border-t border-gray-700 rotate-45" />
        
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                {currentStep + 1} / {steps.length}
              </span>
            </div>
            <h3 className="font-display font-extrabold text-white text-lg mb-1">
              {step.title}
            </h3>
            <p className="text-sm text-slate-400">
              {step.description}
            </p>
          </div>
          <button
            onClick={completeOnboarding}
            className="p-2 text-slate-500 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="btn-outline text-sm px-4 py-3 flex-1 flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              上一步
            </button>
          )}
          <button
            onClick={handleNext}
            className="btn-primary text-sm px-4 py-3 flex-1 flex items-center justify-center gap-2"
          >
            {currentStep < steps.length - 1 ? (
              <>
                下一步
                <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              "完成！"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
