"use client";

import { useState, useEffect } from "react";

const loadingTexts = [
  "> Learning your brand voice...",
  "> Analyzing writing patterns...",
  "> Generating creative content...",
  "> Polishing final output..."
];

export function AILoadingAnimation() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-12">
      <code className="font-mono text-sm md:text-base text-slate-400 relative">
        {loadingTexts[textIndex]}
        <span className="inline-block w-3 h-5 bg-white ml-1 align-middle animate-pulse" />
      </code>
    </div>
  );
}
