"use client";

import React from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Rich text editor component - placeholder implementation.
 * Replace with actual rich text editor library (e.g., TipTap, Slate).
 */
export default function RichTextEditor({
  value,
  onChange,
  className = "",
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-2xl ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[300px] resize-none bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none"
      />
    </div>
  );
}
