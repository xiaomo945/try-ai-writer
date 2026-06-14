"use client";

import { useMemo } from "react";

interface LineNumbersProps {
  text: string;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function LineNumbers({ text, containerRef }: LineNumbersProps) {
  const lines = useMemo(() => {
    if (!text) return ["1"];
    return text.split("\n").map((_, index) => String(index + 1));
  }, [text]);

  return (
    <div
      ref={containerRef}
      className="hidden lg:flex flex-col select-none text-xs text-slate-500 font-mono leading-6 px-3 py-4 border-r border-white/10 bg-white/5"
      aria-hidden="true"
    >
      {lines.map((lineNumber, index) => (
        <div
          key={index}
          className="h-6 flex items-center justify-end min-w-[2rem]"
        >
          {lineNumber}
        </div>
      ))}
    </div>
  );
}
