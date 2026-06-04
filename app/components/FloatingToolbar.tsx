"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface FloatingToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onFormat: (formatType: "bold" | "italic" | "quote" | "code") => void;
}

export function FloatingToolbar({ textareaRef, onFormat }: FloatingToolbarProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return null;
  }

  const updatePosition = useCallback(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const selection = window.getSelection();
    
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      setPosition(null);
      return;
    }

    setPosition({
      x: rect.left + rect.width / 2 - 100, // center horizontally
      y: rect.top - 60, // above the selection
    });
  }, [textareaRef]);

  useEffect(() => {
    const handleSelectionChange = () => {
      updatePosition();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("scroll", updatePosition, true);
    
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!position) return null;

  return (
    <div
      ref={toolbarRef}
      onClick={handleClick}
      className="fixed z-50 flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 shadow-xl"
      style={{
        left: Math.max(10, position.x),
        top: Math.max(10, position.y),
      }}
    >
      <button
        onClick={() => onFormat("bold")}
        className="p-2 hover:bg-slate-800 rounded-lg text-white font-bold transition-colors min-h-[36px] min-w-[36px]"
        title="Bold"
      >
        B
      </button>
      <button
        onClick={() => onFormat("italic")}
        className="p-2 hover:bg-slate-800 rounded-lg text-white italic transition-colors min-h-[36px] min-w-[36px]"
        title="Italic"
      >
        I
      </button>
      <button
        onClick={() => onFormat("quote")}
        className="p-2 hover:bg-slate-800 rounded-lg text-white transition-colors min-h-[36px] min-w-[36px]"
        title="Quote"
      >
        “
      </button>
      <button
        onClick={() => onFormat("code")}
        className="p-2 hover:bg-slate-800 rounded-lg text-white font-mono transition-colors min-h-[36px] min-w-[36px]"
        title="Code"
      >
        `
      </button>
    </div>
  );
}
