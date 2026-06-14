"use client";

import { useEffect, useRef } from "react";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  scrollRatio?: number;
}

export function MarkdownPreview({ content, className, scrollRatio }: MarkdownPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll sync with requestAnimationFrame
  useEffect(() => {
    if (scrollRatio === undefined || !containerRef.current) return;

    let ticking = false;
    const container = containerRef.current;
    const maxScroll = container.scrollHeight - container.clientHeight;

    const updateScroll = () => {
      const targetScrollTop = scrollRatio * maxScroll;
      container.scrollTop = targetScrollTop;
      ticking = false;
    };

    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, [scrollRatio]);

  const renderMarkdown = (text: string) => {
    let html = text
      // Escape HTML first
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Code blocks (```)
      .replace(/```([\s\S]*?)```/g, (_, code) => 
        `<pre class="bg-slate-800 p-4 rounded-lg text-slate-200 font-mono text-sm overflow-x-auto my-4">
          <code>${code.trim()}</code>
        </pre>`
      )
      // Inline code (`)
      .replace(/`([^`]+)`/g, (_, code) => 
        `<code class="bg-slate-700 px-2 py-1 rounded text-emerald-300 font-mono text-sm">${code}</code>`
      )
      // Bold (**)
      .replace(/\*\*([^*]+)\*\*/g, (_, text) => 
        `<strong class="font-bold">${text}</strong>`
      )
      // Italic (*)
      .replace(/\*([^*]+)\*/g, (_, text) => 
        `<em class="italic">${text}</em>`
      )
      // H1 (#)
      .replace(/^# (.*)$/gm, (_, text) => 
        `<h1 class="text-3xl font-bold text-emerald-400 mb-4 mt-6">${text}</h1>`
      )
      // H2 (##)
      .replace(/^## (.*)$/gm, (_, text) => 
        `<h2 class="text-2xl font-bold text-slate-100 mb-3 mt-5">${text}</h2>`
      )
      // H3 (###)
      .replace(/^### (.*)$/gm, (_, text) => 
        `<h3 class="text-xl font-bold text-slate-200 mb-2 mt-4">${text}</h3>`
      )
      // H4-H6
      .replace(/^#### (.*)$/gm, (_, text) => 
        `<h4 class="text-lg font-semibold text-slate-300 mb-2 mt-3">${text}</h4>`
      )
      .replace(/^##### (.*)$/gm, (_, text) => 
        `<h5 class="text-base font-semibold text-slate-300 mb-2 mt-3">${text}</h5>`
      )
      .replace(/^###### (.*)$/gm, (_, text) => 
        `<h6 class="text-sm font-semibold text-slate-400 mb-2 mt-3">${text}</h6>`
      )
      // Links ([text](url))
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (_, text, url) => 
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-emerald-500 hover:text-emerald-400 underline underline-offset-2 transition-colors">${text}</a>`
      )
      // Unordered lists (- item)
      .replace(/^- (.*)$/gm, (_, text) => 
        `<li class="ml-6 text-slate-200 mb-1">${text}</li>`
      )
      // Ordered lists (1. item)
      .replace(/^(\d+)\. (.*)$/gm, (_, num, text) => 
        `<li class="ml-6 text-slate-200 mb-1 list-decimal">${text}</li>`
      )
      // Blockquotes (> text)
      .replace(/^> (.*)$/gm, (_, text) => 
        `<blockquote class="border-l-4 border-emerald-500 pl-4 my-4 text-slate-300 italic">${text}</blockquote>`
      )
      // Paragraphs (split by double newlines)
      .replace(/\n\n/g, "</p><p class=\"text-slate-200 leading-relaxed mb-3\">");

    // Wrap in <p> tags
    html = `<p class="text-slate-200 leading-relaxed mb-3">${html}</p>`;
    
    return html;
  };

  return (
    <div
      ref={containerRef}
      className={`glass-card p-6 overflow-y-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
