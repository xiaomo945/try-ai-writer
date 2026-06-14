"use client";

import React from "react";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

/**
 * Markdown preview component - placeholder implementation.
 * Replace with actual markdown rendering library (e.g., react-markdown).
 */
export default function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <div className="whitespace-pre-wrap">{content}</div>
    </div>
  );
}
