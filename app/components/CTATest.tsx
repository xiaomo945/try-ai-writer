"use client";

import { useState, useEffect } from "react";
import { assignVariant, trackConversion } from "@/lib/ab-testing";
import { trackEvent } from "@/lib/analytics";

interface CTATestProps {
  originalText: string;
  variantTexts: string[];
  testId: string;
  onAction: () => void;
  className?: string;
}

export function CTATest({ 
  originalText, 
  variantTexts, 
  testId, 
  onAction, 
  className = "" 
}: CTATestProps) {
  const [currentText, setCurrentText] = useState(originalText);
  const [variant, setVariant] = useState<string>("control");

  useEffect(() => {
    // Assign A/B test variant
    const userId = "anonymous"; // In real app, get from session
    const assignedVariant = assignVariant(testId, userId) || "control";
    setVariant(assignedVariant);

    // Select text based on variant
    if (assignedVariant === "control") {
      setCurrentText(originalText);
    } else {
      const variantIndex = parseInt(assignedVariant.replace("variant", "")) - 1;
      if (variantIndex >= 0 && variantIndex < variantTexts.length) {
        const newText = variantTexts[variantIndex];
        if (newText) setCurrentText(newText);
      }
    }
  }, [testId, originalText, variantTexts]);

  const handleClick = () => {
    // Track CTA click
    trackEvent("cta_click", "conversion", { 
      testId, 
      variant, 
      text: currentText 
    });

    // Track conversion
    trackConversion(testId, variant, "anonymous", "cta_click");

    // Execute action
    onAction();
  };

  return (
    <button 
      onClick={handleClick} 
      className={`btn-primary ${className}`}
      data-testid={`cta-${testId}-${variant}`}
    >
      {currentText}
    </button>
  );
}
