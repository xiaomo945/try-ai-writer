"use client";

import { useState } from "react";
import { optimizePrompt, type OptimizeMode } from "@/lib/prompt-optimizer";

const MODES: { value: OptimizeMode; label: string }[] = [
  { value: "blog", label: "Blog post" },
  { value: "email", label: "Email" },
  { value: "social", label: "Social post" },
  { value: "custom", label: "Custom" },
  { value: "fiction", label: "Fiction" },
];

export function PromptOptimizerTool() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<OptimizeMode>("blog");
  const [result, setResult] = useState<ReturnType<typeof optimizePrompt> | null>(
    null
  );

  const run = () => setResult(optimizePrompt(prompt, mode, null));

  const copy = () => {
    if (result?.optimized) navigator.clipboard?.writeText(result.optimized);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          What are you writing?
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as OptimizeMode)}
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white"
        >
          {MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Paste a rough prompt, e.g. 'write a blog post about remote work'"
        className="w-full h-40 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-sm text-slate-900 dark:text-white resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <div className="mt-3 flex items-center gap-3">
        <button onClick={run} className="btn-primary text-sm min-h-[44px] px-6">
          Optimize my prompt
        </button>
        {result && result.optimized && (
          <button onClick={copy} className="btn-outline text-sm min-h-[44px] px-6">
            Copy result
          </button>
        )}
      </div>

      {result && (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Prompt completeness
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {result.score}/100
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>

          {result.issues.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Missing details ({result.issues.length})
              </div>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {result.issues
                  .filter((i) => !i.autoFilled)
                  .map((i) => (
                    <li key={i.id} className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                      <span className="font-medium text-amber-800 dark:text-amber-300">
                        {i.label}:{" "}
                      </span>
                      {i.advice}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {result.applied.length > 0 && (
            <div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Auto-applied
              </div>
              <ul className="flex flex-wrap gap-2">
                {result.applied.map((a, i) => (
                  <li
                    key={i}
                    className="px-2.5 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  >
                    ✓ {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Optimized prompt
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 dark:bg-black p-4 text-xs text-slate-100 overflow-x-auto">
              {result.optimized}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
