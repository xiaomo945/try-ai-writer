"use client";

import { useState, useEffect, useRef } from "react";

interface Tooltip {
  id: string;
  title: string;
  content: string;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right";
  shown: boolean;
}

interface FeatureTooltipProps {
  tooltipId: string;
  title: string;
  content: string;
  targetSelector: string;
  position?: "top" | "bottom" | "left" | "right";
  trigger?: "hover" | "click" | "auto";
  onDismiss?: () => void;
}

export function FeatureTooltip({
  tooltipId,
  title,
  content,
  targetSelector,
  position = "top",
  trigger = "hover",
  onDismiss,
}: FeatureTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const targetRef = useRef<Element | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if tooltip was already shown
    const shownTooltips = localStorage.getItem("shownTooltips");
    const shown = shownTooltips ? JSON.parse(shownTooltips) : [];
    
    if (shown.includes(tooltipId)) {
      return;
    }

    // Find target element
    const target = document.querySelector(targetSelector);
    if (!target) return;

    targetRef.current = target;

    const updatePosition = () => {
      const rect = target.getBoundingClientRect();
      setTargetPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    if (trigger === "auto") {
      setIsVisible(true);
    } else if (trigger === "hover") {
      target.addEventListener("mouseenter", () => setIsVisible(true));
      target.addEventListener("mouseleave", () => setIsVisible(false));
    } else if (trigger === "click") {
      target.addEventListener("click", () => setIsVisible(!isVisible));
    }

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [tooltipId, targetSelector, trigger]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Mark as shown
    const shownTooltips = localStorage.getItem("shownTooltips");
    const shown = shownTooltips ? JSON.parse(shownTooltips) : [];
    if (!shown.includes(tooltipId)) {
      shown.push(tooltipId);
      localStorage.setItem("shownTooltips", JSON.stringify(shown));
    }

    onDismiss?.();
  };

  if (!isVisible) return null;

  // Calculate tooltip position
  let tooltipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 1000,
  };

  switch (position) {
    case "top":
      tooltipStyle = {
        ...tooltipStyle,
        top: targetPosition.top - 10,
        left: targetPosition.left + targetPosition.width / 2,
        transform: "translate(-50%, -100%)",
      };
      break;
    case "bottom":
      tooltipStyle = {
        ...tooltipStyle,
        top: targetPosition.top + targetPosition.height + 10,
        left: targetPosition.left + targetPosition.width / 2,
        transform: "translate(-50%, 0)",
      };
      break;
    case "left":
      tooltipStyle = {
        ...tooltipStyle,
        top: targetPosition.top + targetPosition.height / 2,
        left: targetPosition.left - 10,
        transform: "translate(-100%, -50%)",
      };
      break;
    case "right":
      tooltipStyle = {
        ...tooltipStyle,
        top: targetPosition.top + targetPosition.height / 2,
        left: targetPosition.left + targetPosition.width + 10,
        transform: "translate(0, -50%)",
      };
      break;
  }

  return (
    <div ref={tooltipRef} style={tooltipStyle}>
      <div className="bg-gray-900 text-white rounded-lg shadow-xl p-4 max-w-xs">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-sm">{title}</h4>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors ml-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-300">{content}</p>
        
        {/* Arrow */}
        <div
          className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
          style={{
            ...(position === "top" && { bottom: -4, left: "50%", transform: "translateX(-50%) rotate(45deg)" }),
            ...(position === "bottom" && { top: -4, left: "50%", transform: "translateX(-50%) rotate(45deg)" }),
            ...(position === "left" && { right: -4, top: "50%", transform: "translateY(-50%) rotate(45deg)" }),
            ...(position === "right" && { left: -4, top: "50%", transform: "translateY(-50%) rotate(45deg)" }),
          }}
        />
      </div>
    </div>
  );
}

export function useFeatureTooltips() {
  const [tooltips, setTooltips] = useState<Tooltip[]>([]);

  useEffect(() => {
    // Load tooltips from API or define them here
    setTooltips([
      {
        id: "write_button",
        title: "开始写作",
        content: "点击这里开始您的AI创作之旅",
        targetSelector: "#write-button",
        position: "bottom",
        shown: false,
      },
      {
        id: "template_selector",
        title: "选择模板",
        content: "从丰富的模板库中选择适合您需求的模板",
        targetSelector: "#template-selector",
        position: "right",
        shown: false,
      },
      {
        id: "brand_voice",
        title: "品牌声音",
        content: "创建专属的品牌声音，让AI生成的内容更符合您的风格",
        targetSelector: "#brand-voice-button",
        position: "bottom",
        shown: false,
      },
    ]);
  }, []);

  return { tooltips };
}
