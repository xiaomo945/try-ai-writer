"use client";

import { useState, useEffect } from "react";

interface TypewriterEffectProps {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export function TypewriterEffect({
  texts,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseDuration = 2000,
  className = "",
}: TypewriterEffectProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (isPaused) {
      timeoutId = setTimeout(() => {
        setIsPaused(false);
        setIsTyping(false);
      }, pauseDuration);
    } else if (isTyping) {
      const currentFullText = texts[currentTextIndex];
      if (currentFullText && currentText.length < currentFullText.length) {
        timeoutId = setTimeout(() => {
          setCurrentText(currentFullText.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        setIsPaused(true);
      }
    } else {
      if (currentText.length > 0) {
        timeoutId = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deletingSpeed);
      } else {
        setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        setIsTyping(true);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentText, currentTextIndex, isTyping, isPaused, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <div className={`font-mono ${className}`}>
      <span className="text-slate-500">{currentText}</span>
      <span className="inline-block w-0.5 h-5 bg-emerald-500 ml-0.5 animate-pulse" />
    </div>
  );
}
