"use client";

import { useState } from "react";
import { countWords } from "@/lib/content-analyzer";

export function WordCounterTool() {
  const [text, setText] = useState("");

  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const words = countWords(text);
  const sentences = text
    .split(/[.!?。！？；;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean).length;
  // English reading time ~200 wpm; for CJK, ~300 chars/min.
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const readingMinutes =
    cjk > 0
      ? Math.max(1, Math.round(cjk / 300))
      : Math.max(words > 0 ? 1 : 0, Math.round(words / 200));

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        Type or paste your text
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing…"
        className="w-full h-52 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />

      <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Words" value={words} />
        <Stat label="Characters" value={chars} />
        <Stat label="Chars (no spaces)" value={charsNoSpaces} />
        <Stat label="Sentences" value={sentences} />
        <Stat label="Paragraphs" value={paragraphs} />
        <Stat label="Read time" value={`${readingMinutes} min`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-center">
      <div className="text-xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
